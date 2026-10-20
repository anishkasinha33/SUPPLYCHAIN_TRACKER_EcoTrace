import { MODES } from '../../utils/carbon.js';
import { STAGE_LABELS } from '../../utils/format.js';
import { StageStatusBadge } from '../common/Badge.jsx';
import { StageDetail } from './StageDetail.jsx';

const W = 1000, H = 330;
const short = (s, n = 24) => (s && s.length > n ? s.slice(0, n - 1) + '…' : s || '');

function layout(count) {
  const step = (W - 120) / Math.max(1, count - 1);
  return Array.from({ length: count }, (_, i) => ({ x: 60 + i * step, y: i % 2 === 0 ? 120 : 210 }));
}

/**
 * The pipeline as a route: nodes are stages, the path between them is a transport leg.
 * Path thickness grows with that leg's share of transport emissions.
 * Desktop: winding SVG. Small screens: a vertical, touch-friendly list (same data, same selection).
 */
export function RouteMap({ product, selectedId, onSelect }) {
  const { stages, legs } = product;
  const pts = layout(stages.length);
  const legBetween = (a, b) => legs.find((l) => l.fromStageId === stages[a].id && l.toStageId === stages[b].id);

  return (
    <div className="route">
      <svg className="route__svg" viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Pipeline for ${product.name}`}>
        {stages.slice(0, -1).map((s, i) => {
          const a = pts[i], b = pts[i + 1], leg = legBetween(i, i + 1);
          const mx = (a.x + b.x) / 2;
          const d = `M${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
          return (
            <g key={s.id}>
              <path d={d} fill="none" stroke={leg ? `var(${MODES[leg.mode].cssVar})` : 'var(--rule-strong)'} strokeWidth={leg ? 3 + leg.share * 18 : 2} strokeDasharray={leg ? undefined : '3 6'} strokeLinecap="round" opacity={leg ? 0.9 : 1} />
              {leg && (
                <g transform={`translate(${mx} ${(a.y + b.y) / 2})`}>
                  <rect x="-34" y="-17" width="68" height="34" rx="3" fill="var(--bg)" stroke="var(--rule)" />
                  <text textAnchor="middle" y="-2" className="route__leg">{leg.distanceKm.toLocaleString('en-IN')} km</text>
                  <text textAnchor="middle" y="12" className="route__leg route__leg--mode">{MODES[leg.mode].label.toLowerCase()}</text>
                </g>
              )}
            </g>
          );
        })}
        {stages.map((s, i) => {
          const p = pts[i], sel = s.id === selectedId, above = i % 2 === 0;
          return (
            <g key={s.id} className={`route__node route__node--${s.status}`} transform={`translate(${p.x} ${p.y})`} role="button" tabIndex={0} aria-pressed={sel} aria-label={`${STAGE_LABELS[s.stageName]}, ${s.location}, ${s.status}`} onClick={() => onSelect(s.id)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(s.id))}>
              {sel && <circle r="24" className="route__ring" />}
              <circle r="15" className="route__dot" />
              {s.status === 'complete' && <path d="M-6 0 L-2 4 L6 -4" className="route__tick" />}
              <text y={above ? -36 : 44} textAnchor="middle" className="route__name">{STAGE_LABELS[s.stageName]}</text>
              <text y={above ? -22 : 58} textAnchor="middle" className="route__org">{short(s.organization?.name, 22)}</text>
            </g>
          );
        })}
      </svg>

      <ol className="route__list">
        {stages.map((s, i) => {
          const leg = i > 0 ? legBetween(i - 1, i) : null;
          const sel = s.id === selectedId;
          return (
            <li key={s.id} className={`rl rl--${s.status}`}>
              {leg && <div className="rl__leg" style={{ '--w': `${3 + leg.share * 14}px`, '--c': `var(${MODES[leg.mode].cssVar})` }}><span>{leg.distanceKm.toLocaleString('en-IN')} km by {MODES[leg.mode].label.toLowerCase()}</span></div>}
              <button className="rl__btn" aria-expanded={sel} onClick={() => onSelect(sel ? null : s.id)}>
                <span className="rl__dot" aria-hidden="true" />
                <span className="rl__text"><strong>{STAGE_LABELS[s.stageName]}</strong><span className="meta">{s.organization?.name}</span></span>
                <StageStatusBadge status={s.status} />
              </button>
              {sel && <div className="rl__detail"><StageDetail stage={s} product={product} /></div>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
