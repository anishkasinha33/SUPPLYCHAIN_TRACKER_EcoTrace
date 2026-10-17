import { Link, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { PassportView } from '../components/passport/Passport.jsx';
import { Logo } from '../components/layout/Logo.jsx';
import { ThemeToggle } from '../components/layout/ThemeToggle.jsx';
import { Loader } from '../components/common/States.jsx';
import { DEMO_USER } from '../data/users.js';

/** Public page. No login needed. This is where the QR code or link points. */
export default function PassportPage() {
  const { traceId } = useParams();
  const { graph, status } = useData();
  const { user } = useAuth();
  const product = graph?.products.find((p) => p.traceId.toLowerCase() === (traceId || '').toLowerCase());
  useDocumentTitle(product ? `${product.name} passport` : 'Product passport');

  return (
    <div className="public">
      <header className="public__bar"><Logo /><ThemeToggle /></header>
      <main id="main" className="public__main">
        {status === 'loading' && <Loader label="Loading product passport" />}
        {status === 'ready' && product && <PassportView product={product} businessName={(user || DEMO_USER).businessName} />}
        {status === 'ready' && !product && (
          <div className="state"><h1>We could not find that product</h1><p>Check the traceability ID in the link or QR code: <span className="mono">{traceId}</span>.</p><Link className="btn btn-primary" to="/">Go to EcoTrace</Link></div>
        )}
      </main>
    </div>
  );
}
