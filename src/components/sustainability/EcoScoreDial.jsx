/** 270-degree dial. The number is always shown with its band label. */
export function EcoScoreDial({ score, band, size = 168 }) {
  const r = 62, C = 2 * Math.PI * r, arc = 0.75 * C;
  return (
    <div className="dial" style={{ width: size, height: size }} role="img" aria-label={`Eco score ${score} out of 100, ${band.label}`}>
      <svg viewBox="0 0 160 160" width={size} height={size} aria-hidden="true">
        <circle cx="80" cy="80" r={r} fill="none" stroke="var(--rule)" strokeWidth="10" strokeDasharray={`${arc} ${C}`} transform="rotate(135 80 80)" strokeLinecap="butt" />
        <circle cx="80" cy="80" r={r} fill="none" stroke={`var(--eco-${band.level})`} strokeWidth="10" strokeDasharray={`${(arc * score) / 100} ${C}`} transform="rotate(135 80 80)" strokeLinecap="butt" />
      </svg>
      <div className="dial__center">
        <span className="dial__num num">{score}</span>
        <span className="dial__band">{band.label}</span>
      </div>
    </div>
  );
}
