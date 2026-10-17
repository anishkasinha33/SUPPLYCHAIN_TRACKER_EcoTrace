import { Link, useParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead, Section } from '../components/common/PageHead.jsx';
import { EmptyState } from '../components/common/States.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { providerTypes } from '../data/providers.js';
import { MODES } from '../utils/carbon.js';
import { STAGE_LABELS, fmtKg } from '../utils/format.js';

export default function ProviderDetailPage() {
  const { id } = useParams();
  const { graph } = useData();
  const p = graph.providers.find((x) => x.id === id);
  useDocumentTitle(p?.name || 'Provider not found');
  if (!p) return <EmptyState icon={SearchX} title="We could not find that provider" action={{ label: 'Back to providers', to: '/providers' }}>The link may be wrong.</EmptyState>;
  return (
    <>
      <PageHead title={p.name} kicker={providerTypes[p.type]}>{p.location}</PageHead>
      <div className="row g-5">
        <div className="col-lg-5">
          <Section id="srv" title="Services"><ul className="plain-list">{p.services.map((s) => <li key={s}>{s}</li>)}</ul></Section>
          {p.certificationsIssued.length > 0 && <Section id="iss" title="Certifications it issues"><ul className="plain-list">{p.certificationsIssued.map((c) => <li key={c.id}><div><strong>{c.name}</strong><span className="meta d-block">{c.scope}</span></div></li>)}</ul></Section>}
        </div>
        <div className="col-lg-7">
          <Section id="legs" title="Pipeline work">
            {p.legs.length === 0 && p.stages.length === 0 ? <p className="muted">This provider is not linked to any pipeline stage yet.</p> : (
              <DataTable caption="Pipeline work" rows={[...p.stages.map((s) => ({ id: s.id, product: s.product, what: `${STAGE_LABELS[s.stageName]} at ${s.location}`, co2: null })), ...p.legs.map((l) => ({ id: l.id, product: l.product, what: `${l.distanceKm.toLocaleString('en-IN')} km by ${MODES[l.mode].label.toLowerCase()}`, co2: l.co2e }))]}
                columns={[{ key: 'product', label: 'Product', primary: true, render: (r) => r.product.name }, { key: 'what', label: 'Work' }, { key: 'co2', label: 'CO₂e (est.)', align: 'end', render: (r) => (r.co2 == null ? <span className="muted">Not applicable</span> : <span className="num">{fmtKg(r.co2)}</span>) }]}
                getHref={(r) => `/pipeline?product=${r.product.id}`} />
            )}
          </Section>
        </div>
      </div>
    </>
  );
}
