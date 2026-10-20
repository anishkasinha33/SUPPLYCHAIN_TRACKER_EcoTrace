import { MODES } from '../../utils/carbon.js';
import { fmtKg } from '../../utils/format.js';

/** One bar per product's transport emissions, split by leg and coloured by mode. */
export function EmissionsBar({ legs }) {
  const total = legs.reduce((s, l) => s + l.co2e, 0);
  const modes = [...new Set(legs.map((l) => l.mode))];
  return (
    <figure className="comp">
      <div className="comp__bar" role="img" aria-label={`Transport emissions ${fmtKg(total)} CO2e, split across ${legs.length} legs`}>
        {legs.filter((l) => l.co2e > 0).map((l) => (
          <span key={l.id} className="comp__seg" style={{ width: `${l.share * 100}%`, background: `var(${MODES[l.mode].cssVar})` }} title={`${l.from?.location} to ${l.to?.location}: ${fmtKg(l.co2e)} CO₂e`} />
        ))}
      </div>
      <figcaption>
        <ul className="comp__legend">
          {modes.map((m) => (
            <li key={m}>
              <span className="comp__key" style={{ background: `var(${MODES[m].cssVar})` }} aria-hidden="true" />
              <span>{MODES[m].label}</span>
              <span className="num muted">{fmtKg(legs.filter((l) => l.mode === m).reduce((s, l) => s + l.co2e, 0))}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
