// tier: how sustainable the material is in itself: 'strong' | 'moderate' | 'weak'
// waterLPerKg: MOCK freshwater use per kg. endOfLifePct: MOCK share recyclable/compostable at end of life.
// co2ePerKg: MOCK embodied-emissions factor (kg CO2e per kg), for demonstration only.
export const materials = [
  { id: 'm1', name: 'Recycled Cotton', category: 'Fibre', origin: 'Sundarpur, Paschim Pradesh', supplierId: 's1', recycledPercentage: 85, certificationIds: ['c2'], fairTrade: false, tier: 'strong', co2ePerKg: 2.1, waterLPerKg: 400, endOfLifePct: 70 },
  { id: 'm2', name: 'Organic Cotton', category: 'Fibre', origin: 'Kapaspur, Sahyadri Pradesh', supplierId: 's1', recycledPercentage: 0, certificationIds: ['c1', 'c3'], fairTrade: true, tier: 'strong', co2ePerKg: 3.6, waterLPerKg: 1800, endOfLifePct: 70 },
  { id: 'm3', name: 'Recycled Polyester (rPET)', category: 'Fibre', origin: 'Sutrapur, Tantunagar', supplierId: 's6', recycledPercentage: 70, certificationIds: ['c2'], fairTrade: false, tier: 'moderate', co2ePerKg: 2.4, waterLPerKg: 40, endOfLifePct: 55 },
  { id: 'm4', name: 'Bamboo Fibre', category: 'Fibre', origin: 'Bansgaon, Sahyadri Pradesh', supplierId: 's2', recycledPercentage: 0, certificationIds: ['c4'], fairTrade: true, tier: 'strong', co2ePerKg: 1.4, waterLPerKg: 300, endOfLifePct: 80 },
  { id: 'm5', name: 'Recycled Aluminium', category: 'Metal', origin: 'Lohapur, Shilpanagar', supplierId: 's3', recycledPercentage: 90, certificationIds: ['c7'], fairTrade: false, tier: 'strong', co2ePerKg: 1.1, waterLPerKg: 20, endOfLifePct: 95 },
  { id: 'm6', name: 'Natural Rubber', category: 'Polymer', origin: 'Raspur, Dakshin Pradesh', supplierId: 's4', recycledPercentage: 0, certificationIds: ['c3', 'c4'], fairTrade: true, tier: 'strong', co2ePerKg: 1.2, waterLPerKg: 100, endOfLifePct: 60 },
  { id: 'm7', name: 'Recycled Paperboard', category: 'Paper', origin: 'Kagadnagar, Sahyadri Pradesh', supplierId: 's8', recycledPercentage: 80, certificationIds: ['c4'], fairTrade: false, tier: 'moderate', co2ePerKg: 0.9, waterLPerKg: 30, endOfLifePct: 90 },
  { id: 'm8', name: 'Neem & Shea Butter Blend', category: 'Botanical', origin: 'Ayurgaon, Marusthal Pradesh', supplierId: 's9', recycledPercentage: 0, certificationIds: ['c3'], fairTrade: true, tier: 'strong', co2ePerKg: 1.8, waterLPerKg: 500, endOfLifePct: 90 },
  { id: 'm9', name: 'Virgin Polyester', category: 'Fibre', origin: 'Sutrapur, Tantunagar', supplierId: 's6', recycledPercentage: 0, certificationIds: [], fairTrade: false, tier: 'weak', co2ePerKg: 5.6, waterLPerKg: 80, endOfLifePct: 10 },
  { id: 'm10', name: 'Recycled Polyester Thread', category: 'Fibre', origin: 'Nandipur, Sundarpur', supplierId: 's1', recycledPercentage: 100, certificationIds: ['c2'], fairTrade: false, tier: 'moderate', co2ePerKg: 2.0, waterLPerKg: 40, endOfLifePct: 55 },
];
