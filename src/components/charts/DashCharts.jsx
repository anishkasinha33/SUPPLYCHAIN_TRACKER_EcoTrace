import { useId, useRef, useState } from 'react';

/** Half-circle gauge. value/max fills the arc. */
export function ArcGauge({ value, max, label }) {
  const r = 52, cx = 60, cy = 62;
  const len = Math.PI * r;
  const frac = Math.max(0, Math.min(1, value / (max || 1)));
  const d = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  return (
    <svg className="arc" viewBox="0 0 120 70" role="img" aria-label={label}>
      <path d={d} className="arc__track" pathLength={len} />
      <path d={d} className="arc__fill" strokeDasharray={`${len * frac} ${len}`} />
      <circle cx={cx + r * Math.cos(Math.PI * (1 - frac))} cy={cy - r * Math.sin(Math.PI * (1 - frac))} r="5" className="arc__dot" />
    </svg>
  );
}

/** Grid of dots: one per supplier, coloured by status. */
export function DotMatrix({ items, label }) {
  return (
    <ul className="dots" aria-label={label}>
      {items.map((it, i) => <li key={i} className={`dots__dot dots__dot--${it}`} title={it} />)}
    </ul>
  );
}

/** Small bars. highlight = index drawn in the strong colour. */
export function MiniBars({ values, max, highlight = -1, label }) {
  const m = max || Math.max(...values, 1);
  return (
    <div className="mini" role="img" aria-label={label}>
      {values.map((v, i) => <span key={i} className={i === highlight ? 'is-on' : ''} style={{ height: `${Math.max(8, (v / m) * 100)}%` }} />)}
    </div>
  );
}

/**
 * Two-series line chart with a hover/keyboard tooltip.
 * points: [{ label, a, b }] ; a and b are 0..100.
 */
export function PerformanceChart({ points, aName, bName, summary }) {
  const id = useId();
  const ref = useRef(null);
  const [hover, setHover] = useState(null);
  const W = 720, H = 260, L = 34, R = 14, T = 16, B = 30;
  const iw = W - L - R, ih = H - T - B;
  const x = (i) => L + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v) => T + ih - (v / 100) * ih;
  const path = (k) => points.map((p, i) => `${i ? 'L' : 'M'} ${x(i).toFixed(1)} ${y(p[k]).toFixed(1)}`).join(' ');
  const area = (k) => `${path(k)} L ${x(points.length - 1)} ${T + ih} L ${x(0)} ${T + ih} Z`;
  const move = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round(((px - L) / iw) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  };
  const hp = hover != null ? points[hover] : null;
  return (
    <div className="perf">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="perf__svg" role="img" aria-label={summary}
        onPointerMove={move} onPointerLeave={() => setHover(null)}
        tabIndex={0} onKeyDown={(e) => {
          if (e.key === 'ArrowRight') setHover((h) => Math.min(points.length - 1, (h ?? -1) + 1));
          if (e.key === 'ArrowLeft') setHover((h) => Math.max(0, (h ?? points.length) - 1));
          if (e.key === 'Escape') setHover(null);
        }} onBlur={() => setHover(null)}>
        <defs>
          <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--chart-a)" stopOpacity="0.28" /><stop offset="1" stopColor="var(--chart-a)" stopOpacity="0.02" /></linearGradient>
          <pattern id={`${id}h`} width="5" height="5" patternUnits="userSpaceOnUse"><path d="M1 0 V5" stroke="var(--chart-b)" strokeWidth="1" opacity="0.28" /></pattern>
        </defs>
        {[0, 25, 50, 75, 100].map((t) => (
          <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="perf__grid" /><text x={L - 8} y={y(t) + 4} textAnchor="end" className="perf__tick">{t}</text></g>
        ))}
        <path d={area('b')} fill={`url(#${id}h)`} />
        <path d={area('a')} fill={`url(#${id}a)`} />
        <path d={path('b')} className="perf__line perf__line--b" />
        <path d={path('a')} className="perf__line perf__line--a" />
        {points.map((p, i) => <text key={i} x={x(i)} y={H - 8} textAnchor={i === points.length - 1 ? "end" : "middle"} className="perf__tick">{p.label}</text>)}
        {hp && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={T} y2={T + ih} className="perf__cursor" />
            <circle cx={x(hover)} cy={y(hp.a)} r="5" className="perf__pt perf__pt--a" />
            <circle cx={x(hover)} cy={y(hp.b)} r="5" className="perf__pt perf__pt--b" />
          </g>
        )}
      </svg>
      {hp && (
        <div className="perf__tip" style={{ left: `${(x(hover) / W) * 100}%` }} role="status">
          <strong>{hp.name}</strong>
          <span><i className="sw sw--a" />{aName} {Math.round(hp.a)}</span>
          <span><i className="sw sw--b" />{bName} {Math.round(hp.b)}%</span>
        </div>
      )}
      <table className="visually-hidden">
        <caption>{summary}</caption>
        <thead><tr><th>Batch</th><th>{aName}</th><th>{bName}</th></tr></thead>
        <tbody>{points.map((p, i) => <tr key={i}><th>{p.name}</th><td>{Math.round(p.a)}</td><td>{Math.round(p.b)}%</td></tr>)}</tbody>
      </table>
    </div>
  );
}
