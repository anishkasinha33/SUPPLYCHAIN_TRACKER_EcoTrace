/** In-page jump that works with hash routing (a plain #anchor would be read as a route). */
export const jump = (id) => (e) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (el.tabIndex < 0) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
};
