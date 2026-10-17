import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead, Section } from '../components/common/PageHead.jsx';
import { EcoScoreDial } from '../components/sustainability/EcoScoreDial.jsx';
import { ScoreBreakdown, MetricBlock } from '../components/sustainability/ScoreBreakdown.jsx';
import { EmissionsBar } from '../components/charts/EmissionsBar.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { EcoChip } from '../components/common/Badge.jsx';
import { ECO_WEIGHTS, FACTOR_BY_KEY, FACTOR_DEFS, PILLARS, scoreBand } from '../utils/sustainability.js';
import { ESTIMATE_NOTE } from '../utils/carbon.js';
import { fmtKg, fmtPct } from '../utils/format.js';


export default function SustainabilityPage() {
  useDocumentTitle('Sustainability');
  const { graph, stats } = useData();
  const { products } = graph;
  const score = Math.round(stats.avgEco);
  const factors = Object.keys(ECO_WEIGHTS).map((key) => { const ratio = stats.factorAvg(key); return { key, label: FACTOR_BY_KEY[key].label, pillar: FACTOR_BY_KEY[key].pillar, weight: ECO_WEIGHTS[key], ratio, points: ratio * ECO_WEIGHTS[key], detail: FACTOR_BY_KEY[key].measures }; });
  const allLegs = products.flatMap((p) => p.legs);
  const legTotal = allLegs.reduce((s, l) => s + l.co2e, 0) || 1;
  const legs = allLegs.map((l) => ({ ...l, share: l.co2e / legTotal }));
  const totalKg = products.reduce((s, p) => s + p.materials.reduce((a, l) => a + l.quantityKg, 0), 0);
  const totalUnits = products.reduce((s, p) => s + p.unitsInBatch, 0);
  const certs = graph.certifications.map((c) => ({ ...c, count: graph.materials.filter((m) => m.certificationIds.includes(c.id)).length })).filter((c) => c.count).sort((a, b) => b.count - a.count);

  const rows = products.map((p) => {
    const worst = [...p.eco.factors].sort((a, b) => (b.weight - b.points) - (a.weight - a.points))[0];
    return { ...p, lever: `${worst.label}: ${(worst.weight - worst.points).toFixed(0)} points available` };
  }).sort((a, b) => b.ecoScore - a.ecoScore);

  const columns = [
    { key: 'name', label: 'Product', primary: true, render: (p) => p.name },
    { key: 'eco', label: 'Eco score', render: (p) => <EcoChip score={p.ecoScore} band={p.eco.band} /> },
    { key: 'rec', label: 'Recycled', align: 'end', render: (p) => <span className="num">{fmtPct(p.recycledPct)}</span> },
    { key: 'co2', label: 'CO₂e per item', align: 'end', render: (p) => <span className="num">{p.carbon.perUnitKg.toFixed(2)} kg</span> },
    { key: 'lever', label: 'Biggest opportunity', render: (p) => <span className="meta">{p.lever}</span> },
  ];

  return (
    <>
      <PageHead title="Sustainability">What your products cost the environment, how fairly they are made, and what to improve first.</PageHead>

      <Section id="score" title="Overall eco score">
        <div className="eco-snap">
          <EcoScoreDial score={score} band={scoreBand(score)} size={190} />
          <div className="eco-snap__body">
            <p className="muted">The score is a transparent weighted sum, out of 100. Each factor below shows the points it earned out of the points it could earn. Nothing is hidden inside the number.</p>
            <ScoreBreakdown factors={factors} />
          </div>
        </div>
      </Section>

      <Section id="method" title="How the eco score works">
        <p className="muted method__lead">Ten factors in four pillars, weighted to 100 points. The pillars follow the data an EU Digital Product Passport is expected to carry and the impact categories used by the Higg Materials Sustainability Index. Freight emissions follow the GLEC / ISO 14083 method: tonne-kilometres multiplied by a factor for each mode.</p>
        <div className="method">
          {PILLARS.map((pl) => {
            const defs = FACTOR_DEFS.filter((d) => d.pillar === pl.key);
            return (
              <section className="method__pillar" key={pl.key} aria-labelledby={`pl-${pl.key}`}>
                <h3 id={`pl-${pl.key}`} className="method__title">{pl.label} <span className="num muted">{defs.reduce((s, d) => s + d.weight, 0)} pts</span></h3>
                <dl className="method__list">
                  {defs.map((d) => (
                    <div key={d.key} className="method__item">
                      <dt>{d.label} <span className="num muted">{d.weight}</span></dt>
                      <dd>{d.measures} <span className="d-block">{d.scoring}</span><span className="d-block meta">Basis: {d.basis}</span></dd>
                    </div>
                  ))}
                </dl>
              </section>
            );
          })}
        </div>
        <p className="meta">All material, water, end-of-life and freight values in this demo are illustrative mock data, not audited figures.</p>
      </Section>

      <Section id="env" title="Environmental" aside={<span className="meta">{ESTIMATE_NOTE}</span>}>
        <div className="metrics">
          <MetricBlock label="Total carbon footprint" value={fmtKg(stats.totalCarbonKg)} unit="CO₂e" context={`Materials ${fmtKg(stats.materialsKg)}, transport ${fmtKg(stats.transportKg)}.`} />
          <MetricBlock label="Average per product batch" value={fmtKg(stats.avgCarbonKg)} unit="CO₂e" context={`Across ${products.length} products.`} />
          <MetricBlock label="Recycled material" value={fmtPct(stats.recycledPct)} context="By weight, all batches." />
          <MetricBlock label="Material per item" value={Math.round((totalKg / totalUnits) * 1000)} unit="g" context="Average weight of materials in each item." />
        </div>
        <h3 className="mt-4 mb-2">Transport emissions by mode</h3>
        <EmissionsBar legs={legs} />
        <p className="meta">Air and long road legs dominate. Moving a batch from road or air to rail is usually the largest single saving.</p>
      </Section>

      <Section id="eth" title="Ethical">
        <div className="metrics">
          <MetricBlock label="Verified suppliers" value={`${stats.verified} of ${stats.supplierCount}`} context={`${fmtPct(stats.verifiedPct)} of suppliers in use.`} />
          <MetricBlock label="Certified labour standards" value={`${stats.fairCertified} of ${stats.supplierCount}`} context="Suppliers with a fair-labour audit on record." />
          <MetricBlock label="Fair-trade materials" value={fmtPct(stats.fairTradePct)} context="By weight." />
          <MetricBlock label="Certification coverage" value={fmtPct(stats.certCoveragePct)} context={`${stats.certifiedMaterials} of ${stats.materialCount} materials certified.`} />
        </div>
        <h3 className="mt-4 mb-2">Certifications in use</h3>
        <ul className="chips">{certs.map((c) => <li key={c.id}>{c.name} <span className="num muted">{c.count}</span></li>)}</ul>
      </Section>

      <Section id="cmp" title="Compare products" aside={<Link to="/products">All products</Link>}>
        <DataTable columns={columns} rows={rows} getHref={(p) => `/products/${p.id}`} caption="Products ranked by eco score" />
      </Section>
    </>
  );
}
