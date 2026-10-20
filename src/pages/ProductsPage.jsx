import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, List, Plus, Search, SearchX, Package } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead } from '../components/common/PageHead.jsx';
import { DataTable } from '../components/common/DataTable.jsx';
import { EmptyState } from '../components/common/States.jsx';
import { EcoChip, ProductStatusBadge, VerificationBadge } from '../components/common/Badge.jsx';
import { ProductCard } from '../components/products/ProductCard.jsx';
import { ProductArt } from '../components/charts/ProductArt.jsx';
import { STATUS_LABELS } from '../utils/format.js';
import { BANDS } from '../utils/sustainability.js';

const SORTS = {
  recent: ['Newest first', (a, b) => b.startDate.localeCompare(a.startDate)],
  name: ['Name A to Z', (a, b) => a.name.localeCompare(b.name)],
  eco: ['Eco score, high to low', (a, b) => b.ecoScore - a.ecoScore],
  ecoLow: ['Eco score, low to high', (a, b) => a.ecoScore - b.ecoScore],
  carbon: ['Carbon, high to low', (a, b) => b.carbon.totalKg - a.carbon.totalKg],
};

export default function ProductsPage() {
  useDocumentTitle('Products');
  const { graph } = useData();
  const [view, setView] = useLocalStorage('sct.productView', 'list');
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [band, setBand] = useState('all');
  const [sort, setSort] = useState('recent');

  const categories = useMemo(() => [...new Set(graph.products.map((p) => p.category))].sort(), [graph]);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return graph.products
      .filter((p) => (category === 'all' || p.category === category) && (status === 'all' || p.status === status) && (band === 'all' || p.eco.band.key === band))
      .filter((p) => !needle || [p.name, p.traceId, p.batchNumber, p.origin, ...p.materials.map((m) => m.name), ...p.suppliers.map((s) => s.name)].join(' ').toLowerCase().includes(needle))
      .sort(SORTS[sort][1]);
  }, [graph, q, category, status, band, sort]);

  const filtered = q || category !== 'all' || status !== 'all' || band !== 'all';
  const clear = () => { setQ(''); setCategory('all'); setStatus('all'); setBand('all'); };

  const columns = [
    { key: 'name', label: 'Product', primary: true, render: (p) => (<span className="cell-prod"><ProductArt product={p} ratio="1 / 1" className="cell-prod__art" /><span><strong>{p.name}</strong><span className="meta mono d-block">{p.traceId}</span></span></span>) },
    { key: 'category', label: 'Category' },
    { key: 'batchNumber', label: 'Batch', render: (p) => <span className="mono">{p.batchNumber}</span> },
    { key: 'origin', label: 'Made in' },
    { key: 'materials', label: 'Materials', render: (p) => <span className="meta">{p.materials.length} {p.materials.length === 1 ? 'material' : 'materials'}: {p.materials.map((m) => m.name).slice(0, 2).join(', ')}{p.materials.length > 2 ? '…' : ''}</span> },
    { key: 'status', label: 'Production', render: (p) => <ProductStatusBadge status={p.status} /> },
    { key: 'supplier', label: 'Suppliers', render: (p) => <VerificationBadge status={p.supplierStatus} /> },
    { key: 'eco', label: 'Eco score', align: 'end', render: (p) => <EcoChip score={p.ecoScore} band={p.eco.band} /> },
  ];

  return (
    <>
      <PageHead title="Products" actions={<Link className="btn btn-primary" to="/products/new"><Plus size={18} aria-hidden="true" />Add product</Link>}>
        Every product, with where it stands on production, suppliers and sustainability.
      </PageHead>

      <form className="filters" role="search" aria-label="Filter products" onSubmit={(e) => e.preventDefault()}>
        <div className="filters__search">
          <label htmlFor="pq" className="visually-hidden">Search products</label>
          <Search size={16} aria-hidden="true" />
          <input id="pq" className="form-control" type="search" placeholder="Search name, ID, batch, material or supplier" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div><label htmlFor="pc" className="form-label">Category</label><select id="pc" className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label htmlFor="ps" className="form-label">Production</label><select id="ps" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">Any status</option>{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
        <div><label htmlFor="pb" className="form-label">Eco score</label><select id="pb" className="form-select" value={band} onChange={(e) => setBand(e.target.value)}><option value="all">Any score</option>{BANDS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}</select></div>
        <div><label htmlFor="po" className="form-label">Sort by</label><select id="po" className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>{Object.entries(SORTS).map(([k, [l]]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div className="filters__view" role="group" aria-label="View">
          <button type="button" className={`btn btn-sm ${view === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={16} aria-hidden="true" />List</button>
          <button type="button" className={`btn btn-sm ${view === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={view === 'grid'} onClick={() => setView('grid')}><LayoutGrid size={16} aria-hidden="true" />Grid</button>
        </div>
      </form>

      <p className="meta" role="status" aria-live="polite">{rows.length} of {graph.products.length} products{filtered && <> <button className="linklike" onClick={clear}>Clear filters</button></>}</p>

      {graph.products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" action={{ label: 'Add your first product', to: '/products/new' }}>Add a product to start tracing its materials, suppliers and journey.</EmptyState>
      ) : rows.length === 0 ? (
        <EmptyState icon={SearchX} title="No products match those filters" action={{ label: 'Clear filters', onClick: clear }}>Try a different search, or remove a filter.</EmptyState>
      ) : view === 'grid' ? (
        <div className="pgrid">{rows.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      ) : (
        <DataTable columns={columns} rows={rows} getHref={(p) => `/products/${p.id}`} caption="Products" />
      )}
    </>
  );
}
