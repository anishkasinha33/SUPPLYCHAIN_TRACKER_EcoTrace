import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  const { isAuthed } = useAuth();
  return (
    <main className="notfound" id="main">
      <svg viewBox="0 0 240 80" width="240" aria-hidden="true"><path d="M6 60 C40 60 40 20 90 20 S130 52 150 52" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" /><path d="M150 52 L184 52" stroke="var(--rule-strong)" strokeWidth="3" strokeDasharray="3 8" strokeLinecap="round" /><circle cx="6" cy="60" r="5" fill="var(--signal)" /></svg>
      <h1>This route ends here</h1>
      <p className="lead">The page you tried to open does not exist. It may have moved, or the link is mistyped.</p>
      <div className="d-flex gap-2 justify-content-center"><Link className="btn btn-primary" to={isAuthed ? '/dashboard' : '/'}>{isAuthed ? 'Back to dashboard' : 'Back to home'}</Link></div>
    </main>
  );
}
