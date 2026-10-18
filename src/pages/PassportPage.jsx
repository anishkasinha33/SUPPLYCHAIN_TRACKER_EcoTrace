import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PassportView } from '../components/passport/Passport.jsx';
import { Logo } from '../components/layout/Logo.jsx';
import { ThemeToggle } from '../components/layout/ThemeToggle.jsx';
import { ErrorState, Loader } from '../components/common/States.jsx';
import { api } from '../services/api.js';
import { buildGraph } from '../utils/graph.js';

/** Public page. No login needed. This is where the QR code or link points. */
export default function PassportPage() {
  const { traceId } = useParams();
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    api(`/public/passports/${encodeURIComponent(traceId || '')}`)
      .then(({ raw, business }) => {
        if (!alive) return;
        const product = buildGraph(raw, business).products[0];
        setState(product ? { status: 'ready', product, business } : { status: 'missing' });
      })
      .catch((err) => { if (alive) setState({ status: err.status === 404 ? 'missing' : 'error', message: err.message }); });
    return () => { alive = false; };
  }, [traceId]);

  const { status, product, business } = state;
  useDocumentTitle(product ? `${product.name} passport` : 'Product passport');

  return (
    <div className="public">
      <header className="public__bar"><Logo /><ThemeToggle /></header>
      <main id="main" className="public__main">
        {status === 'loading' && <Loader label="Loading product passport" />}
        {status === 'ready' && <PassportView product={product} businessName={business.businessName} />}
        {status === 'missing' && (
          <div className="state"><h1>We could not find that product</h1><p>Check the traceability ID in the link or QR code: <span className="mono">{traceId}</span>.</p><Link className="btn btn-primary" to="/">Go to EcoTrace</Link></div>
        )}
        {status === 'error' && <ErrorState>{state.message}</ErrorState>}
      </main>
    </div>
  );
}
