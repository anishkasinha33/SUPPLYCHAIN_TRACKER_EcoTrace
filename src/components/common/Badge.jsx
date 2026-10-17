import { BadgeCheck, Clock3, TriangleAlert, ShieldCheck, FileText, CircleHelp, Factory, Truck, Warehouse, Sprout, CircleDashed, CircleCheck, Loader } from 'lucide-react';
import { STATUS_LABELS, VERIFICATION_LABELS, FAIR_LABOR_LABELS } from '../../utils/format.js';

/** Status badge. Always shows an icon AND text, so meaning never depends on colour alone. */
export function Badge({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span className={`tbadge tbadge--${tone} ${className}`}>
      {Icon && <Icon size={14} aria-hidden="true" strokeWidth={2} />}
      <span>{children}</span>
    </span>
  );
}

const VER = { verified: ['verified', BadgeCheck], pending: ['warning', Clock3], 'needs-review': ['danger', TriangleAlert] };
export function VerificationBadge({ status }) {
  const [tone, Icon] = VER[status] || ['neutral', CircleHelp];
  return <Badge tone={tone} icon={Icon}>{VERIFICATION_LABELS[status] || status}</Badge>;
}

const FAIR = { certified: ['success', ShieldCheck], 'self-declared': ['warning', FileText], 'not-assessed': ['danger', CircleHelp] };
export function FairLaborBadge({ status }) {
  const [tone, Icon] = FAIR[status] || ['neutral', CircleHelp];
  return <Badge tone={tone} icon={Icon}>{FAIR_LABOR_LABELS[status] || status}</Badge>;
}

const PROD = { planned: ['neutral', CircleDashed], 'in-production': ['info', Factory], 'in-transit': ['warning', Truck], 'in-warehouse': ['info', Warehouse], 'on-sale': ['success', Sprout] };
export function ProductStatusBadge({ status }) {
  const [tone, Icon] = PROD[status] || ['neutral', CircleDashed];
  return <Badge tone={tone} icon={Icon}>{STATUS_LABELS[status] || status}</Badge>;
}

const STAGE = { complete: ['success', CircleCheck, 'Complete'], 'in-progress': ['warning', Loader, 'In progress'], upcoming: ['neutral', CircleDashed, 'Upcoming'] };
export function StageStatusBadge({ status }) {
  const [tone, Icon, label] = STAGE[status] || STAGE.upcoming;
  return <Badge tone={tone} icon={Icon}>{label}</Badge>;
}

export function EcoChip({ score, band }) {
  return (
    <span className="eco-chip" data-level={band.level} title={`Eco score ${score} out of 100: ${band.label}`}>
      <span className="eco-chip__num num">{score}</span>
      <span className="eco-chip__label">{band.label}</span>
    </span>
  );
}
