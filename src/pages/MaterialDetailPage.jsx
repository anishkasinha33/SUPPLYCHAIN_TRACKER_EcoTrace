import { Link, useParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead, Section } from '../components/common/PageHead.jsx';
import { EmptyState } from '../components/common/States.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { Badge, EcoChip, VerificationBadge } from '../components/common/Badge.jsx';
import { TIER } from './MaterialsPage.jsx';

export default function MaterialDetailPage() {
  const { id } = useParams();
  const { graph } = useData();
  const m = graph.materials.find((x) => x.id === id);
  useDocumentTitle(m?.name || 'Material not found');
  if (!m) return <EmptyState icon={SearchX} title="We could not find that material" action={{ label: 'Back to materials', to: '/materials' }}>The link may be wrong.</EmptyState>;
  const qty = (p) => p.materials.find((x) => x.id === m.id)?.quantityKg;
  return (
    <>
      <PageHead title={m.name} kicker={m.category}>Used in {m.products.length} {m.products.length === 1 ? 'product' : 'products'}, {m.totalKg.toLocaleString('en-IN')} kg in total.</PageHead>
      <dl className="facts facts--inline mb-4">
        <div><dt>Origin</dt><dd>{m.origin}</dd></div>
        <div><dt>Supplier</dt><dd><Link to={`/suppliers/${m.supplierId}`}>{m.supplier?.name}</Link></dd></div>
        <div><dt>Supplier status</dt><dd><VerificationBadge status={m.supplier?.verificationStatus} /></dd></div>
        <div><dt>Recycled content</dt><dd className="num">{m.recycledPercentage}%</dd></div>
        <div><dt>Sustainability</dt><dd><Badge tone={TIER[m.tier][0]}>{TIER[m.tier][1]}</Badge></dd></div>
        <div><dt>Fair trade</dt><dd>{m.fairTrade ? 'Yes' : 'No'}</dd></div>
        <div><dt>Embodied emissions</dt><dd className="num">{m.co2ePerKg} kg CO₂e per kg <span className="meta">(mock)</span></dd></div>
      </dl>
      <div className="row g-5">
        <div className="col-lg-5"><Section id="mc" title="Certifications">{m.certifications.length ? <ul className="plain-list">{m.certifications.map((c) => <li key={c.id}><div><strong>{c.name}</strong><span className="meta d-block">{c.scope}</span></div></li>)}</ul> : <p className="muted">No certifications on record for this material.</p>}</Section></div>
        <div className="col-lg-7"><Section id="mp" title="Products using it"><DataTable rows={m.products} getHref={(p) => `/products/${p.id}`} caption="Products using this material" columns={[{ key: 'name', label: 'Product', primary: true, render: (p) => p.name }, { key: 'q', label: 'Quantity', render: (p) => <span className="num">{qty(p)} kg</span> }, { key: 'eco', label: 'Eco score', align: 'end', render: (p) => <EcoChip score={p.ecoScore} band={p.eco.band} /> }]} /></Section></div>
      </div>
    </>
  );
}
