import { Link } from 'react-router-dom';
import { StageStatusBadge } from '../common/Badge.jsx';
import { MODES } from '../../utils/carbon.js';
import { STAGE_LABELS, fmtDate, fmtKg } from '../../utils/format.js';

export function StageDetail({ stage, product }) {
  const org = stage.organization;
  return (
    <div className="stage-detail">
      <div className="stage-detail__head">
        <h3>{STAGE_LABELS[stage.stageName]}</h3>
        <StageStatusBadge status={stage.status} />
      </div>
      <dl className="facts">
        <div><dt>Organisation</dt><dd>{org?.href ? <Link to={org.href}>{org.name}</Link> : org?.name}</dd></div>
        <div><dt>Location</dt><dd>{stage.location}</dd></div>
        <div><dt>Date</dt><dd>{fmtDate(stage.date)}</dd></div>
        <div><dt>Duration</dt><dd>{stage.durationDays} {stage.durationDays === 1 ? 'day' : 'days'}</dd></div>
        {stage.stageName === 'source' && <div><dt>Embedded in materials</dt><dd>{fmtKg(product.carbon.materialsKg)} CO₂e</dd></div>}
        <div>
          <dt>Emissions leaving this stage</dt>
          <dd>{stage.outboundLegs.length ? stage.outboundLegs.map((l) => `${fmtKg(l.co2e)} CO₂e (${l.distanceKm.toLocaleString('en-IN')} km by ${MODES[l.mode].label.toLowerCase()})`).join('; ') : 'None. The next stage is on the same site.'}</dd>
        </div>
      </dl>
      {stage.materials.length > 0 && (
        <>
          <h4 className="mt-3">Materials at this stage</h4>
          <ul className="inline-list">
            {stage.materials.map((m) => <li key={m.id}><Link to={`/materials/${m.id}`}>{m.name}</Link> <span className="meta num">{m.quantityKg} kg</span></li>)}
          </ul>
        </>
      )}
    </div>
  );
}
