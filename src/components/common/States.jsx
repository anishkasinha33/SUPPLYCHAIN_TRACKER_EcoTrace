import { createContext, useCallback, useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';

export function EmptyState({ title, children, action, icon: Icon }) {
  return (
    <div className="state state--empty">
      {Icon && <Icon size={28} aria-hidden="true" strokeWidth={1.5} />}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action && (action.to ? <Link className="btn btn-primary" to={action.to}>{action.label}</Link> : <button className="btn btn-primary" onClick={action.onClick}>{action.label}</button>)}
    </div>
  );
}

export function Loader({ label = 'Loading' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <svg className="loader" width="72" height="24" viewBox="0 0 72 24" aria-hidden="true"><path d="M4 18 C16 18 16 6 36 6 S56 18 68 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" pathLength="1" /><circle cx="4" cy="18" r="3" fill="currentColor" /><circle cx="68" cy="18" r="3" fill="currentColor" /></svg>
      <span className="muted">{label}</span>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', children, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <CircleAlert size={28} aria-hidden="true" strokeWidth={1.5} />
      <h3>{title}</h3>
      <p>{children}</p>
      {onRetry && <button className="btn btn-outline-primary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

const ToastCtx = createContext(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((message, tone = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setItems((x) => [...x, { id, message, tone }]);
    setTimeout(() => setItems((x) => x.filter((t) => t.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="toasts" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`toast-item toast-item--${t.tone}`} role="status">
            {t.tone === 'success' ? <CircleCheck size={18} aria-hidden="true" /> : t.tone === 'error' ? <CircleAlert size={18} aria-hidden="true" /> : <Info size={18} aria-hidden="true" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
