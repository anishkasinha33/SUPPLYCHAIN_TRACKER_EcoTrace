/** Explains an eco score: each factor, how much it can add, and how much it did. */
export function ScoreBreakdown({ factors }) {
  return (
    <ul className="breakdown">
      {factors.map((f) => (
        <li key={f.key}>
          <div className="breakdown__row">
            <span className="breakdown__label">{f.label}</span>
            <span className="num breakdown__pts">{f.points.toFixed(1)} <span className="muted">of {f.weight}</span></span>
          </div>
          <div className="breakdown__track" aria-hidden="true"><span style={{ width: `${f.ratio * 100}%` }} /></div>
          <p className="meta m-0">{f.detail}</p>
        </li>
      ))}
    </ul>
  );
}

export function MetricBlock({ label, value, unit, context, icon: Icon }) {
  return (
    <div className="metric">
      <div className="metric__label">{Icon && <Icon size={15} aria-hidden="true" />}{label}</div>
      <div className="metric__value num">{value}{unit && <span className="metric__unit">{unit}</span>}</div>
      {context && <p className="metric__ctx">{context}</p>}
    </div>
  );
}
