import { DataTable } from '../common/DataTable.jsx';
import { MODES, ESTIMATE_NOTE } from '../../utils/carbon.js';
import { STAGE_LABELS, fmtKg, fmtPct } from '../../utils/format.js';

/** Every transport leg: where from and to, how far, how, and its share of the product's transport CO2e. */
export function LegTable({ legs }) {
  const columns = [
    { key: 'route', label: 'Leg', primary: false, render: (l) => (<span><strong>{STAGE_LABELS[l.from?.stageName]}</strong> to <strong>{STAGE_LABELS[l.to?.stageName]}</strong><span className="meta d-block">{l.from?.location} to {l.to?.location}</span></span>) },
    { key: 'distanceKm', label: 'Distance', render: (l) => <span className="num">{l.distanceKm.toLocaleString('en-IN')} km</span> },
    { key: 'mode', label: 'Mode', render: (l) => <span className="mode"><span className="mode__key" style={{ background: `var(${MODES[l.mode].cssVar})` }} aria-hidden="true" />{MODES[l.mode].label}</span> },
    { key: 'co2e', label: 'CO₂e (est.)', align: 'end', render: (l) => <span className="num">{fmtKg(l.co2e)}</span> },
    { key: 'share', label: 'Share of transport emissions', render: (l) => (<span className="share"><span className="share__track" aria-hidden="true"><span style={{ width: `${l.share * 100}%`, background: `var(${MODES[l.mode].cssVar})` }} /></span><span className="num">{fmtPct(l.share * 100)}</span></span>) },
  ];
  return (
    <>
      <DataTable columns={columns} rows={legs} caption="Transport legs and their emissions" />
      <p className="meta mt-2">{ESTIMATE_NOTE} Share is each leg's part of this product's transport emissions.</p>
    </>
  );
}
