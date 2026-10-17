const COLORS = ['var(--accent)', 'var(--signal)', 'var(--info)', 'var(--eco-3)', 'var(--danger)', 'var(--verified)', 'var(--rule-strong)'];

/** Stacked bar showing how a whole splits into parts, with a legend that carries the numbers. */
export function CompositionBar({ parts, unit = 'kg', label }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <figure className="comp" aria-label={label}>
      <div className="comp__bar" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)} percent`).join(', ')}>
        {parts.map((p, i) => (
          <span key={p.label} className="comp__seg" style={{ width: `${(p.value / total) * 100}%`, background: COLORS[i % COLORS.length] }} title={`${p.label}: ${Math.round(p.value)} ${unit}`} />
        ))}
      </div>
      <figcaption>
        <ul className="comp__legend">
          {parts.map((p, i) => (
            <li key={p.label}>
              <span className="comp__key" style={{ background: COLORS[i % COLORS.length] }} aria-hidden="true" />
              <span>{p.label}</span>
              <span className="num muted">{Math.round((p.value / total) * 100)}%</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
