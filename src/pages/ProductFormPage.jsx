import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Check, SearchX } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { FormField } from '../components/common/FormField.jsx';
import { EmptyState, useToast } from '../components/common/States.jsx';
import { EcoScoreDial } from '../components/sustainability/EcoScoreDial.jsx';
import { ScoreBreakdown } from '../components/sustainability/ScoreBreakdown.jsx';
import { PageHead } from '../components/common/PageHead.jsx';
import { MODES, estimateLegCo2e, ESTIMATE_NOTE } from '../utils/carbon.js';
import { STATUS_LABELS, fmtKg } from '../utils/format.js';
import { newProductId, newTraceId, previewProduct } from '../services/productService.js';

const CATEGORIES = ['Bags', 'Home textiles', 'Home & office', 'Drinkware', 'Fitness', 'Packaging', 'Personal care', 'Apparel', 'Other'];
const STEPS = ['Basics', 'Materials', 'Suppliers', 'Production', 'Transport', 'Review'];
const MODE_PROVIDER = { road: 'p1', rail: 'p2', sea: 'p3', air: 'p8' };

const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);
const RAW_PRODUCT = ['id', 'traceId', 'name', 'category', 'batchNumber', 'origin', 'status', 'manufacturerId', 'unitsInBatch', 'shipmentTonnes', 'startDate', 'story'];
const RAW_STAGE = ['id', 'productId', 'order', 'stageName', 'location', 'organizationKind', 'organizationId', 'date', 'durationDays'];
const RAW_LEG = ['id', 'productId', 'fromStageId', 'toStageId', 'distanceKm', 'mode', 'providerId', 'co2eOverride'];
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

function emptyForm() {
  return { name: '', category: '', batchNumber: '', origin: '', unitsInBatch: '', story: '', materialLines: [{ materialId: '', quantityKg: '' }], manufacturerId: '', manufacturingLocation: '', productionDate: today(), status: 'planned', transport: { origin: '', destination: 'Bandarpada, Nav Sagarpur', mode: 'road', distanceKm: '', shipmentTonnes: '', override: false, co2e: '' } };
}

function formFromProduct(p) {
  const main = [...p.legs].sort((a, b) => b.distanceKm - a.distanceKm)[0];
  const mfg = p.stages.find((s) => s.stageName === 'manufacturing');
  return {
    name: p.name, category: p.category, batchNumber: p.batchNumber, origin: p.origin, unitsInBatch: String(p.unitsInBatch), story: p.story || '',
    materialLines: p.materials.map((m) => ({ materialId: m.id, quantityKg: String(m.quantityKg) })),
    manufacturerId: p.manufacturerId, manufacturingLocation: mfg?.location || '', productionDate: mfg?.date || p.startDate, status: p.status,
    transport: { origin: main?.from?.location || '', destination: main?.to?.location || '', mode: main?.mode || 'road', distanceKm: String(main?.distanceKm ?? ''), shipmentTonnes: String(p.shipmentTonnes), override: main?.co2eOverride != null, co2e: main?.co2eOverride != null ? String(main.co2eOverride) : '' },
  };
}

function buildPayload(form, graph, existing) {
  const id = existing?.id || newProductId();
  const t = form.transport;
  const tonnes = Number(t.shipmentTonnes);
  const legExtra = t.override && t.co2e !== '' ? { co2eOverride: Number(t.co2e) } : {};
  const materialLines = form.materialLines.map((l) => ({ materialId: l.materialId, quantityKg: Number(l.quantityKg) }));
  const product = {
    ...(existing ? pick(existing, RAW_PRODUCT) : { id, traceId: newTraceId() }),
    id, name: form.name.trim(), category: form.category, batchNumber: form.batchNumber.trim(), origin: form.origin.trim(),
    status: form.status, manufacturerId: form.manufacturerId, unitsInBatch: Number(form.unitsInBatch), shipmentTonnes: tonnes, startDate: form.productionDate,
    story: form.story.trim() || `Made in ${form.origin.trim()} from ${form.materialLines.map((l) => graph.materials.find((m) => m.id === l.materialId)?.name).filter(Boolean).join(', ').toLowerCase()}.`,
  };

  if (existing) {
    const main = [...existing.legs].sort((a, b) => b.distanceKm - a.distanceKm)[0];
    const stages = existing.stages.map((s) => {
      const raw = pick(s, RAW_STAGE);
      if (s.stageName === 'manufacturing') return { ...raw, location: form.manufacturingLocation.trim(), organizationId: form.manufacturerId, date: form.productionDate };
      if (main && s.id === main.fromStageId) return { ...raw, location: t.origin.trim() };
      if (main && s.id === main.toStageId) return { ...raw, location: t.destination.trim() };
      return raw;
    });
    const legs = existing.legs.map((l) => {
      const raw = pick(l, RAW_LEG);
      if (main && l.id === main.id) { const { co2eOverride, ...rest } = raw; return { ...rest, distanceKm: Number(t.distanceKm), mode: t.mode, providerId: MODE_PROVIDER[t.mode], ...legExtra }; }
      return raw;
    });
    return { product, materialLines, stages, legs };
  }

  const firstMat = graph.materials.find((m) => m.id === form.materialLines[0].materialId);
  const mkSup = graph.suppliers.find((s) => s.id === firstMat.supplierId);
  const specs = [
    ['source', firstMat.origin, 'supplier', firstMat.supplierId, 5],
    ['supplier', mkSup.location, 'supplier', firstMat.supplierId, 5],
    ['manufacturing', form.manufacturingLocation.trim(), 'supplier', form.manufacturerId, 10],
    ['transportation', t.origin.trim(), 'provider', MODE_PROVIDER[t.mode], 3],
    ['warehouse', t.destination.trim(), 'provider', 'p7', 5],
  ];
  let cursor = addDays(form.productionDate, -10);
  const stages = specs.map(([stageName, location, organizationKind, organizationId, durationDays], i) => {
    const row = { id: `${id}-st${i}`, productId: id, order: i, stageName, location, organizationKind, organizationId, date: cursor, durationDays };
    cursor = addDays(cursor, durationDays);
    return row;
  });
  const legs = [{ id: `${id}-lg0`, productId: id, fromStageId: stages[3].id, toStageId: stages[4].id, distanceKm: Number(t.distanceKm), mode: t.mode, providerId: MODE_PROVIDER[t.mode], ...legExtra }];
  return { product, materialLines, stages, legs };
}

function validate(step, f, graph) {
  const e = {};
  if (step === 0) {
    if (f.name.trim().length < 3) e.name = 'Enter a product name of at least 3 characters.';
    if (!f.category) e.category = 'Choose a category.';
    if (!/^[A-Za-z0-9-]{3,}$/.test(f.batchNumber.trim())) e.batchNumber = 'Use letters, numbers and hyphens only, at least 3 characters. Example: RC-2610-A.';
    if (!f.origin.trim()) e.origin = 'Enter where the product is manufactured, for example Sundarpur, India.';
    if (!(Number(f.unitsInBatch) > 0) || !Number.isInteger(Number(f.unitsInBatch))) e.unitsInBatch = 'Enter a whole number of units, greater than 0.';
  }
  if (step === 1) {
    const ids = f.materialLines.map((l) => l.materialId);
    f.materialLines.forEach((l, i) => {
      if (!l.materialId) e[`m${i}`] = 'Choose a material.';
      else if (ids.indexOf(l.materialId) !== i) e[`m${i}`] = 'This material is already in the list.';
      if (!(Number(l.quantityKg) > 0)) e[`q${i}`] = 'Enter a quantity above 0 kg.';
    });
  }
  if (step === 2 && !f.manufacturerId) e.manufacturerId = 'Choose the manufacturer that makes this product.';
  if (step === 3) {
    if (!f.manufacturingLocation.trim()) e.manufacturingLocation = 'Enter the factory location.';
    if (!f.productionDate) e.productionDate = 'Choose a production date.';
  }
  if (step === 4) {
    const t = f.transport;
    if (!t.origin.trim()) e.origin_t = 'Enter where the shipment leaves from.';
    if (!t.destination.trim()) e.destination_t = 'Enter where it is going.';
    if (!(Number(t.distanceKm) > 0)) e.distanceKm = 'Enter a distance above 0 km.';
    if (!(Number(t.shipmentTonnes) > 0)) e.shipmentTonnes = 'Enter the shipment weight above 0 tonnes.';
    if (t.override && (t.co2e === '' || Number(t.co2e) < 0)) e.co2e = 'Enter the emissions in kg CO₂e, or turn off the override.';
  }
  return e;
}

export default function ProductFormPage() {
  const { id } = useParams();
  const { graph, saveProduct } = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const existing = id ? graph.products.find((p) => p.id === id) : null;
  useDocumentTitle(existing ? `Edit ${existing.name}` : 'Add product');
  const [form, setForm] = useState(() => (existing ? formFromProduct(existing) : emptyForm()));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const manufacturers = graph.suppliers.filter((s) => s.type === 'manufacturer');
  const materialSuppliers = useMemo(() => [...new Map(form.materialLines.map((l) => graph.materials.find((m) => m.id === l.materialId)).filter(Boolean).map((m) => [m.supplierId, m.supplier])).values()], [form.materialLines, graph]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setT = (k, v) => setForm((f) => ({ ...f, transport: { ...f.transport, [k]: v } }));
  const setLine = (i, k, v) => setForm((f) => ({ ...f, materialLines: f.materialLines.map((l, j) => (j === i ? { ...l, [k]: v } : l)) }));

  if (id && !existing) return <EmptyState icon={SearchX} title="We could not find that product" action={{ label: 'Back to products', to: '/products' }}>It may have been removed.</EmptyState>;

  const t = form.transport;
  const autoCo2e = estimateLegCo2e(Number(t.distanceKm) || 0, Number(t.shipmentTonnes) || 0, t.mode);

  const next = () => { const e = validate(step, form, graph); setErrors(e); if (Object.keys(e).length === 0) { setStep((s) => s + 1); window.scrollTo({ top: 0 }); } };
  const back = () => { setErrors({}); setStep((s) => s - 1); };
  const goTo = (i) => { if (i < step) { setErrors({}); setStep(i); } };

  const preview = step === 5 ? previewProduct(buildPayload(form, graph, existing)) : null;

  const save = async () => {
    for (let s = 0; s < 5; s++) { const e = validate(s, form, graph); if (Object.keys(e).length) { setErrors(e); setStep(s); return; } }
    setSaving(true); setSaveError('');
    try {
      const pid = await saveProduct(buildPayload(form, graph, existing));
      toast(existing ? 'Product saved' : 'Product added');
      navigate(`/products/${pid}`);
    } catch (err) { setSaveError(err.message); setSaving(false); }
  };

  return (
    <>
      <PageHead title={existing ? `Edit ${existing.name}` : 'Add a product'}>Five short steps, then a review. Nothing is saved until the last step.</PageHead>

      <ol className="stepper" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? 'is-current' : i < step ? 'is-done' : ''} aria-current={i === step ? 'step' : undefined}>
            <button type="button" onClick={() => goTo(i)} disabled={i >= step} className="stepper__btn">
              <span className="stepper__n num">{i < step ? <Check size={14} aria-label="completed" /> : i + 1}</span><span className="stepper__label">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      <form className="formstep" onSubmit={(e) => { e.preventDefault(); step < 5 ? next() : save(); }} noValidate>
        {step === 0 && (
          <div className="row">
            <div className="col-lg-8"><FormField label="Product name" value={form.name} onChange={set('name')} error={errors.name} required /></div>
            <div className="col-lg-4"><FormField as="select" label="Category" value={form.category} onChange={set('category')} error={errors.category} required><option value="">Choose a category</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</FormField></div>
            <div className="col-lg-4"><FormField label="Batch number" value={form.batchNumber} onChange={set('batchNumber')} error={errors.batchNumber} hint="Example: RC-2610-A" required /></div>
            <div className="col-lg-5"><FormField label="Manufacturing origin" value={form.origin} onChange={set('origin')} error={errors.origin} hint="City and country" required /></div>
            <div className="col-lg-3"><FormField label="Units in batch" type="number" min="1" value={form.unitsInBatch} onChange={set('unitsInBatch')} error={errors.unitsInBatch} required /></div>
            <div className="col-12"><FormField as="textarea" label="Story for customers" value={form.story} onChange={set('story')} hint="Optional. One or two plain sentences shown on the public passport." /></div>
          </div>
        )}

        {step === 1 && (
          <>
            {form.materialLines.map((l, i) => {
              const m = graph.materials.find((x) => x.id === l.materialId);
              return (
                <div className="matline" key={i}>
                  <div className="matline__sel"><FormField as="select" label={`Material ${i + 1}`} value={l.materialId} onChange={(e) => setLine(i, 'materialId', e.target.value)} error={errors[`m${i}`]}><option value="">Choose a material</option>{graph.materials.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</FormField></div>
                  <div className="matline__qty"><FormField label="Quantity (kg)" type="number" min="0" value={l.quantityKg} onChange={(e) => setLine(i, 'quantityKg', e.target.value)} error={errors[`q${i}`]} /></div>
                  <div className="matline__info meta">{m ? <>{m.recycledPercentage}% recycled<br />{m.supplier?.name}</> : 'Recycled share and supplier appear here.'}</div>
                  <button type="button" className="btn btn-quiet btn-sm matline__rm" onClick={() => setForm((f) => ({ ...f, materialLines: f.materialLines.filter((_, j) => j !== i) }))} disabled={form.materialLines.length === 1} aria-label={`Remove material ${i + 1}`}><Trash2 size={16} /></button>
                </div>
              );
            })}
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setForm((f) => ({ ...f, materialLines: [...f.materialLines, { materialId: '', quantityKg: '' }] }))}><Plus size={16} aria-hidden="true" />Add another material</button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="row"><div className="col-lg-6"><FormField as="select" label="Manufacturer" value={form.manufacturerId} onChange={set('manufacturerId')} error={errors.manufacturerId} required hint="The supplier that makes the finished product."><option value="">Choose a manufacturer</option>{manufacturers.map((s) => <option key={s.id} value={s.id}>{s.name}, {s.location.split(',').slice(-2)[0].trim()}</option>)}</FormField></div></div>
            <h2 className="mt-3 mb-2">Material suppliers</h2>
            <p className="muted">Taken from the materials you chose. To change them, go back to Materials.</p>
            <ul className="plain-list">{materialSuppliers.map((s) => <li key={s.id}><div><strong>{s.name}</strong><span className="meta d-block">{s.location}</span></div><span className="meta">{s.verificationStatus === 'verified' ? 'Verified' : s.verificationStatus === 'pending' ? 'Pending verification' : 'Needs review'}</span></li>)}</ul>
          </>
        )}

        {step === 3 && (
          <div className="row">
            <div className="col-lg-6"><FormField label="Manufacturing location" value={form.manufacturingLocation} onChange={set('manufacturingLocation')} error={errors.manufacturingLocation} required /></div>
            <div className="col-lg-3"><FormField label="Production date" type="date" value={form.productionDate} onChange={set('productionDate')} error={errors.productionDate} required /></div>
            <div className="col-lg-3"><FormField as="select" label="Production status" value={form.status} onChange={set('status')}>{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</FormField></div>
          </div>
        )}

        {step === 4 && (
          <div className="row">
            <div className="col-lg-6"><FormField label="Leaves from" value={t.origin} onChange={(e) => setT('origin', e.target.value)} error={errors.origin_t} required /></div>
            <div className="col-lg-6"><FormField label="Arrives at" value={t.destination} onChange={(e) => setT('destination', e.target.value)} error={errors.destination_t} required /></div>
            <div className="col-lg-3"><FormField as="select" label="Transport mode" value={t.mode} onChange={(e) => setT('mode', e.target.value)}>{Object.entries(MODES).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}</FormField></div>
            <div className="col-lg-3"><FormField label="Distance (km)" type="number" min="0" value={t.distanceKm} onChange={(e) => setT('distanceKm', e.target.value)} error={errors.distanceKm} required /></div>
            <div className="col-lg-3"><FormField label="Shipment weight (tonnes)" type="number" min="0" step="0.1" value={t.shipmentTonnes} onChange={(e) => setT('shipmentTonnes', e.target.value)} error={errors.shipmentTonnes} required /></div>
            <div className="col-lg-3">
              <FormField label="Estimated CO₂e (kg)" type="number" min="0" value={t.override ? t.co2e : autoCo2e} onChange={(e) => setT('co2e', e.target.value)} readOnly={!t.override} error={errors.co2e} hint={t.override ? 'Your own figure.' : 'Calculated from distance, weight and mode.'} />
            </div>
            <div className="col-12">
              <div className="form-check mb-2"><input id="ovr" className="form-check-input" type="checkbox" checked={t.override} onChange={(e) => { setT('override', e.target.checked); if (e.target.checked && t.co2e === '') setT('co2e', String(autoCo2e)); }} /><label htmlFor="ovr" className="form-check-label">Use my own emissions figure</label></div>
              <p className="meta">{ESTIMATE_NOTE}</p>
            </div>
          </div>
        )}

        {step === 5 && preview && (
          <div className="review">
            <div className="review__score"><EcoScoreDial score={preview.ecoScore} band={preview.eco.band} /><p className="meta mt-2 mb-0">Predicted eco score</p></div>
            <dl className="facts review__facts">
              <div><dt>Product</dt><dd>{preview.name}, {preview.category}</dd></div>
              <div><dt>Batch</dt><dd className="mono">{preview.batchNumber}, {preview.unitsInBatch.toLocaleString('en-IN')} units</dd></div>
              <div><dt>Made in</dt><dd>{preview.origin} by {preview.manufacturer?.name}</dd></div>
              <div><dt>Materials</dt><dd>{preview.materials.map((m) => `${m.name} (${m.quantityKg} kg)`).join(', ')}</dd></div>
              <div><dt>Production</dt><dd>{STATUS_LABELS[preview.status]}, from {preview.startDate}</dd></div>
              <div><dt>Transport</dt><dd>{preview.legs.map((l) => `${l.distanceKm} km by ${MODES[l.mode].label.toLowerCase()}, ${fmtKg(l.co2e)} CO₂e (estimate)`).join('; ')}</dd></div>
            </dl>
            <div className="review__why"><h2 className="mb-2">Why this score</h2><ScoreBreakdown factors={preview.eco.factors} /></div>
          </div>
        )}

        {saveError && <div className="alert-t alert-t--danger mt-3" role="alert">{saveError}</div>}
        <div className="formstep__nav">
          {step > 0 ? <button type="button" className="btn btn-quiet" onClick={back} disabled={saving}>Back</button> : <Link className="btn btn-quiet" to={existing ? `/products/${existing.id}` : '/products'}>Cancel</Link>}
          {step < 5 ? <button className="btn btn-primary" type="submit">Continue</button> : <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving product' : existing ? 'Save changes' : 'Save product'}</button>}
        </div>
        {Object.keys(errors).length > 0 && <p className="invalid-feedback d-block mt-2" role="alert">Fix the highlighted fields to continue.</p>}
      </form>
    </>
  );
}
