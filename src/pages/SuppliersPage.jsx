import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead } from '../components/common/PageHead.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { FairLaborBadge, VerificationBadge } from '../components/common/Badge.jsx';
import { EmptyState } from '../components/common/States.jsx';
import { VERIFICATION_LABELS } from '../utils/format.js';

export default function SuppliersPage() {
  useDocumentTitle('Suppliers');
  const { graph } = useData();
  const [q, setQ] = useState(''); const [ver, setVer] = useState('all'); const [type, setType] = useState('all');
  const rows = useMemo(() => {
    const n = q.trim().toLowerCase();
    return graph.suppliers.filter((s) => (ver === 'all' || s.verificationStatus === ver) && (type === 'all' || s.type === type) && (!n || [s.name, s.location, ...s.materials.map((m) => m.name)].join(' ').toLowerCase().includes(n))).sort((a, b) => a.name.localeCompare(b.name));
  }, [graph, q, ver, type]);
  const counts = { verified: 0, pending: 0, 'needs-review': 0 };
  graph.suppliers.forEach((s) => counts[s.verificationStatus]++);

  const columns = [
    { key: 'name', label: 'Supplier', primary: true, render: (s) => (<span><strong>{s.name}</strong><span className="meta d-block">{s.type === 'manufacturer' ? 'Manufacturer' : 'Material supplier'}</span></span>) },
    { key: 'location', label: 'Location' },
    { key: 'ver', label: 'Verification', render: (s) => <VerificationBadge status={s.verificationStatus} /> },
    { key: 'fair', label: 'Fair labour', render: (s) => <FairLaborBadge status={s.fairLabor} /> },
    { key: 'sdg', label: 'SDG score', align: 'end', render: (s) => <span className="num">{s.sdg.score} <span className="muted">/ 100</span></span> },
  ];

  return (
    <>
      <PageHead title="Suppliers">Everyone who supplies materials or makes your products, with a verification status and a 100-point SDG score each.</PageHead>
      <div className="strip" aria-label="Verification summary">
        {Object.entries(counts).map(([k, v]) => (<button key={k} className={`strip__item ${ver === k ? 'is-on' : ''}`} onClick={() => setVer(ver === k ? 'all' : k)} aria-pressed={ver === k}><span className="strip__n num">{v}</span><span>{VERIFICATION_LABELS[k]}</span></button>))}
      </div>
      <form className="filters filters--short" role="search" aria-label="Filter suppliers" onSubmit={(e) => e.preventDefault()}>
        <div className="filters__search"><label htmlFor="sq" className="visually-hidden">Search suppliers</label><Search size={16} aria-hidden="true" /><input id="sq" className="form-control" type="search" placeholder="Search name, location or material" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div><label htmlFor="st" className="form-label">Type</label><select id="st" className="form-select" value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option><option value="material">Material suppliers</option><option value="manufacturer">Manufacturers</option></select></div>
        <div><label htmlFor="sv" className="form-label">Verification</label><select id="sv" className="form-select" value={ver} onChange={(e) => setVer(e.target.value)}><option value="all">Any status</option>{Object.entries(VERIFICATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
      </form>
      <p className="meta" role="status">{rows.length} of {graph.suppliers.length} suppliers</p>
      {rows.length ? <DataTable columns={columns} rows={rows} getHref={(s) => `/suppliers/${s.id}`} caption="Suppliers" /> : <EmptyState title="No suppliers match" action={{ label: 'Clear filters', onClick: () => { setQ(''); setVer('all'); setType('all'); } }}>Try a different search or remove a filter.</EmptyState>}
    </>
  );
}
