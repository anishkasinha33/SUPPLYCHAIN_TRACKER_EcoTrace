import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead, Section } from '../components/common/PageHead.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { CompositionBar } from '../components/charts/CompositionBar.jsx';
import { EmptyState } from '../components/common/States.jsx';
import { Link } from 'react-router-dom';

export const TIER = { strong: ['success', 'Strong'], moderate: ['warning', 'Moderate'], weak: ['danger', 'Weak'] };

export default function MaterialsPage() {
  useDocumentTitle('Materials');
  const { graph } = useData();
  const [q, setQ] = useState(''); const [cat, setCat] = useState('all'); const [tier, setTier] = useState('all');
  const cats = [...new Set(graph.materials.map((m) => m.category))].sort();
  const rows = useMemo(() => { const n = q.trim().toLowerCase(); return graph.materials.filter((m) => (cat === 'all' || m.category === cat) && (tier === 'all' || m.tier === tier) && (!n || [m.name, m.origin, m.supplier?.name].join(' ').toLowerCase().includes(n))).sort((a, b) => a.name.localeCompare(b.name)); }, [graph, q, cat, tier]);

  const byCat = cats.map((c) => ({ label: c, value: graph.materials.filter((m) => m.category === c).reduce((s, m) => s + m.totalKg, 0) })).filter((p) => p.value > 0);
  const totalKg = graph.materials.reduce((s, m) => s + m.totalKg, 0);
  const recycledKg = graph.materials.reduce((s, m) => s + (m.totalKg * m.recycledPercentage) / 100, 0);

  const columns = [
    { key: 'name', label: 'Material', primary: true, render: (m) => (<span><strong>{m.name}</strong><span className="meta d-block">{m.category}</span></span>) },
    { key: 'supplier', label: 'Supplier', render: (m) => <Link to={`/suppliers/${m.supplierId}`}>{m.supplier?.name}</Link> },
    { key: 'origin', label: 'Origin' },
    { key: 'qty', label: 'Quantity', align: 'end', render: (m) => <span className="num">{m.totalKg.toLocaleString('en-IN')} kg</span> },
    { key: 'rec', label: 'Recycled', align: 'end', render: (m) => <span className="num">{m.recycledPercentage}%</span> },
    { key: 'tier', label: 'Sustainability', render: (m) => <Badge tone={TIER[m.tier][0]}>{TIER[m.tier][1]}</Badge> },
    { key: 'prods', label: 'Used in', render: (m) => <span className="meta">{m.products.length} {m.products.length === 1 ? 'product' : 'products'}</span> },
  ];

  return (
    <>
      <PageHead title="Materials">What goes into your products, where it comes from and how responsible it is.</PageHead>
      <Section id="comp" title="Material weight by category" aside={<span className="meta num">{Math.round((recycledKg / totalKg) * 100)}% of all weight is recycled</span>}>
        <CompositionBar parts={byCat} label="Material weight by category across all products" />
      </Section>
      <form className="filters filters--short" role="search" aria-label="Filter materials" onSubmit={(e) => e.preventDefault()}>
        <div className="filters__search"><label htmlFor="mq" className="visually-hidden">Search materials</label><Search size={16} aria-hidden="true" /><input id="mq" className="form-control" type="search" placeholder="Search material, origin or supplier" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div><label htmlFor="mc" className="form-label">Category</label><select id="mc" className="form-select" value={cat} onChange={(e) => setCat(e.target.value)}><option value="all">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label htmlFor="mt" className="form-label">Sustainability</label><select id="mt" className="form-select" value={tier} onChange={(e) => setTier(e.target.value)}><option value="all">Any level</option>{Object.entries(TIER).map(([k, [, l]]) => <option key={k} value={k}>{l}</option>)}</select></div>
      </form>
      <p className="meta" role="status">{rows.length} of {graph.materials.length} materials</p>
      {rows.length ? <DataTable columns={columns} rows={rows} getHref={(m) => `/materials/${m.id}`} caption="Materials" /> : <EmptyState title="No materials match" action={{ label: 'Clear filters', onClick: () => { setQ(''); setCat('all'); setTier('all'); } }}>Try a different search or remove a filter.</EmptyState>}
    </>
  );
}
