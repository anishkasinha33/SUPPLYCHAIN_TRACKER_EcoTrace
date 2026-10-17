import { Link, useParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead, Section } from '../components/common/PageHead.jsx';
import { EmptyState } from '../components/common/States.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { EcoChip, FairLaborBadge, VerificationBadge } from '../components/common/Badge.jsx';

export default function SupplierDetailPage() {
  const { id } = useParams();
  const { graph } = useData();
  const s = graph.suppliers.find((x) => x.id === id);
  useDocumentTitle(s?.name || 'Supplier not found');
  if (!s) return <EmptyState icon={SearchX} title="We could not find that supplier" action={{ label: 'Back to suppliers', to: '/suppliers' }}>The link may be wrong.</EmptyState>;
  const issuer = (c) => graph.providers.find((p) => p.id === c.issuerProviderId);

  return (
    <>
      <PageHead title={s.name} kicker={s.type === 'manufacturer' ? 'Manufacturer' : 'Material supplier'}>{s.about}</PageHead>
      <dl className="facts facts--inline mb-4">
        <div><dt>Location</dt><dd>{s.location}</dd></div>
        <div><dt>Working with you since</dt><dd className="num">{s.since}</dd></div>
        <div><dt>SDG score</dt><dd className="num">{s.sdg.score} / 100</dd></div>
        <div><dt>Verification</dt><dd><VerificationBadge status={s.verificationStatus} /></dd></div>
        <div><dt>Fair labour</dt><dd><FairLaborBadge status={s.fairLabor} /></dd></div>
      </dl>

      {s.verificationStatus !== 'verified' && <div className={`alert-t alert-t--${s.verificationStatus === 'needs-review' ? 'danger' : 'warning'}`} role="note">{s.verificationStatus === 'needs-review' ? 'This supplier needs review. An audit is overdue, so products using it carry lower eco scores.' : 'Verification is pending. Once an audit completes, the products using this supplier will score higher.'}</div>}

      <Section id="sdg" title="SDG checklist" aside={<Link to="/about">How scoring works</Link>}>
        <div className="sdg">
          {[[8, 'SDG 8: Decent work'], [12, 'SDG 12: Responsible production']].map(([n, label]) => (
            <section key={n} aria-label={label}>
              <h3 className="sdg__title">{label} <span className="num muted">{n === 8 ? s.sdg.sdg8 : s.sdg.sdg12} / 50</span></h3>
              <ul className="sdg__list">
                {s.sdg.items.filter((i) => i.sdg === n).map((i) => (
                  <li key={i.label} className={i.pass ? 'is-pass' : 'is-miss'}><span aria-hidden="true">{i.pass ? '✓' : '–'}</span><span>{i.label}<span className="visually-hidden">{i.pass ? ', met' : ', not met'}</span></span></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </Section>

      <div className="row g-5">
        <div className="col-lg-6">
          <Section id="mat" title="Materials supplied">
            {s.materials.length ? <ul className="plain-list">{s.materials.map((m) => <li key={m.id}><Link to={`/materials/${m.id}`}><strong>{m.name}</strong></Link><span className="meta">{m.recycledPercentage}% recycled</span></li>)}</ul> : <p className="muted">{s.type === 'manufacturer' ? 'This supplier makes finished products rather than supplying materials.' : 'No materials recorded yet.'}</p>}
          </Section>
        </div>
        <div className="col-lg-6">
          <Section id="cert" title="Certifications">
            {s.certifications.length ? <ul className="plain-list">{s.certifications.map((c) => <li key={c.id}><div><strong>{c.name}</strong><span className="meta d-block">{c.scope}</span></div>{issuer(c) && <Link to={`/providers/${issuer(c).id}`} className="meta">{issuer(c).name}</Link>}</li>)}</ul> : <p className="muted">No certifications on record. Ask this supplier for evidence, or request a verification audit.</p>}
          </Section>
        </div>
      </div>

      <Section id="prod" title="Used in these products">
        {s.products.length ? <DataTable rows={s.products} getHref={(p) => `/products/${p.id}`} caption="Products using this supplier" columns={[{ key: 'name', label: 'Product', primary: true, render: (p) => p.name }, { key: 'category', label: 'Category' }, { key: 'eco', label: 'Eco score', align: 'end', render: (p) => <EcoChip score={p.ecoScore} band={p.eco.band} /> }]} /> : <p className="muted">Not used in any product yet.</p>}
      </Section>
    </>
  );
}
