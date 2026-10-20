import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, ExternalLink, Laptop, Smartphone, EyeOff } from 'lucide-react';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PageHead } from '../components/common/PageHead.jsx';
import { PassportView } from '../components/passport/Passport.jsx';
import { useToast } from '../components/common/States.jsx';

/** Illustrative QR-style pattern. Not scannable; real QR generation is a future integration. */
function QrPlaceholder({ seed }) {
  const n = 21; let h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 11);
  const cells = [];
  const finder = (x, y) => (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    h = (h * 1103515245 + 12345) >>> 0;
    let on = (h >> 16) % 2 === 0;
    if (finder(x, y)) { const fx = x < 7 ? x : x - (n - 7); const fy = y < 7 ? y : y - (n - 7); on = Math.max(Math.abs(fx - 3), Math.abs(fy - 3)) !== 2; }
    if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  }
  return <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className="qr" role="img" aria-label="Illustrative QR-style pattern, not scannable"><rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" /><g fill="#111">{cells}</g></svg>;
}

export default function ConsumerViewPage() {
  useDocumentTitle('Consumer view');
  const { graph } = useData();
  const { user } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [device, setDevice] = useState('desktop');
  const product = graph.products.find((p) => p.id === params.get('product')) || graph.products[0];
  const url = `${window.location.origin}${window.location.pathname}#/p/${product.traceId}`;
  const copy = async () => { try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch { toast('Copy failed. Select the link and copy it by hand.', 'error'); } };

  return (
    <>
      <PageHead title="Consumer view">Preview the public product passport your customers see, and get the link or QR code to share it.</PageHead>
      <div className="cv-bar">
        <div><label htmlFor="cvp" className="form-label">Product</label><select id="cvp" className="form-select" value={product.id} onChange={(e) => setParams({ product: e.target.value })}>{graph.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
        <div className="cv-bar__link"><label htmlFor="cvl" className="form-label">Public link</label><div className="cv-bar__row"><input id="cvl" className="form-control mono" readOnly value={url} onFocus={(e) => e.target.select()} /><button className="btn btn-outline-primary" onClick={copy}><Copy size={16} aria-hidden="true" />Copy</button><Link className="btn btn-primary" to={`/p/${product.traceId}`} target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" />Open page</Link></div></div>
        <div className="cv-bar__qr"><QrPlaceholder seed={product.traceId} /><span className="meta">QR preview. Illustrative only, not scannable yet.</span></div>
      </div>

      <div className="cv-hide"><EyeOff size={16} aria-hidden="true" /><span>Never shown to customers: prices, supplier contracts, supplier ratings and internal review status.</span></div>

      <div className="cv-device" role="group" aria-label="Preview size">
        <button className={`btn btn-sm ${device === 'desktop' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}><Laptop size={16} aria-hidden="true" />Desktop</button>
        <button className={`btn btn-sm ${device === 'mobile' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}><Smartphone size={16} aria-hidden="true" />Mobile</button>
      </div>
      <div className={`cv-frame cv-frame--${device}`}><PassportView product={product} businessName={user.businessName} /></div>
    </>
  );
}
