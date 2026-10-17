import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Topbar } from './Topbar.jsx';
import { useData } from '../../context/DataContext.jsx';
import { jump } from '../../utils/dom.js';
import { ErrorState, Loader } from '../common/States.jsx';

export function AppShell() {
  const { status, error, reload } = useData();
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="shell">
      <a href="#main" className="skip-link" onClick={jump('main')}>Skip to content</a>
      <div className="shell__main">
        <Topbar />
        <main id="main" className="page" tabIndex={-1}>
          {status === 'loading' && <Loader label="Loading your supply chain" />}
          {status === 'error' && <ErrorState onRetry={reload}>{error}</ErrorState>}
          {status === 'ready' && <Outlet />}
        </main>
      </div>
    </div>
  );
}
