import { Link } from 'react-router-dom';
import { Package, Gauge, Cloud, BadgeCheck, Plus } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { ArcGauge, DotMatrix, MiniBars, PerformanceChart } from '../components/charts/DashCharts.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { EcoChip, ProductStatusBadge, VerificationBadge } from '../components/common/Badge.jsx';
import { scoreBand } from '../utils/sustainability.js';
import { fmtKg } from '../utils/format.js';
import { ProductArt } from '../components/charts/ProductArt.jsx';


function currentStageName(p) {
  if (p.status === 'on-sale') return 'retail';
  const s = p.stages.find((x) => x.status === 'in-progress');
  return s ? s.stageName : p.stages[0]?.stageName || 'source';
}

export default function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { graph, stats } = useData();
  const { user } = useAuth();
  const { products, suppliers } = graph;
  const best = [...products].sort((a, b) => b.ecoScore - a.ecoScore)[0];
  const active = products.filter((p) => p.status === 'in-production' || p.status === 'in-transit').length;
  const band = scoreBand(Math.round(stats.avgEco));
  const attention = suppliers.filter((s) => s.products.length > 0 && s.verificationStatus !== 'verified').sort((a, b) => (a.verificationStatus === 'needs-review' ? -1 : 1) - (b.verificationStatus === 'needs-review' ? -1 : 1));

  const recent = [...products].sort((a, b) => b.startDate.localeCompare(a.startDate)).slice(0, 5);


  const columns = [
    { key: 'name', label: 'Product', primary: true, render: (p) => (<span className="cell-prod"><ProductArt product={p} ratio="1 / 1" className="cell-prod__art" /><span><strong>{p.name}</strong><span className="meta mono d-block">{p.traceId}</span></span></span>) },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Production', render: (p) => <ProductStatusBadge status={p.status} /> },
    { key: 'supplier', label: 'Suppliers', render: (p) => <VerificationBadge status={p.supplierStatus} /> },
    { key: 'eco', label: 'Eco score', align: 'end', render: (p) => <EcoChip score={p.ecoScore} band={p.eco.band} /> },
  ];

  const delivered = products.filter((p) => p.status === 'on-sale').length;
  const used = suppliers.filter((s) => s.products.length > 0);
  const dotItems = [...used].sort((x, y) => ['verified', 'pending', 'needs-review'].indexOf(x.verificationStatus) - ['verified', 'pending', 'needs-review'].indexOf(y.verificationStatus)).map((s) => s.verificationStatus);
  const chrono = [...products].sort((x, y) => x.startDate.localeCompare(y.startDate));
  const points = chrono.map((p) => ({ label: new Date(p.startDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), name: p.name, a: p.ecoScore, b: p.recycledPct }));
  const topCarbon = [...products].sort((x, y) => x.carbon.totalKg - y.carbon.totalKg);
  const transportShare = Math.round((stats.transportKg / (stats.totalCarbonKg || 1)) * 100);

  return (
    <>
      <header className="dash-head">
        <div>
          <p className="dash-head__crumb"><span className="pill pill--soft">Live demo</span> <span className="muted">{user.businessName}</span></p>
          <h1>Welcome to EcoTrace</h1>
          <p className="dash-head__sub">Tracking {products.length} products across {stats.verified} verified suppliers, averaging {Math.round(stats.avgEco)}/100 on the eco score, with {delivered} on sale.</p>
        </div>
        <div className="dash-head__actions">
          <Link className="btn btn-primary btn-lg" to="/products/new"><Plus size={18} aria-hidden="true" />Add product</Link>
        </div>
      </header>

      <div className="bento">
        <section className="card card--k k1" aria-label="Products tracked">
          <h2 className="card__label"><Package size={15} aria-hidden="true" />Products tracked</h2>
          <div className="card__row"><span className="card__big num">{products.length}</span><span className="chip chip--up">{active} in motion</span></div>
          <ArcGauge value={active} max={products.length} label={`${active} of ${products.length} products are in production or transit`} />
          <p className="card__foot">{delivered} on sale, {products.length - active - delivered} planned or in storage.</p>
        </section>

        <section className="card card--k k2" aria-label="Verified suppliers">
          <h2 className="card__label"><BadgeCheck size={15} aria-hidden="true" />Verified suppliers</h2>
          <div className="card__row"><span className="card__big num">{stats.verified}<small>/{stats.supplierCount}</small></span><span className={`chip ${stats.needsAttention ? 'chip--warn' : 'chip--up'}`}>{stats.needsAttention ? `${stats.needsAttention} need attention` : 'All verified'}</span></div>
          <DotMatrix items={dotItems} label={`${stats.verified} verified, ${stats.supplierCount - stats.verified} not yet verified`} />
          <p className="card__foot"><i className="dots__key dots__key--verified" />Verified <i className="dots__key dots__key--pending" />Pending <i className="dots__key dots__key--needs-review" />Review</p>
        </section>

        <section className="card card--k k3" aria-label="Average eco score">
          <h2 className="card__label"><Gauge size={15} aria-hidden="true" />Average eco score</h2>
          <div className="card__row"><span className="card__big num">{Math.round(stats.avgEco)}<small>/100</small></span><span className="chip chip--up">{band.label}</span></div>
          <MiniBars values={chrono.map((p) => p.ecoScore)} max={100} highlight={chrono.findIndex((p) => p.id === best.id)} label="Eco score of each product, best highlighted" />
          <p className="card__foot">Best: {best.name}.</p>
        </section>

        <section className="card card--k k4" aria-label="Carbon footprint">
          <h2 className="card__label"><Cloud size={15} aria-hidden="true" />Carbon footprint</h2>
          <div className="card__row"><span className="card__big num">{fmtKg(stats.totalCarbonKg)}</span><span className="chip">{transportShare}% transport</span></div>
          <MiniBars values={topCarbon.map((p) => p.carbon.totalKg)} highlight={topCarbon.length - 1} label="Carbon footprint of each product, highest highlighted" />
          <p className="card__foot">CO₂e across all batches. Estimate.</p>
        </section>

        <section className="card card--wide" aria-labelledby="perf-h">
          <div className="card__head">
            <div><h2 id="perf-h" className="card__title">Eco score by batch</h2><p className="card__sub">Each product in the order its batch started, with how much of it is recycled.</p></div>
            <ul className="legend"><li><i className="sw sw--a" />Eco score</li><li><i className="sw sw--b" />Recycled %</li></ul>
          </div>
          <PerformanceChart points={points} aName="Eco score" bName="Recycled" summary="Eco score and recycled content for each product batch, in start order" />
        </section>

        <section className="card card--side" aria-labelledby="fix-h">
          <div className="card__head"><h2 id="fix-h" className="card__title">Fix these first</h2></div>
          {attention.length === 0 ? <p className="muted">Every supplier in use is verified.</p> : (
            <ul className="plain-list">
              {attention.map((s) => (
                <li key={s.id}><div><Link to={`/suppliers/${s.id}`}><strong>{s.name}</strong></Link><span className="meta d-block">Used in {s.products.length} {s.products.length === 1 ? 'product' : 'products'}, SDG score {s.sdg.score}</span></div><VerificationBadge status={s.verificationStatus} /></li>
              ))}
            </ul>
          )}
        </section>

        <section className="card card--wide" aria-labelledby="rec-h">
          <div className="card__head"><h2 id="rec-h" className="card__title">Recent products</h2><Link to="/products" className="card__link">All products</Link></div>
          <DataTable columns={columns} rows={recent} getHref={(p) => `/products/${p.id}`} caption="Recent products" />
        </section>

        <div className="card--side stack">
          <section className="card card--goal" aria-label="SDG 8">
            <h2 className="card__label">SDG 8 · Target 8.8</h2>
            <p className="card__title card__title--sm">Decent work</p>
            <p className="card__foot m-0">Suppliers are scored on a public labour and ethics checklist before products move on.</p>
          </section>
          <section className="card card--goal" aria-label="SDG 12">
            <h2 className="card__label">SDG 12 · Target 12.5</h2>
            <p className="card__title card__title--sm">Responsible production</p>
            <p className="card__foot m-0">Every transport leg shows its carbon footprint, so low-emission carriers are easy to favour.</p>
          </section>
        </div>
      </div>
    </>
  );
}
