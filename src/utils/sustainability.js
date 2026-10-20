// Eco score: a transparent, weighted sum of ten factors in four pillars (weights total 100).
// It returns the score AND the factors behind it, so the interface can always explain the number.
// The pillars follow the data categories of the EU Digital Product Passport (ESPR) and the impact
// categories of the Higg Materials Sustainability Index (climate, water, chemistry/materials),
// with freight emissions modelled on the GLEC Framework / ISO 14083 approach (tonne-km x factor).
// All input values in this demo are MOCK data. Replace the body to change the method.

export const PILLARS = [
  { key: 'climate', label: 'Climate' },
  { key: 'materials', label: 'Materials & circularity' },
  { key: 'people', label: 'People' },
  { key: 'transparency', label: 'Transparency' },
];

export const FACTOR_DEFS = [
  { key: 'materialCarbon', pillar: 'climate', label: 'Material carbon intensity', weight: 10, measures: 'Embodied CO₂e per kg of material, weighted by batch weight.', scoring: 'Full marks at 0 kg CO₂e/kg; none at 6 kg or more.', basis: 'Higg MSI global-warming-potential category; EU DPP carbon footprint.' },
  { key: 'transport', pillar: 'climate', label: 'Transport emissions', weight: 10, measures: 'CO₂e per tonne shipped, summed over every leg of the route.', scoring: 'Full marks at 0 kg per tonne; none at 120 kg or more.', basis: 'GLEC Framework / ISO 14083 (tonne-km × mode factor).' },
  { key: 'recycled', pillar: 'materials', label: 'Recycled content', weight: 15, measures: 'Share of materials that are recycled, by weight.', scoring: 'Full marks at 70% recycled content.', basis: 'EU DPP recycled-content declaration for textiles and batteries.' },
  { key: 'materials', pillar: 'materials', label: 'Material sustainability', weight: 10, measures: 'How responsible each material is by itself (strong, moderate or weak).', scoring: 'Strong = 1, moderate = 0.6, weak = 0.2, weighted by weight.', basis: 'Higg MSI material rating; EU DPP substances and materials.' },
  { key: 'water', pillar: 'materials', label: 'Freshwater use', weight: 10, measures: 'Litres of freshwater per kg of material, weighted by batch weight.', scoring: 'Full marks at 0 L/kg; none at 3,000 L/kg or more.', basis: 'Higg MSI water-scarcity category.' },
  { key: 'endOfLife', pillar: 'materials', label: 'End-of-life recyclability', weight: 10, measures: 'Share of the material that can be recycled or composted when the product is done.', scoring: 'Full marks at 90% recyclable.', basis: 'EU DPP recyclability and circularity requirements.' },
  { key: 'verification', pillar: 'people', label: 'Supplier verification', weight: 10, measures: 'Share of suppliers whose identity and facilities have been verified.', scoring: 'Linear, 0–100%.', basis: 'EU DPP economic-operator and due-diligence data.' },
  { key: 'fairLabor', pillar: 'people', label: 'Fair-labour compliance', weight: 10, measures: 'Share of suppliers with a certified labour-standards audit.', scoring: 'Linear, 0–100%.', basis: 'Social-compliance audits (e.g. fair-trade and SA8000-type schemes).' },
  { key: 'certification', pillar: 'transparency', label: 'Certification coverage', weight: 5, measures: 'Share of material weight that carries at least one third-party certification.', scoring: 'Linear, 0–100%.', basis: 'EU DPP compliance declarations and certifications.' },
  { key: 'traceability', pillar: 'transparency', label: 'Traceability completeness', weight: 10, measures: 'How many of the seven supply-chain stages are recorded with an organisation.', scoring: 'Recorded stages ÷ 7.', basis: 'EU DPP supply-chain traceability.' },
];

export const ECO_WEIGHTS = Object.fromEntries(FACTOR_DEFS.map((f) => [f.key, f.weight]));
export const FACTOR_BY_KEY = Object.fromEntries(FACTOR_DEFS.map((f) => [f.key, f]));

const clamp = (n) => Math.max(0, Math.min(1, n));
const r = (n) => Math.round(n);

export const TIER_SCORE = { strong: 1, moderate: 0.6, weak: 0.2 };
export const TRACE_STAGES = 7;

export function computeEcoScore(i) {
  const ratios = {
    materialCarbon: [clamp(1 - i.materialCo2ePerKg / 6), `${i.materialCo2ePerKg.toFixed(1)} kg CO₂e per kg of material.`],
    transport: [clamp(1 - i.transportKgPerTonne / 120), `${r(i.transportKgPerTonne)} kg CO₂e per tonne shipped.`],
    recycled: [clamp(i.recycledPct / 70), `${r(i.recycledPct)}% recycled by weight.`],
    materials: [clamp(i.materialTierScore), 'Weighted by how responsible each material is.'],
    water: [clamp(1 - i.waterLPerKg / 3000), `${r(i.waterLPerKg).toLocaleString('en-IN')} litres of water per kg.`],
    endOfLife: [clamp(i.endOfLifePct / 90), `${r(i.endOfLifePct)}% recyclable or compostable.`],
    verification: [clamp(i.verifiedSupplierPct / 100), `${r(i.verifiedSupplierPct)}% of suppliers verified.`],
    fairLabor: [clamp(i.fairLaborPct / 100), `${r(i.fairLaborPct)}% of suppliers with certified labour standards.`],
    certification: [clamp(i.certifiedPct / 100), `${r(i.certifiedPct)}% of material weight certified.`],
    traceability: [clamp(i.stagesRecorded / TRACE_STAGES), `${i.stagesRecorded} of ${TRACE_STAGES} stages recorded.`],
  };
  const factors = FACTOR_DEFS.map((d) => {
    const [ratio, detail] = ratios[d.key];
    return { ...d, ratio, detail, points: ratio * d.weight };
  });
  const score = r(factors.reduce((s, f) => s + f.points, 0));
  return { score, factors, band: scoreBand(score) };
}

export const BANDS = [
  { min: 80, key: 'leading', label: 'Leading', level: 5 },
  { min: 65, key: 'good', label: 'Good', level: 4 },
  { min: 50, key: 'developing', label: 'Developing', level: 3 },
  { min: 35, key: 'weak', label: 'Weak', level: 2 },
  { min: 0, key: 'at-risk', label: 'At risk', level: 1 },
];

export function scoreBand(score) {
  return BANDS.find((b) => score >= b.min) || BANDS[BANDS.length - 1];
}
