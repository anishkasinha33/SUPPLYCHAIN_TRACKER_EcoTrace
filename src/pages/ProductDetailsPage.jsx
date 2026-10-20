import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil, QrCode, Waypoints, Trash2, SearchX } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { ProductArt } from '../components/charts/ProductArt.jsx';
import { CompositionBar } from '../components/charts/CompositionBar.jsx';
import { EmissionsBar } from '../components/charts/EmissionsBar.jsx';
import { EcoScoreDial } from '../components/sustainability/EcoScoreDial.jsx';
import { ScoreBreakdown, MetricBlock } from '../components/sustainability/ScoreBreakdown.jsx';
import { LegTable } from '../components/pipeline/LegTable.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { Tabs, TabPanel } from '../components/common/Tabs.jsx';
import { Modal } from '../components/common/Modal.jsx';
import { EmptyState, useToast } from '../components/common/States.jsx';
import { Badge, EcoChip, FairLaborBadge, ProductStatusBadge, StageStatusBadge, VerificationBadge } from '../components/common/Badge.jsx';
import { STAGE_LABELS, fmtDate, fmtKg, fmtPct } from '../utils/format.js';
import { seedProductIds } from '../services/db.js';

const TIER = { strong: ['success', 'Strong'], moderate: ['warning', 'Moderate'], weak: ['danger', 'Weak'] };

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { graph, removeProduct } = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('journey');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const p = graph.products.find((x) => x.id === id);
  useDocumentTitle(p?.name || 'Product not found');

  if (!p) return <EmptyState icon={SearchX} title="We could not find that product" action={{ label: 'Back to products', to: '/products' }}>It may have been removed, or the link is wrong.</EmptyState>;

  const canDelete = !seedProductIds.has(p.id);
  const del = async () => { setBusy(true); try { await removeProduct(p.id); toast('Product deleted'); navigate('/products'); } catch (e) { toast(e.message, 'error'); setBusy(false); setConfirm(false); } };

  const matCols = [
    { key: 'name', label: 'Material', primary: true, render: (m) => m.name },
    { key: 'qty', label: 'Quantity', render: (m) => <span className="num">{m.quantityKg} kg</span> },
    { key: 'origin', label: 'Origin' },
    { key: 'rec', label: 'Recycled', render: (m) => <span className="num">{m.recycledPercentage}%</span> },
    { key: 'tier', label: 'Sustainability', render: (m) => <Badge tone={TIER[m.tier][0]}>{TIER[m.tier][1]}</Badge> },
    { key: 'supplier', label: 'Supplier', render: (m) => <Link to={`/suppliers/${m.supplierId}`}>{m.supplier?.name}</Link> },
  ];
  const supCols = [
    { key: 'name', label: 'Supplier', primary: true, render: (s) => s.name },
    { key: 'role', label: 'Role', render: (s) => (s.id === p.manufacturerId ? 'Manufacturer' : 'Materials') },
    { key: 'location', label: 'Location' },
    { key: 'ver', label: 'Verification', render: (s) => <VerificationBadge status={s.verificationStatus} /> },
    { key: 'fair', label: 'Fair labour', render: (s) => <FairLaborBadge status={s.fairLabor} /> },
    { key: 'certs', label: 'Certifications', render: (s) => { const c = graph.suppliers.find((x) => x.id === s.id)?.certifications || []; return c.length ? c.map((x) => x.name).join(', ') : <span className="muted">None on record</span>; } },
  ];

  return (
    <>
      <header className="pdetail">
        <div className="pdetail__art"><ProductArt product={p} /></div>
        <div className="pdetail__main">
          <p className="meta m-0">{p.category}</p>
          <h1>{p.name}</h1>
          <dl className="facts facts--inline">
            <div><dt>Traceability ID</dt><dd className="mono">{p.traceId}</dd></div>
            <div><dt>Batch</dt><dd className="mono">{p.batchNumber}</dd></div>
            <div><dt>Made in</dt><dd>{p.origin}</dd></div>
            <div><dt>Units</dt><dd className="num">{p.unitsInBatch.toLocaleString('en-IN')}</dd></div>
          </dl>
          <div className="pdetail__badges"><ProductStatusBadge status={p.status} /><VerificationBadge status={p.supplierStatus} /><EcoChip score={p.ecoScore} band={p.eco.band} /></div>
        </div>
        <div className="pdetail__actions">
          <Link className="btn btn-primary" to={`/products/${p.id}/edit`}><Pencil size={16} aria-hidden="true" />Edit</Link>
          <Link className="btn btn-outline-primary" to={`/pipeline?product=${p.id}`}><Waypoints size={16} aria-hidden="true" />Pipeline</Link>
          <Link className="btn btn-outline-primary" to={`/consumer-view?product=${p.id}`}><QrCode size={16} aria-hidden="true" />Consumer view</Link>
          {canDelete && <button className="btn btn-danger-quiet" onClick={() => setConfirm(true)}><Trash2 size={16} aria-hidden="true" />Delete</button>}
        </div>
      </header>

      <Tabs label="Product sections" active={tab} onChange={setTab} tabs={[{ id: 'journey', label: 'Journey' }, { id: 'materials', label: 'Materials', count: p.materials.length }, { id: 'suppliers', label: 'Suppliers', count: p.suppliers.length }, { id: 'sustainability', label: 'Sustainability' }]} />

      <TabPanel id="journey" active={tab}>
        <ol className="journey">
          {p.stages.map((s) => (
            <li key={s.id} className={`journey__item journey__item--${s.status}`}>
              <span className="journey__dot" aria-hidden="true" />
              <div className="journey__head"><strong>{STAGE_LABELS[s.stageName]}</strong><StageStatusBadge status={s.status} /></div>
              <p className="m-0">{s.organization?.href ? <Link to={s.organization.href}>{s.organization.name}</Link> : s.organization?.name}</p>
              <p className="meta m-0">{s.location}. {fmtDate(s.date)}, {s.durationDays} {s.durationDays === 1 ? 'day' : 'days'}.</p>
            </li>
          ))}
        </ol>
        <h2 className="mt-5 mb-3">Transport emissions</h2>
        <EmissionsBar legs={p.legs} />
        <LegTable legs={p.legs} />
        <p><Link to={`/pipeline?product=${p.id}`}>See this on the pipeline route</Link></p>
      </TabPanel>

      <TabPanel id="materials" active={tab}>
        <h2 className="mb-3">Composition by weight</h2>
        <CompositionBar parts={p.materials.map((m) => ({ label: m.name, value: m.quantityKg }))} label="Material composition" />
        <div className="mt-4"><DataTable columns={matCols} rows={p.materials} getHref={(m) => `/materials/${m.id}`} caption="Materials in this product" /></div>
      </TabPanel>

      <TabPanel id="suppliers" active={tab}>
        <DataTable columns={supCols} rows={p.suppliers} getHref={(s) => `/suppliers/${s.id}`} caption="Suppliers for this product" />
      </TabPanel>

      <TabPanel id="sustainability" active={tab}>
        <div className="eco-snap">
          <EcoScoreDial score={p.ecoScore} band={p.eco.band} />
          <div className="eco-snap__body">
            <h2 className="mb-2">How this score is made up</h2>
            <ScoreBreakdown factors={p.eco.factors} />
          </div>
          <div className="eco-snap__facts">
            <MetricBlock label="Recycled content" value={fmtPct(p.recycledPct)} context="By weight." />
            <MetricBlock label="Carbon footprint" value={fmtKg(p.carbon.totalKg)} unit="CO₂e" context={`Materials ${fmtKg(p.carbon.materialsKg)}, transport ${fmtKg(p.carbon.transportKg)}. Estimate.`} />
            <MetricBlock label="Fair trade" value={p.fairTradeStatus} context={`${fmtPct(p.fairTradePct)} of material weight.`} />
            <MetricBlock label="Verified suppliers" value={fmtPct(p.verifiedSupplierPct)} context={`${fmtPct(p.fairLaborPct)} with certified labour standards.`} />
          </div>
        </div>
      </TabPanel>

      <Modal open={confirm} onClose={() => !busy && setConfirm(false)} title="Delete this product?" footer={<><button className="btn btn-quiet" onClick={() => setConfirm(false)} disabled={busy}>Keep product</button><button className="btn btn-danger-quiet" onClick={del} disabled={busy}>{busy ? 'Deleting' : 'Delete product'}</button></>}>
        <p className="m-0">{p.name} and its journey data will be removed from this browser. This cannot be undone.</p>
      </Modal>
    </>
  );
}
