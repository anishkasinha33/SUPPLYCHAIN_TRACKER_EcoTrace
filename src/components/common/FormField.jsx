import { useId } from 'react';

/** Label + control + hint + error, wired together for screen readers. */
export function FormField({ label, error, hint, as = 'input', children, className = '', required, ...props }) {
  const id = useId();
  const describedBy = [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined;
  const common = { id, 'aria-invalid': !!error || undefined, 'aria-describedby': describedBy, className: `${as === 'select' ? 'form-select' : 'form-control'} ${error ? 'is-invalid' : ''}`, ...props };
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={id} className="form-label">{label}{required && <span aria-hidden="true" className="muted"> (required)</span>}</label>
      {as === 'select' ? <select {...common}>{children}</select> : as === 'textarea' ? <textarea rows={3} {...common} /> : <input {...common} />}
      {hint && <div id={`${id}-hint`} className="form-text">{hint}</div>}
      {error && <div id={`${id}-err`} className="invalid-feedback d-block" role="alert">{error}</div>}
    </div>
  );
}

export function Switch({ label, hint, checked, onChange, disabled, soon }) {
  const id = useId();
  return (
    <div className="switch-row">
      <div>
        <label htmlFor={id} className="form-label mb-0">{label}{soon && <span className="soon">Coming soon</span>}</label>
        {hint && <div className="form-text">{hint}</div>}
      </div>
      <div className="form-check form-switch m-0">
        <input id={id} className="form-check-input" type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} />
      </div>
    </div>
  );
}
