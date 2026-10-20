import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/** Accessible modal using Bootstrap's modal markup. Escape closes, focus is trapped and restored. */
export function Modal({ open, title, onClose, children, footer, size = '' }) {
  const ref = useRef(null);
  const last = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    last.current = document.activeElement;
    document.body.classList.add('modal-open');
    const node = ref.current;
    const focusables = () => node.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
    (focusables()[0] || node).focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = [...focusables()];
        if (!f.length) return;
        const first = f[0], lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); lastEl.focus(); }
        else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
      last.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className="modal d-block" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className={`modal-dialog modal-dialog-centered ${size}`}>
          <div className="modal-content" ref={ref} tabIndex={-1}>
            <div className="modal-header">
              <h2 className="modal-title" id="modal-title" style={{ fontSize: '1.375rem' }}>{title}</h2>
              <button type="button" className="btn btn-quiet btn-sm" onClick={onClose} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
