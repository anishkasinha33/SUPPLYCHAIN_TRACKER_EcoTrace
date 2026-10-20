import { BadgeCheck, Clock3, Recycle, Leaf, HandHeart } from 'lucide-react';
import { ProductArt } from '../charts/ProductArt.jsx';
import { TopoField } from '../charts/TopoField.jsx';
import { CompositionBar } from '../charts/CompositionBar.jsx';
import { EcoScoreDial } from '../sustainability/EcoScoreDial.jsx';
import { MODES } from '../../utils/carbon.js';
import { fmtDate } from '../../utils/format.js';

const place = (loc) => (loc || '').split(',').pop().trim();
const JOURNEY = [['source', 'Where it began'], ['manufacturing', 'Where it was made'], ['transportation', 'How it travelled'], ['warehouse', 'Where it waited'], ['retail', 'Where you found it']];

/** Simplified source-to-product journey for consumers. */
export function JourneyStrip({ product }) {
  const items = JOURNEY.map(([key, label]) => ({ key, label, stage: product.stages.find((s) => s.stageName === key) })).filter((i) => i.stage);
  return (
    <ol className="pj">
      {items.map(({ key, label, stage }) => {
        const leg = product.legs.find((l) => l.toStageId === stage.id && l.distanceKm > 100);
        return (
          <li key={key}>
            <span className="pj__dot" aria-hidden="true" />
            <span className="pj__label">{label}</span>
            <strong className="pj__place">{place(stage.location)}</strong>
            <span className="meta">{key === 'transportation' && product.legs.some((l) => l.mode) ? `${modeSummary(product)}` : fmtDate(stage.date)}</span>
            {leg && key !== 'transportation' && <span className="pj__leg meta">{leg.distanceKm.toLocaleString('en-IN')} km by {MODES[leg.mode].label.toLowerCase()} to get here</span>}
          </li>
        );
      })}
    </ol>
  );
}

function modeSummary(product) {
  const km = product.legs.reduce((s, l) => s + l.distanceKm, 0);
  const longest = [...product.legs].sort((a, b) => b.distanceKm - a.distanceKm)[0];
  return `${km.toLocaleString('en-IN')} km in total, mostly by ${MODES[longest.mode].label.toLowerCase()}`;
}

/**
 * The public "digital product passport". Deliberately omits prices, supplier ratings,
 * contracts and internal risk status. Desktop-first two-column layout that collapses on mobile.
 */
export function PassportView({ product, businessName }) {
  const recycledParts = product.materials.map((m) => ({ label: m.name, value: m.quantityKg }));
  const certs = [...new Map(product.materials.flatMap((m) => m.certifications).map((c) => [c.id, c])).values()];
  return (
    <article className="passport">
      <header className="passport__hero">
        <TopoField lines={10} clusters={[[0.85, 0.2]]} />
        <div className="passport__hero-in">
          <div>
            <p className="passport__kicker">Digital product passport</p>
            <h1>{product.name}</h1>
            <p className="passport__sub">{product.story}</p>
            <dl className="passport__ids">
              <div><dt>Traceability ID</dt><dd className="mono">{product.traceId}</dd></div>
              <div><dt>Batch</dt><dd className="mono">{product.batchNumber}</dd></div>
              <div><dt>Made in</dt><dd>{product.origin}</dd></div>
            </dl>
          </div>
          <div className="passport__art"><ProductArt product={product} ratio="1 / 1" /></div>
        </div>
      </header>

      <div className="passport__body">
        <section className="passport__sec passport__sec--wide" aria-labelledby="pp-journey">
          <h2 id="pp-journey">From source to you</h2>
          <JourneyStrip product={product} />
        </section>

        <section className="passport__sec" aria-labelledby="pp-made">
          <h2 id="pp-made">What it is made of</h2>
          <CompositionBar parts={recycledParts} label="Material composition by weight" />
          <ul className="plain-list">
            {product.materials.map((m) => (
              <li key={m.id}>
                <div><strong>{m.name}</strong><span className="meta d-block">From {place(m.origin)}</span></div>
                <span className="meta num">{m.recycledPercentage > 0 ? `${m.recycledPercentage}% recycled` : 'Virgin material'}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="passport__sec" aria-labelledby="pp-impact">
          <h2 id="pp-impact">Its impact</h2>
          <div className="passport__impact">
            <EcoScoreDial score={product.ecoScore} band={product.eco.band} size={150} />
            <ul className="impact-list">
              <li><Recycle size={18} aria-hidden="true" /><span><strong className="num">{Math.round(product.recycledPct)}%</strong> recycled content by weight</span></li>
              <li><Leaf size={18} aria-hidden="true" /><span><strong className="num">{product.carbon.perUnitKg.toFixed(2)} kg</strong> CO₂e per item, estimated</span></li>
              <li><HandHeart size={18} aria-hidden="true" /><span>{product.fairTradeStatus}</span></li>
            </ul>
          </div>
          <p className="meta">The eco score combines ten factors: carbon, transport, recycled content, materials, water, end-of-life recyclability, supplier verification, fair labour, certifications and traceability. Emissions are estimates for demonstration.</p>
        </section>

        <section className="passport__sec" aria-labelledby="pp-people">
          <h2 id="pp-people">The people behind it</h2>
          <ul className="plain-list">
            {product.suppliers.map((s) => (
              <li key={s.id}>
                <div><strong>{s.name}</strong><span className="meta d-block">{s.type === 'manufacturer' ? 'Made the product' : 'Supplied materials'} in {place(s.location)}</span></div>
                {s.verificationStatus === 'verified'
                  ? <span className="pp-ver pp-ver--ok"><BadgeCheck size={15} aria-hidden="true" />Verified</span>
                  : <span className="pp-ver"><Clock3 size={15} aria-hidden="true" />Verification in progress</span>}
              </li>
            ))}
          </ul>
        </section>

        {certs.length > 0 && (
          <section className="passport__sec" aria-labelledby="pp-certs">
            <h2 id="pp-certs">Certifications</h2>
            <ul className="chips">{certs.map((c) => <li key={c.id}>{c.name}</li>)}</ul>
          </section>
        )}
      </div>

      <footer className="passport__foot">
        <p className="m-0">Brought to you by <strong>{businessName}</strong>. Information is supplied by the business and shown with estimates where noted.</p>
      </footer>
    </article>
  );
}
