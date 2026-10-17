import { useRef } from 'react';

/** Tabs with arrow-key navigation. `tabs` = [{ id, label, count? }]. */
export function Tabs({ tabs, active, onChange, label }) {
  const refs = useRef({});
  const onKey = (e, i) => {
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if (next != null) { e.preventDefault(); onChange(tabs[next].id); refs.current[tabs[next].id]?.focus(); }
  };
  return (
    <div className="ttabs" role="tablist" aria-label={label}>
      {tabs.map((t, i) => (
        <button key={t.id} ref={(el) => (refs.current[t.id] = el)} role="tab" id={`tab-${t.id}`} aria-selected={active === t.id} aria-controls={`panel-${t.id}`} tabIndex={active === t.id ? 0 : -1} className="ttabs__tab" onClick={() => onChange(t.id)} onKeyDown={(e) => onKey(e, i)}>
          {t.label}{t.count != null && <span className="ttabs__count num">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export const TabPanel = ({ id, active, children }) => (active === id ? <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} tabIndex={0}>{children}</div> : null);
