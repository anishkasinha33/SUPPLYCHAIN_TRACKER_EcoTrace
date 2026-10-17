export const fmtKg = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)} t` : `${Math.round(n * 10) / 10} kg`);
export const fmtNum = (n) => new Intl.NumberFormat('en-IN').format(Math.round(n));
export const fmtPct = (n) => `${Math.round(n)}%`;
export const fmtDate = (iso) => (iso ? new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set');

export const STATUS_LABELS = {
  planned: 'Planned',
  'in-production': 'In production',
  'in-transit': 'In transit',
  'in-warehouse': 'In warehouse',
  'on-sale': 'On sale',
};

export const STAGE_LABELS = {
  source: 'Material source',
  supplier: 'Supplier',
  processing: 'Processing',
  manufacturing: 'Manufacturing',
  transportation: 'Transportation',
  warehouse: 'Warehouse',
  retail: 'Retail',
};

export const VERIFICATION_LABELS = { verified: 'Verified', pending: 'Pending verification', 'needs-review': 'Needs review' };
export const FAIR_LABOR_LABELS = { certified: 'Certified', 'self-declared': 'Self-declared', 'not-assessed': 'Not assessed' };
