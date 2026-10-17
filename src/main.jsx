import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, MemoryRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/soft.css';
import { loadFonts } from './fonts.js';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { DataProvider } from './context/DataContext.jsx';
import { ToastProvider } from './components/common/States.jsx';

loadFonts();

// Embedded previews (about:blank, srcdoc) have no valid base address, which makes the router's URL parsing throw.
// Retry with a placeholder base so hash routing works there too, and keeps real in-page links.
const NativeURL = window.URL;
function SafeURL(url, base) {
  try { return new NativeURL(url, base); } catch (e) { return new NativeURL(url, 'http://localhost'); }
}
SafeURL.prototype = NativeURL.prototype;
Object.assign(SafeURL, NativeURL);
window.URL = SafeURL;

// Real page address: hash routing. Embedded preview (about:blank / srcdoc): in-memory routing, and in-app links are
// rewritten to "#" so the host never mistakes them for external links. Clicks still navigate through the router.
const embedded = !/^(https?|file):/.test(window.location.href);
const Router = embedded ? MemoryRouter : HashRouter;
if (embedded) {
  const fix = (root) => root.querySelectorAll?.('a[href^="/"]').forEach((a) => a.setAttribute('href', '#'));
  new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) { if (n.matches('a[href^="/"]')) n.setAttribute('href', '#'); fix(n); } }))).observe(document.documentElement, { childList: true, subtree: true });
  fix(document);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  </StrictMode>,
);
