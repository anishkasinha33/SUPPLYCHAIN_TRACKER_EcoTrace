// status: 'planned' | 'in-production' | 'in-transit' | 'in-warehouse' | 'on-sale'
// shipmentTonnes: weight moved along the transport legs (used for the CO2e estimate).
export const products = [
  { id: 'pr-001', traceId: 'ECO-7K4M-2610', name: 'Recycled Cotton Everyday Tote', category: 'Bags', batchNumber: 'RC-2608-A', origin: 'Sundarpur, India', status: 'in-warehouse', manufacturerId: 's10', unitsInBatch: 1200, shipmentTonnes: 0.9, startDate: '2026-07-28', story: 'Cotton offcuts from Sundarpur garment units are shredded, respun and stitched into a sturdy everyday tote, a few kilometres from where the fibre was recovered.' },
  { id: 'pr-002', traceId: 'ECO-3P9X-2611', name: 'Organic Cotton Bedsheet Set', category: 'Home textiles', batchNumber: 'OC-2606-B', origin: 'Silaipur, India', status: 'on-sale', manufacturerId: 's5', unitsInBatch: 800, shipmentTonnes: 1.4, startDate: '2026-06-02', story: 'Organic, fair-trade cotton from Kapaspur is spun in Paschim Pradesh and sewn in a solar-powered unit in Silaipur.' },
  { id: 'pr-003', traceId: 'ECO-5D2R-2612', name: 'Bamboo Fibre Desk Organiser', category: 'Home & office', batchNumber: 'BF-2607-C', origin: 'Karigarpada, India', status: 'on-sale', manufacturerId: 's12', unitsInBatch: 600, shipmentTonnes: 0.5, startDate: '2026-06-20', story: 'Bamboo harvested by a Konkan growers\' cooperative, pressed and finished close to Sagarpur, packed in recycled board.' },
  { id: 'pr-004', traceId: 'ECO-8H1C-2613', name: 'Recycled Aluminium Water Flask', category: 'Drinkware', batchNumber: 'AL-2608-D', origin: 'Tamrapur, India', status: 'in-transit', manufacturerId: 's7', unitsInBatch: 1500, shipmentTonnes: 0.7, startDate: '2026-08-04', story: 'Scrap aluminium is remelted in Shilpanagar, drawn into flasks in Tamrapur and sealed with fair-price natural rubber.' },
  { id: 'pr-005', traceId: 'ECO-2W6T-2614', name: 'Natural Rubber Yoga Mat', category: 'Fitness', batchNumber: 'NR-2609-E', origin: 'Samudrapur, India', status: 'in-production', manufacturerId: 's13', unitsInBatch: 500, shipmentTonnes: 1.1, startDate: '2026-09-08', story: 'Latex tapped by Dakshin Pradesh smallholders is moulded in Samudrapur into a grippy, long-lasting mat.' },
  { id: 'pr-006', traceId: 'ECO-6N8B-2615', name: 'Recycled Paperboard Gift Box Set', category: 'Packaging', batchNumber: 'PB-2607-F', origin: 'Karigarpada, India', status: 'on-sale', manufacturerId: 's12', unitsInBatch: 2000, shipmentTonnes: 1.0, startDate: '2026-07-06', story: 'Post-consumer packaging in Kagadnagar becomes rigid gift boxes with a bamboo-fibre insert.' },
  { id: 'pr-007', traceId: 'ECO-4J7Q-2616', name: 'Neem & Shea Body Balm', category: 'Personal care', batchNumber: 'NS-2609-G', origin: 'Karigarpada, India', status: 'in-warehouse', manufacturerId: 's12', unitsInBatch: 3000, shipmentTonnes: 0.6, startDate: '2026-08-22', story: 'Cold-pressed neem and shea from women-led collection groups in Marusthal Pradesh, poured and packed near Sagarpur.' },
  { id: 'pr-008', traceId: 'ECO-9F3V-2617', name: 'Waterproof Polyester Rain Jacket', category: 'Apparel', batchNumber: 'RJ-2609-H', origin: 'Unnipur, India', status: 'in-transit', manufacturerId: 's11', unitsInBatch: 400, shipmentTonnes: 0.5, startDate: '2026-08-30', story: 'A rush batch of waterproof jackets, made in Panchnad Pradesh from synthetic fabric and flown to Sagarpur for the monsoon season.' },
];

// Join table: which materials go into which product, and how much (kg per batch).
export const productMaterials = [
  { productId: 'pr-001', materialId: 'm1', quantityKg: 380 }, { productId: 'pr-001', materialId: 'm10', quantityKg: 22 },
  { productId: 'pr-002', materialId: 'm2', quantityKg: 640 }, { productId: 'pr-002', materialId: 'm10', quantityKg: 18 },
  { productId: 'pr-003', materialId: 'm4', quantityKg: 260 }, { productId: 'pr-003', materialId: 'm7', quantityKg: 90 },
  { productId: 'pr-004', materialId: 'm5', quantityKg: 540 }, { productId: 'pr-004', materialId: 'm6', quantityKg: 40 },
  { productId: 'pr-005', materialId: 'm6', quantityKg: 720 }, { productId: 'pr-005', materialId: 'm9', quantityKg: 80 },
  { productId: 'pr-006', materialId: 'm7', quantityKg: 900 }, { productId: 'pr-006', materialId: 'm4', quantityKg: 60 },
  { productId: 'pr-007', materialId: 'm8', quantityKg: 310 }, { productId: 'pr-007', materialId: 'm7', quantityKg: 120 },
  { productId: 'pr-008', materialId: 'm9', quantityKg: 420 }, { productId: 'pr-008', materialId: 'm3', quantityKg: 90 },
];
