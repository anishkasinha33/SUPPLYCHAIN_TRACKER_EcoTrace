// SDG checklist: 20 verifiable items, 5 points each, 100 in total.
// Items 1-10 follow SDG 8 (decent work, target 8.8). Items 11-20 follow SDG 12 (responsible production, target 12.5).
// Supplier results below are MOCK demonstration data.
export const SDG_ITEMS = [
  { sdg: 8, label: 'No child labour in the workforce' },
  { sdg: 8, label: 'No forced or bonded labour' },
  { sdg: 8, label: 'Fair wages paid on time' },
  { sdg: 8, label: 'Safe, ventilated workplace' },
  { sdg: 8, label: 'Fire and emergency safety checked' },
  { sdg: 8, label: 'Written contracts for all workers' },
  { sdg: 8, label: 'Reasonable working hours' },
  { sdg: 8, label: 'Worker grievance channel in place' },
  { sdg: 8, label: 'Fair Trade or equivalent certification' },
  { sdg: 8, label: 'Independent labour audit in the last 12 months' },
  { sdg: 12, label: 'Uses recycled or reclaimed inputs' },
  { sdg: 12, label: 'Measures production waste' },
  { sdg: 12, label: 'Reuses or recycles offcuts' },
  { sdg: 12, label: 'Tracks energy use' },
  { sdg: 12, label: 'Uses renewable energy' },
  { sdg: 12, label: 'Treats or recycles process water' },
  { sdg: 12, label: 'Avoids restricted chemicals' },
  { sdg: 12, label: 'Uses lower-emission transport where possible' },
  { sdg: 12, label: 'Packaging is recycled or reusable' },
  { sdg: 12, label: 'ISO 14001 or equivalent environmental audit' },
];
export const POINTS_PER_ITEM = 5;

const CHECKS = {"s1": "01111111111111111110", "s2": "11110011111111110111", "s3": "01101010011110110100", "s4": "11111111110111111111", "s5": "10101111111001111111", "s6": "11100100001100100100", "s7": "01101111110110011111", "s8": "11010100001010110011", "s9": "11111010111101111111", "s10": "01111111111011010101", "s11": "00000000000100101011", "s12": "11011011000110111101", "s13": "10111110111110111011"};

export function supplierSdg(id) {
  const bits = CHECKS[id] || '0'.repeat(SDG_ITEMS.length);
  const items = SDG_ITEMS.map((it, i) => ({ ...it, pass: bits[i] === '1' }));
  const pts = (sdg) => items.filter((x) => x.sdg === sdg && x.pass).length * POINTS_PER_ITEM;
  return { items, sdg8: pts(8), sdg12: pts(12), score: pts(8) + pts(12) };
}
