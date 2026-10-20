import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead, Section } from '../components/common/PageHead.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { providerTypes } from '../data/providers.js';

export default function ProvidersPage() {
  useDocumentTitle('Providers');
  const { graph } = useData();
  const columns = [
    { key: 'name', label: 'Provider', primary: true, render: (p) => p.name },
    { key: 'location', label: 'Location' },
    { key: 'services', label: 'Services', render: (p) => <span className="meta">{p.services.join(', ')}</span> },
    { key: 'products', label: 'Serves', render: (p) => <span className="meta">{p.products.length ? `${p.products.length} ${p.products.length === 1 ? 'product' : 'products'}` : p.certificationsIssued.length ? `Issues ${p.certificationsIssued.length} certifications` : 'None yet'}</span> },
  ];
  return (
    <>
      <PageHead title="Providers">Organisations that provide a service around your products: moving, storing, certifying and verifying.</PageHead>
      <aside className="callout" aria-label="Providers versus suppliers">
        <p className="m-0"><strong>Suppliers and providers are different.</strong> A supplier gives you <em>materials</em> or makes your product, and is listed under <Link to="/suppliers">Suppliers</Link>. A provider does a <em>service</em>, such as carrying goods or auditing a factory.</p>
      </aside>
      {Object.entries(providerTypes).map(([type, label]) => {
        const rows = graph.providers.filter((p) => p.type === type);
        if (!rows.length) return null;
        return <Section key={type} id={`pt-${type}`} title={label}><DataTable columns={columns} rows={rows} getHref={(p) => `/providers/${p.id}`} caption={label} /></Section>;
      })}
    </>
  );
}
