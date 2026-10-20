import { Link } from 'react-router-dom';
import { Logo } from './Logo.jsx';
import { ThemeToggle } from './ThemeToggle.jsx';
import { TopoField } from '../charts/TopoField.jsx';

export function AuthLayout({ title, intro, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth__side">
        <TopoField lines={14} clusters={[[0.7, 0.4]]} />
        <div className="auth__side-in">
          <Logo inverse />
          <div>
            <p className="auth__quote">&ldquo;Our customers keep asking where the cotton comes from. Now we send them a link.&rdquo;</p>
            <p className="meta auth__quote-by">Sample story for a fictional business, Kora &amp; Kin Studio</p>
          </div>
        </div>
      </aside>
      <main className="auth__main" id="main">
        <div className="auth__bar"><Link to="/" className="meta">Back to home</Link><ThemeToggle /></div>
        <div className="auth__card">
          <h1>{title}</h1>
          <p className="muted">{intro}</p>
          <p className="demo-note" role="note"><strong>Demo sign-in.</strong> This is a front-end simulation, not secure authentication. Do not use a real password.</p>
          {children}
          <div className="auth__foot">{footer}</div>
        </div>
      </main>
    </div>
  );
}
