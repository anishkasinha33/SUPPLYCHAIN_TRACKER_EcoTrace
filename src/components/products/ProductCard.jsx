import { Link } from 'react-router-dom';
import { ProductArt } from '../charts/ProductArt.jsx';
import { EcoChip, ProductStatusBadge, VerificationBadge } from '../common/Badge.jsx';

export function ProductCard({ product: p }) {
  return (
    <article className="pcard">
      <Link to={`/products/${p.id}`} className="pcard__art" aria-label={`Open ${p.name}`} tabIndex={-1}><ProductArt product={p} /></Link>
      <div className="pcard__body">
        <div className="pcard__top"><span className="meta">{p.category}</span><EcoChip score={p.ecoScore} band={p.eco.band} /></div>
        <h3><Link to={`/products/${p.id}`}>{p.name}</Link></h3>
        <p className="meta mono m-0">{p.traceId} / {p.batchNumber}</p>
        <div className="pcard__badges"><ProductStatusBadge status={p.status} /><VerificationBadge status={p.supplierStatus} /></div>
        <p className="meta m-0">{p.materials.map((m) => m.name).join(', ')}</p>
      </div>
    </article>
  );
}
