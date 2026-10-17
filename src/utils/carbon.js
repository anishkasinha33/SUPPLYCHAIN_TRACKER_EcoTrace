// MOCK emission factors in kg CO2e per tonne-kilometre.
// These are rounded demonstration values, NOT scientifically authoritative.
// A production version would load published factors (e.g. from a national or GLEC dataset).
export const MODES = {
  road: { label: 'Road', factor: 0.105, cssVar: '--mode-road' },
  rail: { label: 'Rail', factor: 0.028, cssVar: '--mode-rail' },
  sea: { label: 'Sea', factor: 0.016, cssVar: '--mode-sea' },
  air: { label: 'Air', factor: 0.6, cssVar: '--mode-air' },
};

export const ESTIMATE_NOTE = 'Estimate for demonstration, based on mock emission factors.';

/** kg CO2e for moving `tonnes` over `distanceKm` by `mode`. */
export function estimateLegCo2e(distanceKm, tonnes, mode) {
  const factor = MODES[mode]?.factor ?? 0;
  return Math.round(distanceKm * tonnes * factor * 10) / 10;
}

/** Adds `co2e` (kg) and `share` (0..1 of this product's transport emissions) to each leg. */
export function withShares(legs, tonnes) {
  const enriched = legs.map((l) => ({
    ...l,
    co2e: l.co2eOverride != null ? Number(l.co2eOverride) : estimateLegCo2e(l.distanceKm, tonnes, l.mode),
  }));
  const total = enriched.reduce((s, l) => s + l.co2e, 0);
  return enriched.map((l) => ({ ...l, share: total > 0 ? l.co2e / total : 0 }));
}

export const sumCo2e = (legs) => legs.reduce((s, l) => s + l.co2e, 0);
