/* ==========================================================================
   EcoTrace — Sustainable Supply Chain Tracker
   Vanilla JS, no build step. Data lives in memory and is mirrored to localStorage.

   Sections
   1. Constants          6. Components (HTML builders)   11. Search
   2. Sample data        7. Pages                        12. Notifications
   3. State & storage    8. Modals                       13. Toasts
   4. Domain logic       9. Forms                        14. Actions & events
   5. Utilities          10. Filters                     15. Init
   ========================================================================== */
'use strict';

/* ---------- 1. Constants ---------- */
const KEYS = {
  products: 'ecotrace.products',
  suppliers: 'ecotrace.suppliers',
  materials: 'ecotrace.materials',
  settings: 'ecotrace.settings',
  theme: 'ecotrace.theme'
};

const PAGES = {
  dashboard: { title: 'Dashboard', desc: 'Your supply chain transparency at a glance' },
  products: { title: 'Products', desc: 'Manage products, materials and manufacturing origins' },
  suppliers: { title: 'Suppliers', desc: 'Track supplier verification, labor practices and audits' },
  materials: { title: 'Materials', desc: 'The materials library behind every product' },
  sustainability: { title: 'Sustainability', desc: 'Environmental and ethical performance analytics' },
  pipeline: { title: 'Pipeline', desc: 'Every stage of your supply chain, with providers and status updates' },
  providers: { title: 'Providers', desc: 'Suppliers, transporters and logistics providers, scored and explained' },
  consumer: { title: 'Consumer View', desc: 'What customers see when they scan a product code' },
  settings: { title: 'Settings', desc: 'Business profile, appearance and data' }
};

const CERTIFICATIONS = ['Fair Trade', 'GOTS', 'FSC', 'ISO 14001', 'GRS', 'OEKO-TEX', 'B Corp'];
const MATERIAL_TYPES = ['Recycled', 'Organic', 'Conventional', 'Other'];
const VERIFICATION = ['Verified', 'Pending', 'Needs Review'];
const FAIR_LABOR = ['Compliant', 'In review', 'Action required'];
const CHECKS = [
  { key: 'identity', label: 'Business identity verified' },
  { key: 'labor', label: 'Labor practices reviewed' },
  { key: 'environment', label: 'Environmental standards reviewed' },
  { key: 'certification', label: 'Certification verified' }
];

const CATEGORY_STYLE = {
  Apparel: { icon: 'shirt', tone: 'green' },
  Drinkware: { icon: 'cup-soda', tone: 'blue' },
  Accessories: { icon: 'backpack', tone: 'amber' },
  Footwear: { icon: 'footprints', tone: 'purple' },
  Wellness: { icon: 'flower-2', tone: 'green' },
  Home: { icon: 'house', tone: 'blue' }
};

/* Benchmarks and last-month figures used for trends (sample data) */
const METRICS = {
  history: [
    { month: 'Apr', score: 68 }, { month: 'May', score: 72 }, { month: 'Jun', score: 75 },
    { month: 'Jul', score: 77 }, { month: 'Aug', score: 79 }, { month: 'Sep', score: null }
  ],
  previous: { products: 6, verifiedSuppliers: 4, ecoRating: 83.1, recycled: 35.2, fairTrade: 50, transparency: 81.5, overall: 79 },
  wasteReduction: 38,
  industryCarbonAvg: 5.2
};

const STATUS_STYLE = {
  'Verified': { tone: 'green', icon: 'badge-check' },
  'Pending': { tone: 'amber', icon: 'clock' },
  'Needs Review': { tone: 'red', icon: 'triangle-alert' }
};
const TYPE_TONE = { Recycled: 'green', Organic: 'blue', Conventional: 'gray', Other: 'purple' };

/* ---------- 2. Sample data ---------- */
const isoDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

function createSeedData() {
  const ok = { identity: true, labor: true, environment: true, certification: true };

  const suppliers = [
    { id: 'SUP-001', name: 'EcoTextiles Ltd.', country: 'India', city: 'Tirupur', yearsActive: 12,
      materials: ['Organic Cotton', 'Natural Dye'], checks: { ...ok }, fairLabor: 'Compliant',
      certifications: ['Fair Trade', 'GOTS', 'OEKO-TEX'], lastAudit: isoDaysAgo(52), score: 94 },
    { id: 'SUP-002', name: 'GreenMetal Works', country: 'Germany', city: 'Duisburg', yearsActive: 9,
      materials: ['Recycled Aluminum', 'Stainless Steel'], checks: { ...ok }, fairLabor: 'Compliant',
      certifications: ['ISO 14001', 'B Corp'], lastAudit: isoDaysAgo(96), score: 89 },
    { id: 'SUP-003', name: 'BambooSource Co.', country: 'Vietnam', city: 'Hanoi', yearsActive: 6,
      materials: ['Bamboo'], checks: { identity: true, labor: true, environment: true, certification: false }, fairLabor: 'In review',
      certifications: ['FSC'], lastAudit: isoDaysAgo(210), score: 81 },
    { id: 'SUP-004', name: 'EarthWeave Industries', country: 'Bangladesh', city: 'Dhaka', yearsActive: 4,
      materials: ['Recycled Canvas', 'Conventional Cotton'], checks: { identity: true, labor: false, environment: false, certification: false }, fairLabor: 'Action required',
      certifications: ['GOTS'], lastAudit: isoDaysAgo(402), score: 64 },
    { id: 'SUP-005', name: 'GreenFiber Co.', country: 'Taiwan', city: 'Taichung', yearsActive: 8,
      materials: ['Recycled Polyester'], checks: { ...ok }, fairLabor: 'Compliant',
      certifications: ['GRS', 'OEKO-TEX'], lastAudit: isoDaysAgo(74), score: 90 },
    { id: 'SUP-006', name: 'TerraRubber Collective', country: 'Sri Lanka', city: 'Kalutara', yearsActive: 15,
      materials: ['Natural Rubber'], checks: { ...ok }, fairLabor: 'Compliant',
      certifications: ['Fair Trade', 'FSC'], lastAudit: isoDaysAgo(120), score: 86 },
    { id: 'SUP-007', name: 'ReLoop Plastics', country: 'Netherlands', city: 'Rotterdam', yearsActive: 5,
      materials: ['Recycled Plastic (rPET)', 'Silicone Seal'], checks: { identity: true, labor: true, environment: true, certification: false }, fairLabor: 'Compliant',
      certifications: ['ISO 14001', 'GRS'], lastAudit: isoDaysAgo(180), score: 77 },
    { id: 'SUP-008', name: 'Himalaya Hemp Co-op', country: 'Nepal', city: 'Kathmandu', yearsActive: 11,
      materials: ['Hemp Fiber'], checks: { ...ok }, fairLabor: 'Compliant',
      certifications: ['Fair Trade', 'B Corp'], lastAudit: isoDaysAgo(38), score: 92 }
  ];

  const materials = [
    { id: 'MAT-001', name: 'Organic Cotton', type: 'Organic', recycledPct: 0, renewable: true, supplier: 'EcoTextiles Ltd.', origin: 'Gujarat, India', envRating: 91 },
    { id: 'MAT-002', name: 'Recycled Polyester', type: 'Recycled', recycledPct: 100, renewable: false, supplier: 'GreenFiber Co.', origin: 'Taichung, Taiwan', envRating: 84 },
    { id: 'MAT-003', name: 'Bamboo', type: 'Other', recycledPct: 0, renewable: true, supplier: 'BambooSource Co.', origin: 'Hoa Binh, Vietnam', envRating: 88 },
    { id: 'MAT-004', name: 'Recycled Aluminum', type: 'Recycled', recycledPct: 95, renewable: false, supplier: 'GreenMetal Works', origin: 'Duisburg, Germany', envRating: 90 },
    { id: 'MAT-005', name: 'Recycled Plastic (rPET)', type: 'Recycled', recycledPct: 100, renewable: false, supplier: 'ReLoop Plastics', origin: 'Rotterdam, Netherlands', envRating: 79 },
    { id: 'MAT-006', name: 'Natural Rubber', type: 'Other', recycledPct: 0, renewable: true, supplier: 'TerraRubber Collective', origin: 'Kalutara, Sri Lanka', envRating: 83 },
    { id: 'MAT-007', name: 'Recycled Canvas', type: 'Recycled', recycledPct: 80, renewable: false, supplier: 'EarthWeave Industries', origin: 'Dhaka, Bangladesh', envRating: 72 },
    { id: 'MAT-008', name: 'Hemp Fiber', type: 'Organic', recycledPct: 0, renewable: true, supplier: 'Himalaya Hemp Co-op', origin: 'Kathmandu, Nepal', envRating: 93 },
    { id: 'MAT-009', name: 'Natural Dye', type: 'Other', recycledPct: 0, renewable: true, supplier: 'EcoTextiles Ltd.', origin: 'Tamil Nadu, India', envRating: 86 },
    { id: 'MAT-010', name: 'Stainless Steel', type: 'Conventional', recycledPct: 30, renewable: false, supplier: 'GreenMetal Works', origin: 'Essen, Germany', envRating: 61 },
    { id: 'MAT-011', name: 'Silicone Seal', type: 'Conventional', recycledPct: 0, renewable: false, supplier: 'ReLoop Plastics', origin: 'Rotterdam, Netherlands', envRating: 48 },
    { id: 'MAT-012', name: 'Conventional Cotton', type: 'Conventional', recycledPct: 0, renewable: true, supplier: 'EarthWeave Industries', origin: 'Dhaka, Bangladesh', envRating: 42 }
  ];

  const products = [
    { id: 'PRD-001', name: 'Organic Cotton T-Shirt', category: 'Apparel', batchNumber: 'BATCH-2026-001',
      description: 'A midweight everyday tee knitted from GOTS-certified organic cotton and finished with plant-based dyes.',
      origin: 'India', manufacturingCity: 'Mumbai', facility: 'Sunrise Garments Unit 3',
      ecoRating: 92, recycledPercentage: 20, carbonFootprint: 3.9, fairTrade: true, verificationStatus: 'Verified',
      materials: [
        { name: 'Organic Cotton', percentage: 70, supplier: 'EcoTextiles Ltd.' },
        { name: 'Recycled Polyester', percentage: 20, supplier: 'GreenFiber Co.' },
        { name: 'Natural Dye', percentage: 10, supplier: 'EcoTextiles Ltd.' }
      ], createdAt: isoDaysAgo(3) },
    { id: 'PRD-002', name: 'Recycled Aluminum Bottle', category: 'Drinkware', batchNumber: 'BATCH-2026-002',
      description: 'A 750 ml insulated bottle pressed from post-consumer aluminum with a reusable silicone seal.',
      origin: 'Germany', manufacturingCity: 'Duisburg', facility: 'Rhine Metalworks Plant B',
      ecoRating: 88, recycledPercentage: 86, carbonFootprint: 1.4, fairTrade: false, verificationStatus: 'Verified',
      materials: [
        { name: 'Recycled Aluminum', percentage: 90, supplier: 'GreenMetal Works' },
        { name: 'Silicone Seal', percentage: 10, supplier: 'ReLoop Plastics' }
      ], createdAt: isoDaysAgo(6) },
    { id: 'PRD-003', name: 'Bamboo Travel Mug', category: 'Drinkware', batchNumber: 'BATCH-2026-003',
      description: 'A leak-proof travel mug with a FSC-sourced bamboo shell and a recycled stainless liner.',
      origin: 'Vietnam', manufacturingCity: 'Hanoi', facility: 'Red River Craft Studio',
      ecoRating: 85, recycledPercentage: 9, carbonFootprint: 2.2, fairTrade: true, verificationStatus: 'Pending',
      materials: [
        { name: 'Bamboo', percentage: 60, supplier: 'BambooSource Co.' },
        { name: 'Stainless Steel', percentage: 30, supplier: 'GreenMetal Works' },
        { name: 'Silicone Seal', percentage: 10, supplier: 'ReLoop Plastics' }
      ], createdAt: isoDaysAgo(10) },
    { id: 'PRD-004', name: 'Recycled Canvas Backpack', category: 'Accessories', batchNumber: 'BATCH-2026-004',
      description: 'A 22 L daypack sewn from reclaimed canvas offcuts with a recycled polyester lining.',
      origin: 'Bangladesh', manufacturingCity: 'Dhaka', facility: 'Padma Stitching Works',
      ecoRating: 74, recycledPercentage: 77, carbonFootprint: 6.1, fairTrade: false, verificationStatus: 'Needs Review',
      materials: [
        { name: 'Recycled Canvas', percentage: 65, supplier: 'EarthWeave Industries' },
        { name: 'Recycled Polyester', percentage: 25, supplier: 'GreenFiber Co.' },
        { name: 'Natural Rubber', percentage: 10, supplier: 'TerraRubber Collective' }
      ], createdAt: isoDaysAgo(15) },
    { id: 'PRD-005', name: 'Sustainable Running Shoes', category: 'Footwear', batchNumber: 'BATCH-2026-005',
      description: 'Lightweight trainers with an rPET knit upper and a natural rubber outsole.',
      origin: 'Vietnam', manufacturingCity: 'Ho Chi Minh City', facility: 'Saigon Footwear Co. Line 2',
      ecoRating: 81, recycledPercentage: 60, carbonFootprint: 8.4, fairTrade: true, verificationStatus: 'Pending',
      materials: [
        { name: 'Recycled Plastic (rPET)', percentage: 40, supplier: 'ReLoop Plastics' },
        { name: 'Natural Rubber', percentage: 30, supplier: 'TerraRubber Collective' },
        { name: 'Recycled Polyester', percentage: 20, supplier: 'GreenFiber Co.' },
        { name: 'Organic Cotton', percentage: 10, supplier: 'EcoTextiles Ltd.' }
      ], createdAt: isoDaysAgo(21) },
    { id: 'PRD-006', name: 'Natural Rubber Yoga Mat', category: 'Wellness', batchNumber: 'BATCH-2026-006',
      description: 'A 5 mm grippy mat made from FSC-certified natural rubber with a woven hemp top layer.',
      origin: 'Sri Lanka', manufacturingCity: 'Colombo', facility: 'Lanka Latex Works',
      ecoRating: 90, recycledPercentage: 0, carbonFootprint: 3.1, fairTrade: true, verificationStatus: 'Verified',
      materials: [
        { name: 'Natural Rubber', percentage: 80, supplier: 'TerraRubber Collective' },
        { name: 'Hemp Fiber', percentage: 20, supplier: 'Himalaya Hemp Co-op' }
      ], createdAt: isoDaysAgo(34) },
    { id: 'PRD-007', name: 'Hemp Market Tote', category: 'Accessories', batchNumber: 'BATCH-2026-007',
      description: 'A sturdy hand-woven tote for daily errands, made by a Fair Trade cooperative in Nepal.',
      origin: 'Nepal', manufacturingCity: 'Kathmandu', facility: 'Patan Weavers Cooperative',
      ecoRating: 95, recycledPercentage: 0, carbonFootprint: 1.6, fairTrade: true, verificationStatus: 'Verified',
      materials: [
        { name: 'Hemp Fiber', percentage: 85, supplier: 'Himalaya Hemp Co-op' },
        { name: 'Organic Cotton', percentage: 15, supplier: 'EcoTextiles Ltd.' }
      ], createdAt: isoDaysAgo(48) },
    { id: 'PRD-008', name: 'Ocean-Bound Plastic Planter', category: 'Home', batchNumber: 'BATCH-2026-008',
      description: 'A self-watering planter molded from collected ocean-bound plastic waste.',
      origin: 'Netherlands', manufacturingCity: 'Rotterdam', facility: 'Maasstad Molding Hall',
      ecoRating: 79, recycledPercentage: 95, carbonFootprint: 2.7, fairTrade: false, verificationStatus: 'Pending',
      materials: [
        { name: 'Recycled Plastic (rPET)', percentage: 95, supplier: 'ReLoop Plastics' },
        { name: 'Silicone Seal', percentage: 5, supplier: 'ReLoop Plastics' }
      ], createdAt: isoDaysAgo(62) }
  ];

  return { products, suppliers, materials };
}

/* ---------- 3. State & storage ---------- */
const state = {
  products: [],
  suppliers: [],
  materials: [],
  settings: { businessName: 'GreenLeaf Co.', notifRead: false },
  page: 'dashboard',
  loading: true,
  lastUpdated: new Date(),
  consumerProductId: null,
  filters: {
    products: { q: '', category: 'all', eco: 'all', origin: 'all', verification: 'all', recycled: 'all', sort: 'recent' },
    suppliers: { q: '', country: 'all', verification: 'all', certification: 'all', score: 'all', sort: 'score' },
    materials: { q: '', type: 'all', sort: 'name' }
  },
  filtersOpen: { products: false, suppliers: false }
};

const charts = {};
let modalState = null;   // { overlay, opener, onClose }
let searchIndex = -1;

const store = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; } },
  remove(key) { try { localStorage.removeItem(key); } catch (e) { /* ignore */ } }
};

function saveToLocalStorage() {
  store.set(KEYS.products, state.products);
  store.set(KEYS.suppliers, state.suppliers);
  store.set(KEYS.materials, state.materials);
  store.set(KEYS.settings, state.settings);
}

function loadFromLocalStorage() {
  const seed = createSeedData();
  const read = (key, fallback) => {
    const value = store.get(key);
    return Array.isArray(value) ? value : fallback;
  };
  state.products = read(KEYS.products, seed.products);
  state.suppliers = read(KEYS.suppliers, seed.suppliers);
  state.materials = read(KEYS.materials, seed.materials);
  const settings = store.get(KEYS.settings);
  if (settings && typeof settings === 'object') state.settings = { ...state.settings, ...settings };
}

function persist() {
  state.lastUpdated = new Date();
  saveToLocalStorage();
}

/* ---------- 4. Domain logic ---------- */
const findProduct = (id) => state.products.find((p) => p.id === id);
const findSupplier = (name) => state.suppliers.find((s) => s.name.toLowerCase() === String(name).trim().toLowerCase());
const findSupplierById = (id) => state.suppliers.find((s) => s.id === id);
const findMaterial = (name) => state.materials.find((m) => m.name.toLowerCase() === String(name).trim().toLowerCase());
const findMaterialById = (id) => state.materials.find((m) => m.id === id);

/* A supplier's status comes from its four-point verification checklist */
function supplierStatus(s) {
  const done = CHECKS.filter((c) => s.checks && s.checks[c.key]).length;
  if (done === CHECKS.length) return 'Verified';
  if (done >= 2) return 'Pending';
  return 'Needs Review';
}

/* A product's supplier status is the weakest status among its suppliers */
function productSupplierStatus(p) {
  if (!p.materials.length) return 'Pending';
  const statuses = p.materials.map((m) => {
    const s = findSupplier(m.supplier);
    return s ? supplierStatus(s) : 'Pending';
  });
  if (statuses.includes('Needs Review')) return 'Needs Review';
  if (statuses.includes('Pending')) return 'Pending';
  return 'Verified';
}

function productsUsingMaterial(name) {
  return state.products.filter((p) => p.materials.some((m) => m.name.toLowerCase() === name.toLowerCase()));
}
function productsFromSupplier(name) {
  return state.products.filter((p) => p.materials.some((m) => m.supplier.toLowerCase() === name.toLowerCase()));
}

/* How complete and verifiable a product's data is, 0-100 */
function transparencyScore(p) {
  const total = p.materials.reduce((sum, m) => sum + (Number(m.percentage) || 0), 0);
  const checks = [
    !!p.batchNumber, !!p.origin, !!p.manufacturingCity, !!p.facility, !!p.description,
    p.materials.length > 0 && Math.round(total) === 100,
    p.materials.length > 0 && p.materials.every((m) => !!findSupplier(m.supplier)),
    productSupplierStatus(p) === 'Verified'
  ];
  return (checks.filter(Boolean).length / checks.length) * 100;
}

function materialComposition() {
  const totals = { Recycled: 0, Organic: 0, Conventional: 0, Other: 0 };
  let renewable = 0;
  let sustainable = 0;
  state.products.forEach((p) => p.materials.forEach((m) => {
    const pct = Number(m.percentage) || 0;
    const lib = findMaterial(m.name);
    const type = lib && totals.hasOwnProperty(lib.type) ? lib.type : 'Other';
    totals[type] += pct;
    if (lib && lib.renewable) renewable += pct;
    if (type === 'Recycled' || type === 'Organic' || (lib && lib.renewable)) sustainable += pct;
  }));
  const grand = Object.values(totals).reduce((a, b) => a + b, 0);
  const share = (v) => (grand ? (v / grand) * 100 : 0);
  return {
    percentages: MATERIAL_TYPES.map((t) => ({ type: t, value: share(totals[t]) })),
    renewable: share(renewable),
    sustainable: share(sustainable)
  };
}

const average = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0);
const pct = (part, whole) => (whole ? (part / whole) * 100 : 0);

function getBaseMetrics() {
  const P = state.products;
  const S = state.suppliers;
  const comp = materialComposition();
  const now = Date.now();
  const audited = S.filter((s) => s.lastAudit && (now - new Date(s.lastAudit).getTime()) / 864e5 <= 365).length;
  const supplierCounts = { Verified: 0, Pending: 0, 'Needs Review': 0 };
  S.forEach((s) => { supplierCounts[supplierStatus(s)] += 1; });
  const verifiedProducts = P.filter((p) => p.verificationStatus === 'Verified').length;
  const laborCovered = P.filter((p) => p.materials.length && p.materials.every((m) => {
    const s = findSupplier(m.supplier);
    return s && s.fairLabor === 'Compliant';
  })).length;
  const carbonAvg = average(P.map((p) => Number(p.carbonFootprint) || 0));

  return {
    productCount: P.length,
    verifiedProducts,
    supplierCount: S.length,
    supplierCounts,
    verifiedSuppliers: supplierCounts.Verified,
    ecoRating: average(P.map((p) => p.ecoRating)),
    recycled: average(P.map((p) => p.recycledPercentage)),
    fairTrade: pct(P.filter((p) => p.fairTrade).length, P.length),
    transparency: average(P.map(transparencyScore)),
    composition: comp,
    sustainableMaterials: comp.sustainable,
    renewable: comp.renewable,
    carbonAvg,
    carbonVsIndustry: METRICS.industryCarbonAvg ? ((METRICS.industryCarbonAvg - carbonAvg) / METRICS.industryCarbonAvg) * 100 : 0,
    wasteReduction: METRICS.wasteReduction,
    verifiedSupplierPct: pct(supplierCounts.Verified, S.length),
    auditedPct: pct(audited, S.length),
    auditedCount: audited,
    laborCoverage: pct(laborCovered, P.length),
    laborCovered
  };
}

/* Weighted blend: eco ratings 60%, recycled content 10%, supplier verification 10%, data transparency 20% */
const SCORE_WEIGHTS = [
  { key: 'eco', label: 'Product eco ratings', weight: 0.6 },
  { key: 'recycled', label: 'Recycled content', weight: 0.1 },
  { key: 'suppliers', label: 'Supplier verification', weight: 0.1 },
  { key: 'transparency', label: 'Data transparency', weight: 0.2 }
];

function calculateSustainabilityScore(base = getBaseMetrics()) {
  if (!base.productCount) return { score: 0, parts: SCORE_WEIGHTS.map((w) => ({ ...w, value: 0 })) };
  const values = {
    eco: base.ecoRating,
    recycled: Math.min(100, base.recycled * 1.5),
    suppliers: base.verifiedSupplierPct,
    transparency: base.transparency
  };
  const parts = SCORE_WEIGHTS.map((w) => ({ ...w, value: values[w.key] }));
  const score = parts.reduce((sum, p) => sum + p.value * p.weight, 0);
  return { score: Math.round(score), parts };
}

function computeMetrics() {
  const base = getBaseMetrics();
  const { score, parts } = calculateSustainabilityScore(base);
  return { ...base, overall: score, parts };
}

function scoreVerdict(score) {
  if (score >= 90) return { label: 'Outstanding', tone: 'green' };
  if (score >= 80) return { label: 'Excellent', tone: 'green' };
  if (score >= 70) return { label: 'Good', tone: 'blue' };
  if (score >= 55) return { label: 'Fair', tone: 'amber' };
  return { label: 'Needs attention', tone: 'red' };
}
const ratingTone = (v) => (v >= 85 ? 'green' : v >= 70 ? 'blue' : v >= 55 ? 'amber' : 'red');
const gradeFor = (v) => (v >= 90 ? 'A' : v >= 80 ? 'B' : v >= 65 ? 'C' : v >= 50 ? 'D' : 'E');

function trendHistory(currentScore) {
  return METRICS.history.map((h) => ({ month: h.month, score: h.score === null ? currentScore : h.score }));
}

/* The customer-facing story for a product, derived from its data */
function buildJourney(p) {
  const end = new Date(p.createdAt || Date.now());
  const at = (daysBefore) => { const d = new Date(end); d.setDate(d.getDate() - daysBefore); return d.toISOString().slice(0, 10); };
  const mats = p.materials.slice().sort((a, b) => b.percentage - a.percentage);
  const main = mats[0];
  const lib = main && findMaterial(main.name);
  const sup = main && findSupplier(main.supplier);
  const place = `${p.manufacturingCity ? p.manufacturingCity + ', ' : ''}${p.origin || 'Location not recorded'}`;
  const supStatus = sup ? supplierStatus(sup) : 'Pending';
  const matStatus = mats.length ? (mats.every((m) => findMaterial(m.name)) ? 'Verified' : 'Pending') : 'Pending';

  return [
    { key: 'materials', icon: 'sprout', title: 'Raw materials', date: at(45),
      location: (lib && lib.origin) || 'Origin not recorded',
      description: mats.length ? `${mats.map((m) => m.name).join(', ')} sourced for ${p.batchNumber || 'this batch'}.` : 'No materials recorded yet.',
      status: matStatus },
    { key: 'supplier', icon: 'handshake', title: 'Supplier', date: at(39),
      location: sup ? `${sup.city ? sup.city + ', ' : ''}${sup.country}` : 'Supplier not listed',
      description: sup ? `${sup.name} supplies the main material. Labor practices: ${sup.fairLabor.toLowerCase()}.` : 'The main supplier is not in your supplier list yet.',
      status: supStatus },
    { key: 'manufacturing', icon: 'factory', title: 'Manufacturing', date: at(24),
      location: place, description: p.facility ? `Made at ${p.facility}.` : 'Manufacturing facility not recorded.',
      status: p.facility && p.origin ? 'Verified' : 'Pending' },
    { key: 'quality', icon: 'clipboard-check', title: 'Quality verification', date: at(15),
      location: p.manufacturingCity || p.origin || 'On site', description: 'Batch checked for material content, workmanship and labelling accuracy.',
      status: p.verificationStatus },
    { key: 'distribution', icon: 'truck', title: 'Distribution', date: at(7),
      location: `Shipped from ${p.origin || 'origin'}`, description: 'Packed with recyclable materials and sent to fulfilment.',
      status: p.verificationStatus === 'Verified' ? 'Verified' : 'Pending' },
    { key: 'final', icon: 'package-check', title: 'Final product', date: at(0),
      location: 'Ready for customers', description: 'Labelled with a scannable transparency code.',
      status: p.verificationStatus }
  ];
}

function productCertifications(p) {
  const set = new Set();
  if (p.fairTrade) set.add('Fair Trade');
  p.materials.forEach((m) => { const s = findSupplier(m.supplier); if (s) s.certifications.forEach((c) => set.add(c)); });
  return [...set];
}

function nextId(prefix, list) {
  const max = list.reduce((m, item) => Math.max(m, parseInt(String(item.id).replace(/\D/g, ''), 10) || 0), 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

/* ---------- 5. Utilities ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const fmtNum = (n, d = 0) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtDate = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const initials = (name) => String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'EC';
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const plural = (n, one, many = one + 's') => `${n} ${n === 1 ? one : many}`;
const debounce = (fn, ms = 120) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const unique = (list) => [...new Set(list)].sort((a, b) => String(a).localeCompare(String(b)));

function highlight(text, query) {
  const safe = esc(text);
  if (!query) return safe;
  const q = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return safe.replace(new RegExp(`(${q})`, 'ig'), '<mark>$1</mark>');
}

const ic = (name, cls = '') => `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ''} aria-hidden="true"></i>`;
function refreshIcons() { if (window.lucide && window.lucide.createIcons) window.lucide.createIcons(); }

/* ---------- 6. Components (HTML builders) ---------- */
const catStyle = (cat) => CATEGORY_STYLE[cat] || { icon: 'package', tone: 'green' };
const laborStyle = (v) => ({ 'Compliant': { tone: 'green', icon: 'heart-handshake' }, 'In review': { tone: 'amber', icon: 'clock' }, 'Action required': { tone: 'red', icon: 'triangle-alert' } }[v] || { tone: 'gray', icon: 'clock' });

function statusBadge(status) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.Pending;
  return `<span class="badge badge--status tone-${s.tone}">${ic(s.icon)}${esc(status)}</span>`;
}
const badge = (text, tone = 'gray', icon = '') => `<span class="badge tone-${tone}">${icon ? ic(icon) : ''}${esc(text)}</span>`;
const rating = (v) => `<span class="rating tone-${ratingTone(v)}" title="Eco rating ${v} out of 100">${Math.round(v)}</span>`;

function bar(value, tone = 'green', { thin = false, label = '' } = {}) {
  const v = clamp(Number(value) || 0, 0, 100);
  return `<div class="bar tone-${tone}${thin ? ' bar--thin' : ''}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(v)}"${label ? ` aria-label="${esc(label)}"` : ''}><span class="bar__fill" data-w="${v.toFixed(1)}" style="width:0"></span></div>`;
}

function gauge(score, { size = 220, tone } = {}) {
  const r = 52;
  const C = 2 * Math.PI * r;
  const arc = C * 0.75;
  const len = (arc * clamp(score, 0, 100)) / 100;
  const t = tone || scoreVerdict(score).tone;
  const shown = Math.round(score);
  return `<div class="gauge tone-${t}" style="--size:${size}px" role="img" aria-label="Score ${shown} out of 100">
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle class="gauge__track" cx="60" cy="60" r="${r}" transform="rotate(135 60 60)" stroke-dasharray="${arc.toFixed(2)} ${C.toFixed(2)}"/>
      <circle class="gauge__progress" cx="60" cy="60" r="${r}" transform="rotate(135 60 60)" style="stroke-dasharray:0.001 999" data-len="${len.toFixed(2)}"/>
    </svg>
    <div class="gauge__center"><span class="gauge__value" data-count="${shown}">${shown}</span><span class="gauge__max">/ 100</span></div>
  </div>`;
}

function trendHtml(diff, unit = '', dec = 0, suffix = 'from last month') {
  if (Math.abs(diff) < Math.pow(10, -dec) / 2) return `<span class="trend tone-gray">${ic('minus')}No change <span>${suffix}</span></span>`;
  const up = diff > 0;
  return `<span class="trend tone-${up ? 'green' : 'red'}">${ic(up ? 'trending-up' : 'trending-down')}${up ? '+' : '−'}${fmtNum(Math.abs(diff), dec)}${unit} <span>${suffix}</span></span>`;
}

function emptyState({ icon, title, text, action, label, secondary }) {
  return `<div class="empty">
    <div class="empty__art">${ic(icon)}</div>
    <h3>${esc(title)}</h3>
    <p>${esc(text)}</p>
    ${action ? `<button class="btn btn--primary" type="button" data-action="${action}">${ic('plus')}${esc(label)}</button>` : ''}
    ${secondary || ''}
  </div>`;
}

function mount(el, html, animate = true) {
  el.innerHTML = html;
  animateIn(el, animate);
}

function animateIn(root = document, animate = true) {
  refreshIcons();
  const instant = !animate || reduceMotion();
  const later = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

  $$('.bar__fill[data-w]', root).forEach((el) => {
    if (instant) el.style.width = `${el.dataset.w}%`;
    else later(() => { el.style.width = `${el.dataset.w}%`; });
  });
  $$('.gauge__progress[data-len]', root).forEach((el) => {
    const apply = () => { el.style.strokeDasharray = `${el.dataset.len} 999`; };
    if (instant) apply(); else later(apply);
  });
  if (!instant) {
    $$('[data-count]', root).forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.decimals || '0', 10);
      if (Number.isNaN(target)) return;
      const start = performance.now();
      const dur = 900;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = fmtNum(target * (1 - Math.pow(1 - p, 3)), dec);
        if (p < 1) requestAnimationFrame(tick);
      };
      el.textContent = fmtNum(0, dec);
      requestAnimationFrame(tick);
    });
  }
}

function kpiCard(k) {
  return `<article class="card kpi tone-${k.tone}">
    <div class="kpi__top">
      <span class="tile">${ic(k.icon)}</span>
      ${k.trendHtml || ''}
    </div>
    <div class="kpi__label">${esc(k.label)}</div>
    <div class="kpi__value"><span data-count="${k.value}" data-decimals="${k.decimals || 0}">${fmtNum(k.value, k.decimals || 0)}</span>${k.suffix ? `<small>${esc(k.suffix)}</small>` : ''}</div>
    <div class="kpi__bar">${bar(k.progress, k.tone, { thin: true, label: k.label })}</div>
    <div class="kpi__caption">${esc(k.caption)}</div>
  </article>`;
}

function metricCard(k) {
  return `<article class="card metric tone-${k.tone}">
    <div class="metric__top"><span class="tile tile--sm">${ic(k.icon)}</span><span class="metric__label">${esc(k.label)}</span></div>
    <div class="metric__value"><span data-count="${k.value}" data-decimals="${k.decimals || 0}">${fmtNum(k.value, k.decimals || 0)}</span>${k.suffix ? `<small>${esc(k.suffix)}</small>` : ''}</div>
    ${k.progress != null ? bar(k.progress, k.tone, { thin: true, label: k.label }) : ''}
    <div class="metric__note">${esc(k.note)}</div>
  </article>`;
}

function scoreParts(parts) {
  return `<div class="score-parts">${parts.map((p) => `
    <div class="score-part">
      <div class="score-part__row"><span>${esc(p.label)} <small style="color:var(--text-faint)">· ${Math.round(p.weight * 100)}% of score</small></span><strong>${Math.round(p.value)}</strong></div>
      ${bar(p.value, ratingTone(p.value), { thin: true, label: p.label })}
    </div>`).join('')}</div>`;
}

const materialChips = (p, max = 2) => {
  const names = p.materials.map((m) => m.name);
  if (!names.length) return '<span class="chip">None yet</span>';
  return `<div class="chips">${names.slice(0, max).map((n) => `<span class="chip">${esc(n)}</span>`).join('')}${names.length > max ? `<span class="chip">+${names.length - max}</span>` : ''}</div>`;
};

const productCell = (p) => {
  const st = catStyle(p.category);
  return `<div class="cell-product">
    <span class="tile tone-${st.tone}">${ic(st.icon)}</span>
    <div><button class="cell-product__name" type="button" data-action="view-product" data-id="${esc(p.id)}">${esc(p.name)}</button><div class="cell-product__id">${esc(p.id)}<span class="cell-product__extra"> · ${esc(p.category)}${p.batchNumber ? ` · ${esc(p.batchNumber)}` : ''}</span></div></div>
  </div>`;
};
const placeText = (p) => [p.manufacturingCity, p.origin].filter(Boolean).join(', ') || '—';
const recycledCell = (v) => `<div class="cell-metric"><strong>${Math.round(v)}%</strong>${bar(v, 'green', { thin: true, label: 'Recycled content' })}</div>`;

function productActions(p) {
  const n = esc(p.name);
  const id = esc(p.id);
  return `<div class="cell-actions">
    <button class="icon-btn icon-btn--sm icon-btn--primary" type="button" data-action="view-product" data-id="${id}" aria-label="View ${n}" title="View">${ic('eye')}</button>
    <button class="icon-btn icon-btn--sm icon-btn--primary" type="button" data-action="edit-product" data-id="${id}" aria-label="Edit ${n}" title="Edit">${ic('pencil')}</button>
    <button class="icon-btn icon-btn--sm icon-btn--danger" type="button" data-action="delete-product" data-id="${id}" aria-label="Delete ${n}" title="Delete">${ic('trash-2')}</button>
  </div>`;
}

function productsTable(list) {
  return `<div class="card"><div class="table-wrap"><table class="table table--priority">
    <thead><tr>
      <th scope="col">Product</th><th scope="col" class="col-category">Category</th><th scope="col" class="col-batch">Batch number</th><th scope="col">Origin</th><th scope="col">Materials</th>
      <th scope="col">Eco rating</th><th scope="col">Recycled %</th><th scope="col">Supplier status</th><th scope="col">Status</th><th scope="col"><span class="visually-hidden">Actions</span></th>
    </tr></thead>
    <tbody>${list.map((p) => `<tr>
      <td class="cell-main" data-label="Product">${productCell(p)}</td>
      <td class="col-category" data-label="Category">${esc(p.category)}</td>
      <td class="col-batch" data-label="Batch">${esc(p.batchNumber || '—')}</td>
      <td data-label="Origin">${esc(p.origin || '—')}</td>
      <td data-label="Materials">${materialChips(p, 1)}</td>
      <td data-label="Eco rating">${rating(p.ecoRating)}</td>
      <td data-label="Recycled">${recycledCell(p.recycledPercentage)}</td>
      <td data-label="Supplier status">${statusBadge(productSupplierStatus(p))}</td>
      <td data-label="Status">${statusBadge(p.verificationStatus)}</td>
      <td class="cell-actions-td" data-label="">${productActions(p)}</td>
    </tr>`).join('')}</tbody>
  </table></div></div>`;
}

function recentProductsTable(list) {
  return `<div class="table-wrap"><table class="table table--priority">
    <thead><tr>
      <th scope="col">Product</th><th scope="col" class="col-category">Category</th><th scope="col">Origin</th><th scope="col">Eco rating</th>
      <th scope="col">Recycled %</th><th scope="col">Supplier status</th><th scope="col">Verification</th><th scope="col"><span class="visually-hidden">Action</span></th>
    </tr></thead>
    <tbody>${list.map((p) => `<tr>
      <td class="cell-main" data-label="Product">${productCell(p)}</td>
      <td class="col-category" data-label="Category">${esc(p.category)}</td>
      <td data-label="Origin">${esc(placeText(p))}</td>
      <td data-label="Eco rating">${rating(p.ecoRating)}</td>
      <td data-label="Recycled">${recycledCell(p.recycledPercentage)}</td>
      <td data-label="Supplier status">${statusBadge(productSupplierStatus(p))}</td>
      <td data-label="Verification">${statusBadge(p.verificationStatus)}</td>
      <td class="cell-actions-td" data-label=""><div class="cell-actions"><button class="btn btn--ghost btn--sm" type="button" data-action="view-product" data-id="${esc(p.id)}" aria-label="View ${esc(p.name)}">${ic('eye')}<span class="btn-label">View</span></button></div></td>
    </tr>`).join('')}</tbody>
  </table></div>`;
}

function supplierCard(s) {
  const status = supplierStatus(s);
  const labor = laborStyle(s.fairLabor);
  const n = esc(s.name);
  return `<article class="card card--interactive sup-card" data-action="view-supplier" data-id="${esc(s.id)}">
    <div class="sup-card__top">
      <span class="tile tone-${STATUS_STYLE[status].tone}"><b style="font-size:14px">${esc(initials(s.name))}</b></span>
      <div style="flex:1;min-width:0">
        <button class="cell-product__name sup-card__name" type="button" data-action="view-supplier" data-id="${esc(s.id)}">${n}</button>
        <div class="sup-card__loc">${ic('map-pin')}${esc([s.city, s.country].filter(Boolean).join(', '))}</div>
      </div>
      ${statusBadge(status)}
    </div>
    <div class="chips">${s.materials.map((m) => `<span class="chip">${esc(m)}</span>`).join('') || '<span class="chip">No materials listed</span>'}</div>
    <div class="sup-card__grid">
      <div><small>Fair-labor status</small><strong class="tone-${labor.tone}" style="color:var(--tone-fg)">${ic(labor.icon)}${esc(s.fairLabor)}</strong></div>
      <div><small>Last audit</small><strong>${esc(fmtDate(s.lastAudit))}</strong></div>
    </div>
    <div>
      <small style="display:block;color:var(--text-muted);font-size:13px;margin-bottom:8px">Certifications</small>
      <div class="chips">${s.certifications.length ? s.certifications.map((c) => `<span class="cert">${ic('badge-check')}${esc(c)}</span>`).join('') : '<span class="chip">None recorded</span>'}</div>
    </div>
    <div class="sup-card__score">
      <small style="color:var(--text-muted);font-size:13px">Sustainability score</small>
      ${bar(s.score, ratingTone(s.score), { thin: true, label: `${s.name} sustainability score` })}
      <strong>${Math.round(s.score)}</strong>
    </div>
    <div class="sup-card__foot">
      <button class="link-btn" type="button" data-action="view-supplier" data-id="${esc(s.id)}">View details ${ic('arrow-right')}</button>
      <div class="actions">
        <button class="icon-btn icon-btn--sm icon-btn--primary" type="button" data-action="edit-supplier" data-id="${esc(s.id)}" aria-label="Edit ${n}" title="Edit">${ic('pencil')}</button>
        <button class="icon-btn icon-btn--sm icon-btn--danger" type="button" data-action="delete-supplier" data-id="${esc(s.id)}" aria-label="Delete ${n}" title="Delete">${ic('trash-2')}</button>
      </div>
    </div>
  </article>`;
}

function materialCard(m) {
  const users = productsUsingMaterial(m.name);
  const tone = TYPE_TONE[m.type] || 'gray';
  const n = esc(m.name);
  return `<article class="card card--interactive mat-card" data-action="view-material" data-id="${esc(m.id)}">
    <div class="mat-card__top">
      <div><button class="cell-product__name mat-card__name" type="button" data-action="view-material" data-id="${esc(m.id)}">${n}</button>
        <div style="margin-top:8px" class="chips">${badge(m.type, tone)}${m.renewable ? badge('Renewable', 'green', 'sprout') : ''}</div></div>
      <span class="grade tone-${ratingTone(m.envRating)}" title="Environmental rating ${m.envRating} out of 100">${gradeFor(m.envRating)}</span>
    </div>
    <div class="mat-card__facts">
      <div>${ic('handshake')}<span>Supplier <b>${esc(m.supplier || '—')}</b></span></div>
      <div>${ic('map-pin')}<span>Origin <b>${esc(m.origin || '—')}</b></span></div>
      <div>${ic('recycle')}<span>Recycled content <b>${Math.round(m.recycledPct)}%</b></span></div>
    </div>
    <div class="mat-card__env">
      <small style="color:var(--text-muted);font-size:13px">Environmental rating</small>
      ${bar(m.envRating, ratingTone(m.envRating), { thin: true, label: `${m.name} environmental rating` })}
      <strong style="font-size:14px">${Math.round(m.envRating)}</strong>
    </div>
    <div class="mat-card__foot">
      <div class="chips">${users.length ? `<span class="chip">${ic('package')}${plural(users.length, 'product')}</span>` : '<span class="chip">Not used yet</span>'}</div>
      <div style="display:flex;gap:2px">
        <button class="icon-btn icon-btn--sm icon-btn--primary" type="button" data-action="edit-material" data-id="${esc(m.id)}" aria-label="Edit ${n}" title="Edit">${ic('pencil')}</button>
        <button class="icon-btn icon-btn--sm icon-btn--danger" type="button" data-action="delete-material" data-id="${esc(m.id)}" aria-label="Delete ${n}" title="Delete">${ic('trash-2')}</button>
      </div>
    </div>
  </article>`;
}

function selectOptions(options, selected) {
  return options.map((o) => {
    const opt = typeof o === 'string' ? { value: o, label: o } : o;
    return `<option value="${esc(opt.value)}"${String(opt.value) === String(selected) ? ' selected' : ''}>${esc(opt.label)}</option>`;
  }).join('');
}

function filterField(scope, key, label, options) {
  const id = `f-${scope}-${key}`;
  return `<div class="field"><label for="${id}">${esc(label)}</label>
    <select class="select select--sm" id="${id}" data-filter="${scope}.${key}">${selectOptions(options, state.filters[scope][key])}</select></div>`;
}

/* ---------- Charts ---------- */
function hexToRgba(hex, a) {
  const h = String(hex).replace('#', '');
  if (h.length !== 6) return hex;
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function makeChart(key, id, config) {
  if (charts[key]) { charts[key].destroy(); delete charts[key]; }
  const canvas = document.getElementById(id);
  if (!canvas) return;
  if (typeof Chart === 'undefined') {
    canvas.parentElement.innerHTML = '<div class="search-empty">Charts could not load. Check your internet connection and refresh.</div>';
    return;
  }
  Chart.defaults.font.family = '"Plus Jakarta Sans", system-ui, sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = cssVar('--chart-text');
  config.options = config.options || {};
  config.options.responsive = true;
  config.options.maintainAspectRatio = false;
  if (reduceMotion()) config.options.animation = false;
  charts[key] = new Chart(canvas, config);
}

function destroyCharts() {
  Object.keys(charts).forEach((k) => { charts[k].destroy(); delete charts[k]; });
}

const tooltipStyle = () => ({
  backgroundColor: cssVar('--forest-900') || '#123329', titleColor: '#fff', bodyColor: '#dfeee6',
  padding: 12, cornerRadius: 10, displayColors: false, titleFont: { weight: '700' }
});

function drawDonut(m) {
  const colors = [cssVar('--chart-recycled'), cssVar('--chart-organic'), cssVar('--chart-conventional'), cssVar('--chart-other')];
  makeChart('composition', 'compositionChart', {
    type: 'doughnut',
    data: {
      labels: m.composition.percentages.map((p) => p.type),
      datasets: [{ data: m.composition.percentages.map((p) => +p.value.toFixed(1)), backgroundColor: colors, borderColor: cssVar('--surface'), borderWidth: 3, hoverOffset: 6 }]
    },
    options: { cutout: '72%', plugins: { legend: { display: false }, tooltip: { ...tooltipStyle(), callbacks: { label: (c) => `${c.label}: ${c.parsed}%` } } } }
  });
}

function drawTrend(m, id = 'trendChart', key = 'trend') {
  const hist = trendHistory(m.overall);
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const line = cssVar('--chart-recycled');
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  let fill = hexToRgba(line, 0.12);
  if (ctx && ctx.createLinearGradient) {
    fill = ctx.createLinearGradient(0, 0, 0, 280);
    fill.addColorStop(0, hexToRgba(line, 0.28));
    fill.addColorStop(1, hexToRgba(line, 0));
  }
  const scores = hist.map((h) => h.score);
  makeChart(key, id, {
    type: 'line',
    data: {
      labels: hist.map((h) => h.month),
      datasets: [{
        label: 'Sustainability score', data: scores, borderColor: line, backgroundColor: fill, fill: true, tension: 0.38, borderWidth: 3,
        pointRadius: (c) => (c.dataIndex === scores.length - 1 ? 6 : 0), pointHoverRadius: 6,
        pointBackgroundColor: cssVar('--surface'), pointBorderColor: line, pointBorderWidth: 3
      }]
    },
    options: {
      interaction: { intersect: false, mode: 'index' },
      plugins: { legend: { display: false }, tooltip: { ...tooltipStyle(), callbacks: { label: (c) => `Score: ${c.parsed.y}` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { min: Math.max(0, Math.floor((Math.min(...scores) - 6) / 5) * 5), max: 100, grid: { color: cssVar('--chart-grid') }, border: { display: false }, ticks: { stepSize: 10 } }
      }
    }
  });
}

function drawSupplierChart(m) {
  const c = m.supplierCounts;
  makeChart('suppliers', 'supplierChart', {
    type: 'bar',
    data: {
      labels: ['Verified', 'Pending', 'Needs review'],
      datasets: [{ data: [c.Verified, c.Pending, c['Needs Review']], backgroundColor: [cssVar('--success'), cssVar('--warning'), cssVar('--danger')], borderRadius: 8, borderSkipped: false, barThickness: 22 }]
    },
    options: {
      indexAxis: 'y',
      plugins: { legend: { display: false }, tooltip: { ...tooltipStyle(), callbacks: { label: (x) => plural(x.parsed.x, 'supplier') } } },
      scales: {
        x: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: cssVar('--chart-grid') }, border: { display: false } },
        y: { grid: { display: false }, border: { display: false } }
      }
    }
  });
}

function drawProductBars(key, id, field, color, label) {
  const list = state.products.slice().sort((a, b) => b[field] - a[field]);
  makeChart(key, id, {
    type: 'bar',
    data: {
      labels: list.map((p) => p.name),
      datasets: [{ label, data: list.map((p) => p[field]), backgroundColor: color, borderRadius: 8, borderSkipped: false, maxBarThickness: 34 }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { ...tooltipStyle(), callbacks: { label: (c) => `${label}: ${c.parsed.y}${field === 'recycledPercentage' ? '%' : ''}` } } },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { maxRotation: 0, callback(v) { const l = String(this.getLabelForValue(v)); const w = l.split(' '); return w.length > 2 ? `${w[0]} ${w[1]}…` : l; } } },
        y: { min: 0, max: 100, grid: { color: cssVar('--chart-grid') }, border: { display: false }, ticks: { stepSize: 25 } }
      }
    }
  });
}

/* ---------- 7. Pages ---------- */
function renderCurrentPage() {
  destroyCharts();
  const renderers = {
    dashboard: renderDashboard, products: renderProducts, suppliers: renderSuppliers, materials: renderMaterials,
    sustainability: renderSustainability, pipeline: renderPipeline, providers: renderProviders, consumer: renderConsumer, settings: renderSettings
  };
  (renderers[state.page] || renderDashboard)();
  refreshChrome();
}

/* Dashboard */
function dashboardSkeleton() {
  const card = (h) => `<div class="card sk-card"><div class="skeleton" style="height:${h}px"></div><div class="skeleton sk-line" style="width:60%"></div><div class="skeleton sk-line" style="width:40%"></div></div>`;
  return `
    <div class="welcome"><div style="flex:1;min-width:260px"><div class="skeleton" style="height:34px;width:min(360px,80%)"></div><div class="skeleton sk-line" style="width:min(520px,90%)"></div></div></div>
    <div class="kpi-grid">${Array.from({ length: 6 }, () => card(44)).join('')}</div>
    <div class="grid-5-7">${card(260)}${card(260)}</div>`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

function renderDashboard() {
  const el = $('#page-dashboard');
  if (state.loading) { mount(el, dashboardSkeleton(), false); return; }

  const m = computeMetrics();
  const prev = METRICS.previous;
  const verdict = scoreVerdict(m.overall);
  const recent = state.products.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5);
  const fairCount = state.products.filter((p) => p.fairTrade).length;

  const kpis = [
    { icon: 'package', tone: 'green', label: 'Products tracked', value: m.productCount, trendHtml: trendHtml(m.productCount - prev.products), progress: pct(m.verifiedProducts, m.productCount), caption: `${m.verifiedProducts} of ${m.productCount} fully verified` },
    { icon: 'badge-check', tone: 'blue', label: 'Verified suppliers', value: m.verifiedSuppliers, trendHtml: trendHtml(m.verifiedSuppliers - prev.verifiedSuppliers), progress: m.verifiedSupplierPct, caption: `${m.verifiedSuppliers} of ${m.supplierCount} suppliers pass every check` },
    { icon: 'leaf', tone: 'green', label: 'Average eco rating', value: Math.round(m.ecoRating), suffix: '/ 100', trendHtml: trendHtml(m.ecoRating - prev.ecoRating, ' pts', 1), progress: m.ecoRating, caption: 'Average across all products' },
    { icon: 'recycle', tone: 'purple', label: 'Recycled materials', value: Math.round(m.recycled), suffix: '%', trendHtml: trendHtml(m.recycled - prev.recycled, '%', 1), progress: m.recycled, caption: 'Average recycled content per product' },
    { icon: 'heart-handshake', tone: 'amber', label: 'Fair Trade products', value: Math.round(m.fairTrade), suffix: '%', trendHtml: trendHtml(m.fairTrade - prev.fairTrade, '%', 1), progress: m.fairTrade, caption: `${fairCount} of ${m.productCount} products certified` },
    { icon: 'shield-check', tone: 'blue', label: 'Supply chain transparency', value: Math.round(m.transparency), suffix: '%', trendHtml: trendHtml(m.transparency - prev.transparency, '%', 1), progress: m.transparency, caption: 'Complete, traceable product records' }
  ];

  const legendNote = { Recycled: 'Post-consumer and reclaimed', Organic: 'Certified organic fibres', Conventional: 'Standard-grade inputs', Other: 'Bio-based and mixed' };
  const legendColor = { Recycled: '--chart-recycled', Organic: '--chart-organic', Conventional: '--chart-conventional', Other: '--chart-other' };
  const attention = state.suppliers.filter((s) => supplierStatus(s) !== 'Verified')
    .sort((a, b) => a.score - b.score).slice(0, 3);
  const recycledShare = m.composition.percentages.find((p) => p.type === 'Recycled').value;
  const monthDelta = m.overall - trendHistory(m.overall)[METRICS.history.length - 2].score;

  const html = `
    <div class="welcome">
      <div>
        <h2>${greeting()}, ${esc(state.settings.businessName)}</h2>
        <p>Here's an overview of your supply chain transparency and sustainability performance.</p>
        <div class="welcome__meta"><span class="live-dot" aria-hidden="true"></span>Last updated ${esc(state.lastUpdated.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }))}</div>
      </div>
      <div class="section-head__actions">
        <button class="btn btn--ghost" type="button" data-action="go-consumer">${ic('qr-code')}Preview customer page</button>
        <button class="btn btn--primary" type="button" data-action="add-product">${ic('plus')}Add product</button>
      </div>
    </div>

    <div class="kpi-grid">${kpis.map(kpiCard).join('')}</div>

    <div class="grid-5-7">
      <section class="card card--pad score-card" aria-labelledby="scoreTitle">
        <div class="card__head"><div><h2 id="scoreTitle">Overall sustainability score</h2><p>Blended from eco ratings, recycled content, supplier checks and data quality.</p></div></div>
        <div class="score-card__gauge">
          ${gauge(m.overall, { size: 230 })}
          <div class="score-card__label"><span class="verdict">${verdict.label}</span>${trendHtml(monthDelta, ' pts', 0)}</div>
        </div>
        ${scoreParts(m.parts)}
      </section>

      <section class="card card--pad card--fill" aria-labelledby="compTitle">
        <div class="card__head"><div><h2 id="compTitle">Material composition</h2><p>Share of all product materials by weight.</p></div></div>
        <div class="donut-layout">
          <div class="donut-wrap"><canvas id="compositionChart" role="img" aria-label="Doughnut chart of material composition"></canvas>
            <div class="donut-center"><strong>${Math.round(recycledShare)}%</strong><span>recycled</span></div></div>
          <div class="legend">${m.composition.percentages.map((p) => `
            <div class="legend__item"><span class="legend__dot" style="background:var(${legendColor[p.type]})"></span>
              <span>${esc(p.type)}<span class="legend__sub">${legendNote[p.type]}</span></span><strong>${p.value.toFixed(1)}%</strong></div>`).join('')}
          </div>
        </div>
      </section>
    </div>

    <div class="grid-7-5">
      <section class="card card--pad" aria-labelledby="trendTitle">
        <div class="card__head"><div><h2 id="trendTitle">Sustainability over time</h2><p>Overall score across the last six months.</p></div>${trendHtml(m.overall - METRICS.history[0].score, ' pts', 0, 'since April')}</div>
        <div class="chart-box"><canvas id="trendChart" role="img" aria-label="Line chart of sustainability score over six months"></canvas></div>
      </section>

      <section class="card card--pad" aria-labelledby="supTitle">
        <div class="card__head"><div><h2 id="supTitle">Supplier verification</h2><p>${plural(m.supplierCount, 'supplier')} tracked.</p></div></div>
        <div class="chart-box" style="height:170px"><canvas id="supplierChart" role="img" aria-label="Bar chart of suppliers by verification status"></canvas></div>
        ${attention.length ? `<div class="attention">${attention.map((s) => `
          <div class="attention__row"><span>${statusBadge(supplierStatus(s))}<b>${esc(s.name)}</b></span>
          <button class="link-btn" type="button" data-action="view-supplier" data-id="${esc(s.id)}">Review</button></div>`).join('')}</div>`
          : `<div class="attention"><div class="attention__row"><span>${badge('All clear', 'green', 'check')}Every supplier passes all four checks.</span></div></div>`}
      </section>
    </div>

    <section class="card" aria-labelledby="recentTitle">
      <div class="card__head" style="padding:22px 24px 0;margin-bottom:14px"><div><h2 id="recentTitle">Recent products</h2><p>The latest products added to your catalog.</p></div>
        <button class="link-btn" type="button" data-action="navigate" data-page="products">View all ${ic('arrow-right')}</button></div>
      ${recent.length ? recentProductsTable(recent) : `<div style="padding:0 24px 24px">${emptyState({ icon: 'package', title: 'No products yet', text: 'Add your first product to start tracking its supply chain.', action: 'add-product', label: 'Add product' })}</div>`}
    </section>

    <section aria-labelledby="sdgTitle">
      <div class="section-head" style="margin-bottom:16px"><div><h2 id="sdgTitle">Built for the Sustainable Development Goals</h2><p>How EcoTrace supports responsible business, as defined by the United Nations.</p></div></div>
      <div class="sdg">
        <article class="card sdg__card" style="--sdg:#a21942">
          <div class="sdg__num"><b>8</b><small>SDG</small></div>
          <div><h3>Decent work and economic growth</h3>
            <p>Supplier transparency and labor-practice verification support responsible sourcing and fair, safe working conditions across your supply chain.</p>
            <span class="sdg__link">${ic('handshake')}${m.verifiedSuppliers} of ${m.supplierCount} suppliers verified</span></div>
        </article>
        <article class="card sdg__card" style="--sdg:#bf8b2e">
          <div class="sdg__num"><b>12</b><small>SDG</small></div>
          <div><h3>Responsible consumption and production</h3>
            <p>Material tracking and lifecycle visibility help you use resources efficiently and give customers the facts to choose responsibly.</p>
            <span class="sdg__link">${ic('recycle')}${Math.round(m.recycled)}% average recycled content</span></div>
        </article>
      </div>
    </section>`;

  mount(el, html);
  drawDonut(m);
  drawTrend(m);
  drawSupplierChart(m);
}

/* Products */
const PRODUCT_SORTS = [
  { value: 'recent', label: 'Sort: Newest' }, { value: 'name', label: 'Sort: Name A–Z' },
  { value: 'eco', label: 'Sort: Eco rating' }, { value: 'recycled', label: 'Sort: Recycled %' }
];

function getFilteredProducts() {
  const f = state.filters.products;
  const q = f.q.trim().toLowerCase();
  let list = state.products.filter((p) => {
    if (q) {
      const hay = [p.name, p.id, p.batchNumber, p.category, p.origin, p.manufacturingCity, ...p.materials.map((m) => m.name)].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (f.category !== 'all' && p.category !== f.category) return false;
    if (f.origin !== 'all' && p.origin !== f.origin) return false;
    if (f.verification !== 'all' && p.verificationStatus !== f.verification) return false;
    if (f.eco === '90' && p.ecoRating < 90) return false;
    if (f.eco === '80' && (p.ecoRating < 80 || p.ecoRating >= 90)) return false;
    if (f.eco === 'lt80' && p.ecoRating >= 80) return false;
    if (f.recycled !== 'all' && p.recycledPercentage < Number(f.recycled)) return false;
    return true;
  });
  const sorters = {
    recent: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
    name: (a, b) => a.name.localeCompare(b.name),
    eco: (a, b) => b.ecoRating - a.ecoRating,
    recycled: (a, b) => b.recycledPercentage - a.recycledPercentage
  };
  return list.sort(sorters[f.sort] || sorters.recent);
}

function activeFilterCount(scope) {
  const f = state.filters[scope];
  const keys = { products: ['category', 'eco', 'origin', 'verification', 'recycled'], suppliers: ['country', 'verification', 'certification', 'score'], materials: ['type'] }[scope];
  return keys.filter((k) => f[k] !== 'all').length;
}

function productsListHtml() {
  const list = getFilteredProducts();
  if (!state.products.length) {
    return emptyState({ icon: 'package', title: 'No products yet', text: 'Add your first product to start tracking its supply chain.', action: 'add-product', label: 'Add product' });
  }
  if (!list.length) {
    return emptyState({ icon: 'search', title: 'No products match', text: 'Try a different search or clear your filters to see everything.', secondary: `<button class="btn btn--ghost" type="button" data-action="clear-filters" data-scope="products">Clear filters</button>` });
  }
  return `<div class="result-meta"><span>Showing ${list.length} of ${plural(state.products.length, 'product')}</span></div>${productsTable(list)}`;
}

function renderProducts() {
  const f = state.filters.products;
  const count = activeFilterCount('products');
  const verified = state.products.filter((p) => p.verificationStatus === 'Verified').length;
  const cats = unique(state.products.map((p) => p.category));
  const origins = unique(state.products.map((p) => p.origin).filter(Boolean));
  const html = `
    <div class="section-head">
      <div><h2>Product catalog</h2><p>${plural(state.products.length, 'product')} tracked, ${verified} fully verified.</p></div>
      <div class="section-head__actions"><button class="btn btn--primary" type="button" data-action="add-product">${ic('plus')}Add product</button></div>
    </div>
    <div>
      <div class="toolbar">
        <div class="input-affix toolbar__search">${ic('search')}<input class="input" type="search" placeholder="Search name, ID, batch or material" value="${esc(f.q)}" data-filter="products.q" aria-label="Search products"></div>
        <button class="btn btn--ghost filter-btn" type="button" data-action="toggle-filters" data-scope="products" aria-expanded="${state.filtersOpen.products}" aria-controls="productsFilters">${ic('sliders-horizontal')}Filters <span class="count" ${count ? '' : 'hidden'}>${count}</span></button>
        <select class="select select--sm" style="width:auto" data-filter="products.sort" aria-label="Sort products">${selectOptions(PRODUCT_SORTS, f.sort)}</select>
      </div>
      <div class="filter-panel${state.filtersOpen.products ? ' open' : ''}" id="productsFilters">
        ${filterField('products', 'category', 'Category', [{ value: 'all', label: 'All categories' }, ...cats])}
        ${filterField('products', 'eco', 'Eco rating', [{ value: 'all', label: 'Any rating' }, { value: '90', label: '90 and above' }, { value: '80', label: '80 to 89' }, { value: 'lt80', label: 'Below 80' }])}
        ${filterField('products', 'origin', 'Origin', [{ value: 'all', label: 'All countries' }, ...origins])}
        ${filterField('products', 'verification', 'Verification', [{ value: 'all', label: 'Any status' }, ...VERIFICATION])}
        ${filterField('products', 'recycled', 'Recycled content', [{ value: 'all', label: 'Any amount' }, { value: '25', label: '25% or more' }, { value: '50', label: '50% or more' }, { value: '75', label: '75% or more' }])}
        <button class="btn btn--quiet btn--sm" type="button" data-action="clear-filters" data-scope="products">Clear filters</button>
      </div>
    </div>
    <div id="productsList">${productsListHtml()}</div>`;
  mount($('#page-products'), html);
}

function refreshProductsList() {
  const box = $('#productsList');
  if (box) mount(box, productsListHtml(), false);
}

/* Suppliers */
const SUPPLIER_SORTS = [
  { value: 'score', label: 'Sort: Score' }, { value: 'name', label: 'Sort: Name A–Z' },
  { value: 'audit', label: 'Sort: Latest audit' }, { value: 'status', label: 'Sort: Needs attention' }
];

function getFilteredSuppliers() {
  const f = state.filters.suppliers;
  const q = f.q.trim().toLowerCase();
  const list = state.suppliers.filter((s) => {
    if (q && ![s.name, s.country, s.city, ...s.materials, ...s.certifications].join(' ').toLowerCase().includes(q)) return false;
    if (f.country !== 'all' && s.country !== f.country) return false;
    if (f.verification !== 'all' && supplierStatus(s) !== f.verification) return false;
    if (f.certification !== 'all' && !s.certifications.includes(f.certification)) return false;
    if (f.score === '90' && s.score < 90) return false;
    if (f.score === '80' && (s.score < 80 || s.score >= 90)) return false;
    if (f.score === 'lt80' && s.score >= 80) return false;
    return true;
  });
  const rank = { 'Needs Review': 0, Pending: 1, Verified: 2 };
  const sorters = {
    score: (a, b) => b.score - a.score,
    name: (a, b) => a.name.localeCompare(b.name),
    audit: (a, b) => String(b.lastAudit).localeCompare(String(a.lastAudit)),
    status: (a, b) => rank[supplierStatus(a)] - rank[supplierStatus(b)]
  };
  return list.sort(sorters[f.sort] || sorters.score);
}

function suppliersListHtml() {
  const list = getFilteredSuppliers();
  if (!state.suppliers.length) {
    return emptyState({ icon: 'handshake', title: 'No suppliers yet', text: 'Add the suppliers behind your products to verify labor practices and certifications.', action: 'add-supplier', label: 'Add supplier' });
  }
  if (!list.length) {
    return emptyState({ icon: 'search', title: 'No suppliers match', text: 'Try a different search or clear your filters.', secondary: `<button class="btn btn--ghost" type="button" data-action="clear-filters" data-scope="suppliers">Clear filters</button>` });
  }
  return `<div class="result-meta"><span>Showing ${list.length} of ${plural(state.suppliers.length, 'supplier')}</span></div><div class="grid-cards">${list.map(supplierCard).join('')}</div>`;
}

function renderSuppliers() {
  const f = state.filters.suppliers;
  const count = activeFilterCount('suppliers');
  const m = getBaseMetrics();
  const countries = unique(state.suppliers.map((s) => s.country));
  const html = `
    <div class="section-head">
      <div><h2>Supplier network</h2><p>${m.verifiedSuppliers} of ${plural(m.supplierCount, 'supplier')} pass every verification check.</p></div>
      <div class="section-head__actions"><button class="btn btn--primary" type="button" data-action="add-supplier">${ic('plus')}Add supplier</button></div>
    </div>
    <div>
      <div class="toolbar">
        <div class="input-affix toolbar__search">${ic('search')}<input class="input" type="search" placeholder="Search name, country, material or certification" value="${esc(f.q)}" data-filter="suppliers.q" aria-label="Search suppliers"></div>
        <button class="btn btn--ghost filter-btn" type="button" data-action="toggle-filters" data-scope="suppliers" aria-expanded="${state.filtersOpen.suppliers}" aria-controls="suppliersFilters">${ic('sliders-horizontal')}Filters <span class="count" ${count ? '' : 'hidden'}>${count}</span></button>
        <select class="select select--sm" style="width:auto" data-filter="suppliers.sort" aria-label="Sort suppliers">${selectOptions(SUPPLIER_SORTS, f.sort)}</select>
      </div>
      <div class="filter-panel${state.filtersOpen.suppliers ? ' open' : ''}" id="suppliersFilters">
        ${filterField('suppliers', 'country', 'Country', [{ value: 'all', label: 'All countries' }, ...countries])}
        ${filterField('suppliers', 'verification', 'Verification status', [{ value: 'all', label: 'Any status' }, ...VERIFICATION])}
        ${filterField('suppliers', 'certification', 'Certification', [{ value: 'all', label: 'Any certification' }, ...CERTIFICATIONS])}
        ${filterField('suppliers', 'score', 'Sustainability score', [{ value: 'all', label: 'Any score' }, { value: '90', label: '90 and above' }, { value: '80', label: '80 to 89' }, { value: 'lt80', label: 'Below 80' }])}
        <button class="btn btn--quiet btn--sm" type="button" data-action="clear-filters" data-scope="suppliers">Clear filters</button>
      </div>
    </div>
    <div id="suppliersList">${suppliersListHtml()}</div>`;
  mount($('#page-suppliers'), html);
}

function refreshSuppliersList() {
  const box = $('#suppliersList');
  if (box) mount(box, suppliersListHtml(), false);
}

/* Materials */
const MATERIAL_SORTS = [
  { value: 'name', label: 'Sort: Name A–Z' }, { value: 'rating', label: 'Sort: Environmental rating' },
  { value: 'recycled', label: 'Sort: Recycled %' }, { value: 'usage', label: 'Sort: Most used' }
];

function getFilteredMaterials() {
  const f = state.filters.materials;
  const q = f.q.trim().toLowerCase();
  const list = state.materials.filter((m) => {
    if (q && ![m.name, m.type, m.supplier, m.origin].join(' ').toLowerCase().includes(q)) return false;
    if (f.type !== 'all' && m.type !== f.type) return false;
    return true;
  });
  const sorters = {
    name: (a, b) => a.name.localeCompare(b.name),
    rating: (a, b) => b.envRating - a.envRating,
    recycled: (a, b) => b.recycledPct - a.recycledPct,
    usage: (a, b) => productsUsingMaterial(b.name).length - productsUsingMaterial(a.name).length
  };
  return list.sort(sorters[f.sort] || sorters.name);
}

function materialsListHtml() {
  const list = getFilteredMaterials();
  if (!state.materials.length) {
    return emptyState({ icon: 'layers', title: 'No materials yet', text: 'Build a library of the materials your products are made from.', action: 'add-material', label: 'Add material' });
  }
  if (!list.length) {
    return emptyState({ icon: 'search', title: 'No materials match', text: 'Try a different search or choose another type.', secondary: `<button class="btn btn--ghost" type="button" data-action="clear-filters" data-scope="materials">Clear filters</button>` });
  }
  return `<div class="result-meta"><span>Showing ${list.length} of ${plural(state.materials.length, 'material')}</span></div><div class="grid-cards">${list.map(materialCard).join('')}</div>`;
}

function renderMaterials() {
  const f = state.filters.materials;
  const html = `
    <div class="section-head">
      <div><h2>Materials library</h2><p>${plural(state.materials.length, 'material')} available to use across your products.</p></div>
      <div class="section-head__actions"><button class="btn btn--primary" type="button" data-action="add-material">${ic('plus')}Add material</button></div>
    </div>
    <div class="toolbar">
      <div class="input-affix toolbar__search">${ic('search')}<input class="input" type="search" placeholder="Search material, supplier or origin" value="${esc(f.q)}" data-filter="materials.q" aria-label="Search materials"></div>
      <select class="select select--sm" style="width:auto" data-filter="materials.type" aria-label="Filter by material type">${selectOptions([{ value: 'all', label: 'All types' }, ...MATERIAL_TYPES], f.type)}</select>
      <select class="select select--sm" style="width:auto" data-filter="materials.sort" aria-label="Sort materials">${selectOptions(MATERIAL_SORTS, f.sort)}</select>
    </div>
    <div id="materialsList">${materialsListHtml()}</div>`;
  mount($('#page-materials'), html);
}

function refreshMaterialsList() {
  const box = $('#materialsList');
  if (box) mount(box, materialsListHtml(), false);
}

/* Sustainability */
function renderSustainability() {
  const m = computeMetrics();
  const verdict = scoreVerdict(m.overall);
  const monthDelta = m.overall - METRICS.previous.overall;
  const cats = {};
  state.products.forEach((p) => { (cats[p.category] = cats[p.category] || []).push(p.ecoRating); });
  const catRows = Object.keys(cats).map((c) => ({ name: c, value: average(cats[c]), count: cats[c].length })).sort((a, b) => b.value - a.value);

  const env = [
    { icon: 'recycle', tone: 'green', label: 'Recycled material', value: Math.round(m.recycled), suffix: '%', progress: m.recycled, note: 'Average recycled content per product' },
    { icon: 'cloud', tone: 'blue', label: 'Estimated carbon footprint', value: m.carbonAvg, decimals: 1, suffix: 'kg CO₂e', progress: 100 - pct(m.carbonAvg, METRICS.industryCarbonAvg * 2), note: `${Math.round(Math.abs(m.carbonVsIndustry))}% ${m.carbonVsIndustry >= 0 ? 'below' : 'above'} the ${METRICS.industryCarbonAvg} kg industry average` },
    { icon: 'sprout', tone: 'green', label: 'Sustainable materials', value: Math.round(m.sustainableMaterials), suffix: '%', progress: m.sustainableMaterials, note: 'Recycled, organic or renewable by weight' },
    { icon: 'trash-2', tone: 'purple', label: 'Waste reduction', value: m.wasteReduction, suffix: '%', progress: m.wasteReduction, note: 'Less production waste than last cycle' },
    { icon: 'droplets', tone: 'blue', label: 'Renewable material', value: Math.round(m.renewable), suffix: '%', progress: m.renewable, note: 'Plant-based inputs by weight' }
  ];
  const eth = [
    { icon: 'heart-handshake', tone: 'amber', label: 'Fair Trade products', value: Math.round(m.fairTrade), suffix: '%', progress: m.fairTrade, note: `${state.products.filter((p) => p.fairTrade).length} of ${m.productCount} products certified` },
    { icon: 'badge-check', tone: 'green', label: 'Verified suppliers', value: Math.round(m.verifiedSupplierPct), suffix: '%', progress: m.verifiedSupplierPct, note: `${m.verifiedSuppliers} of ${m.supplierCount} suppliers pass every check` },
    { icon: 'clipboard-check', tone: 'blue', label: 'Audited suppliers', value: Math.round(m.auditedPct), suffix: '%', progress: m.auditedPct, note: `${m.auditedCount} audited in the last 12 months` },
    { icon: 'users', tone: 'purple', label: 'Ethical labor coverage', value: Math.round(m.laborCoverage), suffix: '%', progress: m.laborCoverage, note: `${m.laborCovered} products with fully compliant suppliers` }
  ];

  const html = `
    <div class="section-head"><div><h2>Sustainability analytics</h2><p>How your products and suppliers perform on environmental and ethical measures.</p></div></div>

    <div class="grid-4-8">
      <section class="card card--pad score-card" aria-labelledby="susScore">
        <div class="card__head"><div><h2 id="susScore">Overall score</h2><p>Combined environmental and ethical performance.</p></div></div>
        <div class="score-card__gauge">${gauge(m.overall, { size: 230 })}
          <div class="score-card__label"><span class="verdict">${verdict.label}</span>${trendHtml(monthDelta, ' pts')}</div></div>
      </section>
      <section class="card card--pad" aria-labelledby="susTrend">
        <div class="card__head"><div><h2 id="susTrend">Score trend</h2><p>Six-month view of your overall sustainability score.</p></div></div>
        <div class="chart-box chart-box--tall"><canvas id="susTrendChart" role="img" aria-label="Line chart of sustainability score over six months"></canvas></div>
      </section>
    </div>

    <section aria-labelledby="envTitle">
      <div class="section-head" style="margin-bottom:16px"><div><h2 id="envTitle">Environmental metrics</h2></div></div>
      <div class="grid-metrics">${env.map(metricCard).join('')}</div>
    </section>

    <section aria-labelledby="ethTitle">
      <div class="section-head" style="margin-bottom:16px"><div><h2 id="ethTitle">Ethical metrics</h2></div></div>
      <div class="grid-metrics">${eth.map(metricCard).join('')}</div>
    </section>

    <section aria-labelledby="brkTitle">
      <div class="section-head" style="margin-bottom:16px"><div><h2 id="brkTitle">Sustainability breakdown</h2><p>Compare products and see what drives the score.</p></div></div>
      <div class="grid-2">
        <div class="card card--pad"><div class="card__head"><div><h3>Eco rating by product</h3><p>Higher is better.</p></div></div><div class="chart-box"><canvas id="ecoBars" role="img" aria-label="Bar chart of eco rating by product"></canvas></div></div>
        <div class="card card--pad"><div class="card__head"><div><h3>Recycled content by product</h3><p>Share of each product made from recycled material.</p></div></div><div class="chart-box"><canvas id="recycledBars" role="img" aria-label="Bar chart of recycled content by product"></canvas></div></div>
      </div>
      <div class="grid-2" style="margin-top:24px">
        <div class="card card--pad"><div class="card__head"><div><h3>What makes up the score</h3><p>Each part is weighted by how much it moves the overall score.</p></div></div>${scoreParts(m.parts).replace('class="score-parts"', 'class="score-parts" style="margin:0;padding:0;border:0"')}</div>
        <div class="card card--pad"><div class="card__head"><div><h3>Performance by category</h3><p>Average eco rating for each product category.</p></div></div>
          <div class="cat-list">${catRows.length ? catRows.map((c) => `
            <div><div class="score-part__row"><span>${esc(c.name)} <small style="color:var(--text-faint)">· ${plural(c.count, 'product')}</small></span><strong>${Math.round(c.value)}</strong></div>${bar(c.value, ratingTone(c.value), { thin: true, label: c.name })}</div>`).join('') : '<p style="color:var(--text-muted)">Add products to see category performance.</p>'}</div></div>
      </div>
    </section>`;

  mount($('#page-sustainability'), html);
  drawTrend(m, 'susTrendChart', 'susTrend');
  if (state.products.length) {
    drawProductBars('ecoBars', 'ecoBars', 'ecoRating', cssVar('--chart-recycled'), 'Eco rating');
    drawProductBars('recycledBars', 'recycledBars', 'recycledPercentage', cssVar('--chart-other'), 'Recycled');
  }
}

/* Consumer view */
function consumerTrail(p) {
  const mats = p.materials.slice().sort((a, b) => b.percentage - a.percentage);
  const origins = unique(mats.map((m) => { const l = findMaterial(m.name); return l && l.origin ? l.origin.split(',').pop().trim() : ''; }).filter(Boolean));
  const suppliers = unique(mats.map((m) => m.supplier).filter(Boolean));
  const st = catStyle(p.category);
  return [
    { icon: 'sprout', title: 'Raw materials', text: origins.length ? `Grown and recovered in ${origins.join(', ')}.` : 'Sourced from listed suppliers.' },
    { icon: 'handshake', title: 'Ethical supplier', text: suppliers.length ? `${suppliers.slice(0, 3).join(', ')}${suppliers.length > 3 ? ' and more' : ''}`.replace(/\.?$/, '.') : 'Supplier details coming soon.' },
    { icon: 'factory', title: 'Responsible manufacturing', text: `${p.facility ? p.facility + ', ' : ''}${placeText(p)}.` },
    { icon: 'truck', title: 'Distribution', text: `Shipped from ${p.origin || 'our facility'} in recyclable packaging.` },
    { icon: st.icon, title: 'You', text: `Your ${p.name.toLowerCase()} is on its way to a longer life.`, you: true }
  ];
}

function consumerCardHtml(p) {
  const status = p.verificationStatus;
  const tone = STATUS_STYLE[status].tone;
  const verdict = scoreVerdict(p.ecoRating);
  const tagline = p.ecoRating >= 85 ? 'Sustainably made' : p.ecoRating >= 70 ? 'Responsibly made' : 'Improving with every batch';
  const certs = productCertifications(p);
  const mats = p.materials.slice().sort((a, b) => b.percentage - a.percentage);
  const badgeText = status === 'Verified' ? 'Verified Supply Chain' : status === 'Pending' ? 'Verification in progress' : 'Under review';
  const badgeSub = status === 'Verified' ? `Batch ${p.batchNumber || '—'}` : 'Some steps are still being checked';
  const scoreCopy = `${verdict.label} rating for materials, sourcing and manufacturing.`;

  return `<article class="consumer" aria-label="Transparency page for ${esc(p.name)}">
    <header class="consumer__hero">
      <div class="consumer__seed">${ic('sprout')}</div>
      <h2 class="consumer__name">${esc(p.name)}</h2>
      <p class="consumer__tag">${tagline}</p>
    </header>
    <div class="consumer__sheet">
      <div class="verified-badge tone-${tone}">${ic(STATUS_STYLE[status].icon)}<div style="text-align:left">${badgeText}<small>${esc(badgeSub)}</small></div></div>

      <div class="consumer__score">
        ${gauge(p.ecoRating, { size: 200 })}
        <p>${esc(scoreCopy)}</p>
      </div>

      <div class="facts">
        <div class="fact">${ic('recycle')}<strong>${Math.round(p.recycledPercentage)}%</strong><small>Recycled content</small></div>
        <div class="fact">${ic('heart-handshake')}<strong>${p.fairTrade ? 'Certified' : 'Not certified'}</strong><small>Fair Trade</small></div>
        <div class="fact">${ic('cloud')}<strong>${fmtNum(p.carbonFootprint || 0, 1)} kg</strong><small>Carbon footprint (CO₂e)</small></div>
        <div class="fact">${ic('map-pin')}<strong>${esc(p.origin || '—')}</strong><small>${esc(p.manufacturingCity || 'Made in')}</small></div>
      </div>

      <div class="consumer__block">
        <h3>What it's made of</h3>
        <div class="mat-list">${mats.map((m) => {
          const lib = findMaterial(m.name);
          const sup = findSupplier(m.supplier);
          return `<div>
            <div class="mat-item__row"><span class="mat-item__name">${esc(m.name)}</span><span class="mat-item__pct">${Math.round(m.percentage)}%</span></div>
            ${bar(m.percentage, lib ? (TYPE_TONE[lib.type] === 'gray' ? 'gray' : TYPE_TONE[lib.type]) : 'gray', { label: m.name })}
            <div class="mat-origin">${lib && lib.origin ? `${ic('map-pin')}${esc(lib.origin)}` : ''}${m.supplier ? `<span>· ${esc(m.supplier)}</span>` : ''}${sup && supplierStatus(sup) === 'Verified' ? `<span class="badge tone-green" style="padding:1px 8px 1px 6px">${ic('badge-check')}Verified</span>` : ''}</div>
          </div>`;
        }).join('') || '<p style="color:var(--text-muted)">Materials will appear here once added.</p>'}</div>
      </div>

      <div class="consumer__block">
        <h3>Certifications</h3>
        <div class="chips">${certs.length ? certs.map((c) => `<span class="cert cert--lg">${ic('badge-check')}${esc(c)}</span>`).join('') : '<span style="color:var(--text-muted);font-size:14px">No certifications recorded yet.</span>'}</div>
      </div>

      <div class="consumer__block">
        <h3>Product journey</h3>
        <div class="trail">${consumerTrail(p).map((s) => `
          <div class="trail__step${s.you ? ' is-you' : ''} tone-${s.you ? 'green' : 'green'}">
            <span class="trail__dot">${ic(s.icon)}</span>
            <div><h4>${esc(s.title)}</h4><p>${esc(s.text)}</p></div>
          </div>`).join('')}</div>
      </div>

      <div class="consumer__foot">
        <span class="brand__mark"><svg viewBox="0 0 32 32" aria-hidden="true"><use href="#logo-mark"/></svg></span>
        <div><strong>Traced with EcoTrace</strong>${esc(p.id)} · Updated ${esc(fmtDate(state.lastUpdated))}</div>
      </div>
    </div>
  </article>`;
}

function renderConsumer() {
  const el = $('#page-consumer');
  if (!state.products.length) {
    mount(el, emptyState({ icon: 'qr-code', title: 'Nothing to preview yet', text: 'Add a product and its customer-facing transparency page will appear here.', action: 'add-product', label: 'Add product' }));
    return;
  }
  let p = findProduct(state.consumerProductId);
  if (!p) { p = state.products[0]; state.consumerProductId = p.id; }
  const html = `
    <div class="card consumer-bar">
      <div class="consumer-bar__left">
        <span class="tile tone-green">${ic('qr-code')}</span>
        <select class="select" id="consumerSelect" aria-label="Choose a product to preview">${selectOptions(state.products.map((x) => ({ value: x.id, label: `${x.name} (${x.id})` })), p.id)}</select>
        <p>This is the page customers open when they scan the code on a product.</p>
      </div>
      <button class="btn btn--primary" type="button" data-action="enter-preview">${ic('maximize-2')}Full-screen preview</button>
    </div>
    <div class="consumer-stage">${consumerCardHtml(p)}</div>`;
  mount(el, html);
}

/* Settings */
function renderSettings() {
  const dark = document.documentElement.dataset.theme === 'dark';
  const html = `
    <div class="section-head"><div><h2>Settings</h2><p>Personalize EcoTrace and manage the data stored in this browser.</p></div></div>
    <div class="settings-grid">
      <section class="card card--pad">
        <div class="card__head"><div><h2>Business profile</h2><p>Shown in the sidebar, header and dashboard greeting.</p></div></div>
        <div class="field">
          <label for="businessName">Business name</label>
          <div class="inline-form"><input class="input" id="businessName" value="${esc(state.settings.businessName)}" maxlength="40" autocomplete="organization"><button class="btn btn--primary" type="button" data-action="save-settings">Save name</button></div>
          <p class="field__error" id="businessNameError" role="alert">Enter a business name.</p>
        </div>
      </section>

      <section class="card card--pad">
        <div class="card__head"><div><h2>Appearance</h2><p>Your choice is remembered on this device.</p></div></div>
        <div class="setting-row"><div><strong>Dark mode</strong><p>A low-glare theme designed for dim rooms.</p></div>
          <label class="switch"><input type="checkbox" id="themeSwitch" ${dark ? 'checked' : ''}><span class="switch__track"></span><span class="visually-hidden">Dark mode</span></label></div>
      </section>

      <section class="card card--pad">
        <div class="card__head"><div><h2>Your data</h2><p>Everything is stored in this browser only. Nothing is sent to a server.</p></div></div>
        <div class="setting-row"><div><strong>Export data</strong><p>Download products, suppliers and materials as a JSON file.</p></div><button class="btn btn--ghost" type="button" data-action="export-data">${ic('download')}Export</button></div>
        <div class="setting-row"><div><strong>Reset sample data</strong><p>Remove your changes and restore the original demo data.</p></div><button class="btn btn--ghost" type="button" data-action="reset-data">${ic('rotate-ccw')}Reset</button></div>
      </section>

      <section class="card card--pad">
        <div class="card__head"><div><h2>How scores work</h2><p>The overall score is a weighted blend of four measures.</p></div></div>
        <div class="cat-list">${SCORE_WEIGHTS.map((w) => `<div class="score-part__row" style="margin:0"><span>${esc(w.label)}</span><strong>${Math.round(w.weight * 100)}%</strong></div>`).join('')}</div>
        <p class="score-note">Recycled content is scaled so that 67% or more earns full marks. Supplier verification counts suppliers that pass all four checks.</p>
      </section>
    </div>`;
  mount($('#page-settings'), html);
}

/* ---------- 8. Modals ---------- */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
let pendingConfirm = null;

function openModal({ title = '', subtitle = '', body, footer = '', size = 'md', bare = false, onOpen }) {
  closeModal(true);
  const opener = document.activeElement;
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `<div class="modal modal--${size}" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    ${bare ? '' : `<div class="modal__head">
      <div><h2 id="modalTitle">${esc(title)}</h2>${subtitle ? `<p>${esc(subtitle)}</p>` : ''}</div>
      <button class="icon-btn icon-btn--sm" type="button" data-action="close-modal" aria-label="Close dialog">${ic('x')}</button>
    </div>`}
    <div class="modal__body">${body}</div>
    ${footer ? `<div class="modal__foot">${footer}</div>` : ''}
  </div>`;
  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) closeModal(); });
  $('#modalRoot').appendChild(overlay);
  document.body.style.overflow = 'hidden';
  modalState = { overlay, opener };
  animateIn(overlay);
  const firstField = $('.modal__body input:not([type="hidden"]):not([type="range"]), .modal__body select, .modal__body textarea', overlay);
  const target = firstField || $('.modal__foot .btn--primary, .modal__foot .btn, [data-action="close-modal"]', overlay);
  if (target) setTimeout(() => target.focus({ preventScroll: true }), 40);
  if (onOpen) onOpen(overlay);
}

function closeModal(immediate = false) {
  if (!modalState) return;
  const { overlay, opener } = modalState;
  modalState = null;
  pendingConfirm = null;
  const done = () => {
    overlay.remove();
    if (!modalState && !document.body.classList.contains('sidebar-open')) document.body.style.overflow = '';
    if (!immediate && opener && document.contains(opener) && opener.focus) opener.focus({ preventScroll: true });
  };
  if (immediate || reduceMotion()) done();
  else { overlay.classList.add('closing'); setTimeout(done, 180); }
}

function confirmDialog({ title, message, confirmLabel = 'Delete', onConfirm }) {
  openModal({
    size: 'sm', bare: true,
    body: `<div class="confirm"><span class="tile tone-red">${ic('trash-2')}</span><h2 id="modalTitle">${esc(title)}</h2><p>${esc(message)}</p></div>`,
    footer: `<button class="btn btn--ghost" type="button" data-action="close-modal">Cancel</button><button class="btn btn--danger" type="button" data-action="confirm-yes">${esc(confirmLabel)}</button>`
  });
  pendingConfirm = onConfirm;
}

/* Product detail */
function journeyHtml(journey) {
  return `<div class="journey" style="--steps:${journey.length}">${journey.map((s, i) => {
    const st = STATUS_STYLE[s.status] || STATUS_STYLE.Pending;
    return `<div class="journey__step tone-${st.tone}${s.status === 'Verified' ? ' is-verified' : ''}" style="--i:${i}">
      <span class="journey__node">${ic(s.icon)}</span>
      <div class="journey__content">
        <div class="journey__title">${esc(s.title)}</div>
        <div class="journey__date">${esc(fmtDate(s.date))}</div>
        <div class="journey__loc">${ic('map-pin')}${esc(s.location)}</div>
        <p class="journey__desc">${esc(s.description)}</p>
        <div class="journey__badge">${statusBadge(s.status)}</div>
      </div>
    </div>`;
  }).join('')}</div>`;
}

function materialBreakdownHtml(p) {
  const mats = p.materials.slice().sort((a, b) => b.percentage - a.percentage);
  if (!mats.length) return '<p style="color:var(--text-muted)">No materials recorded for this product.</p>';
  return `<div class="mat-list">${mats.map((m) => {
    const lib = findMaterial(m.name);
    const tone = lib ? TYPE_TONE[lib.type] || 'gray' : 'gray';
    const sup = findSupplier(m.supplier);
    return `<div>
      <div class="mat-item__row"><span class="mat-item__name">${esc(m.name)} ${lib ? badge(lib.type, tone) : ''}</span><span class="mat-item__pct">${Math.round(m.percentage)}%</span></div>
      ${bar(m.percentage, tone, { label: m.name })}
      <div class="mat-item__sub">${ic('handshake')}${esc(m.supplier || 'No supplier')}${sup ? ` · ${statusBadge(supplierStatus(sup))}` : ' · <span class="chip">Not in supplier list</span>'}</div>
    </div>`;
  }).join('')}</div>`;
}

function productDetailHtml(p) {
  const st = catStyle(p.category);
  const certs = productCertifications(p);
  return `
    <div class="pd-head">
      <span class="art tone-${st.tone}" style="--art:112px" aria-hidden="true">${ic(st.icon)}</span>
      <div class="pd-head__main">
        <div class="chips" style="margin-bottom:10px">${statusBadge(p.verificationStatus)}${p.fairTrade ? badge('Fair Trade', 'amber', 'heart-handshake') : ''}<span class="chip">${esc(p.category)}</span></div>
        <h3>${esc(p.name)}</h3>
        <div class="pd-meta"><span>${ic('hash')}${esc(p.id)}</span><span>${ic('tag')}${esc(p.batchNumber || 'No batch number')}</span><span>${ic('map-pin')}${esc(placeText(p))}</span></div>
        <p class="pd-desc">${esc(p.description || 'No description added yet.')}</p>
      </div>
      <div class="pd-score">${gauge(p.ecoRating, { size: 132 })}<small>Eco rating</small></div>
    </div>

    <div class="stat-row">
      <div class="stat"><small>${ic('factory')}Facility</small><strong>${esc(p.facility || '—')}</strong></div>
      <div class="stat"><small>${ic('recycle')}Recycled content</small><strong>${Math.round(p.recycledPercentage)}%</strong></div>
      <div class="stat"><small>${ic('cloud')}Carbon footprint</small><strong>${fmtNum(p.carbonFootprint || 0, 1)} kg CO₂e</strong></div>
      <div class="stat"><small>${ic('handshake')}Suppliers</small><strong>${statusBadge(productSupplierStatus(p))}</strong></div>
    </div>

    <section class="detail-section">
      <h3>Product journey</h3><p>From raw material to the finished product.</p>
      <div class="detail-body">${journeyHtml(buildJourney(p))}</div>
    </section>

    <section class="detail-section">
      <h3>Material breakdown</h3><p>What it's made of and who supplies each material.</p>
      <div class="detail-body">${materialBreakdownHtml(p)}</div>
    </section>

    <section class="detail-section">
      <h3>Certifications</h3>
      <div class="detail-body chips">${certs.length ? certs.map((c) => `<span class="cert cert--lg">${ic('badge-check')}${esc(c)}</span>`).join('') : '<span style="color:var(--text-muted)">No certifications recorded yet.</span>'}</div>
    </section>`;
}

function openProductDetail(id) {
  const p = findProduct(id);
  if (!p) return;
  openModal({
    title: 'Product details', subtitle: `${p.id} · ${p.category}`, size: 'xl', body: productDetailHtml(p),
    footer: `<button class="btn btn--quiet push-left" type="button" data-action="open-consumer" data-id="${esc(p.id)}">${ic('qr-code')}Customer view</button>
      <button class="btn btn--ghost" type="button" data-action="edit-product" data-id="${esc(p.id)}">${ic('pencil')}Edit</button>
      <button class="btn btn--primary" type="button" data-action="close-modal">Done</button>`
  });
}

/* Supplier detail */
function supplierDetailHtml(s) {
  const status = supplierStatus(s);
  const labor = laborStyle(s.fairLabor);
  const prods = productsFromSupplier(s.name);
  return `
    <div class="pd-head">
      <span class="art tone-${STATUS_STYLE[status].tone}" style="--art:96px;border-radius:24px" aria-hidden="true"><b style="position:relative;font-size:26px">${esc(initials(s.name))}</b></span>
      <div class="pd-head__main">
        <div class="chips" style="margin-bottom:10px">${statusBadge(status)}${badge(s.fairLabor, labor.tone, labor.icon)}</div>
        <h3>${esc(s.name)}</h3>
        <div class="pd-meta"><span>${ic('map-pin')}${esc([s.city, s.country].filter(Boolean).join(', '))}</span><span>${ic('calendar')}${plural(Number(s.yearsActive) || 0, 'year')} active</span><span>${ic('clipboard-check')}Last audit ${esc(fmtDate(s.lastAudit))}</span></div>
      </div>
      <div class="pd-score">${gauge(s.score, { size: 120 })}<small>Overall score</small></div>
    </div>

    <div class="stat-row">
      <div class="stat"><small>${ic('globe')}Country</small><strong>${esc(s.country)}</strong></div>
      <div class="stat"><small>${ic('calendar')}Years active</small><strong>${esc(s.yearsActive || 0)}</strong></div>
      <div class="stat"><small>${ic('layers')}Materials supplied</small><strong>${s.materials.length}</strong></div>
      <div class="stat"><small>${ic('package')}Products</small><strong>${prods.length}</strong></div>
    </div>

    <section class="detail-section">
      <h3>Verification</h3><p>Select a check to mark it complete or not yet done. The status updates automatically.</p>
      <div class="detail-body checklist">${CHECKS.map((c) => {
        const on = !!(s.checks && s.checks[c.key]);
        return `<button class="check-row${on ? ' is-on' : ''}" type="button" role="switch" aria-checked="${on}" data-action="toggle-check" data-id="${esc(s.id)}" data-check="${c.key}">
          <span class="check-row__box">${ic('check')}</span>${esc(c.label)}<span class="check-row__state">${on ? 'Complete' : 'Not yet'}</span></button>`;
      }).join('')}</div>
    </section>

    <section class="detail-section">
      <h3>Certifications</h3>
      <div class="detail-body chips">${s.certifications.length ? s.certifications.map((c) => `<span class="cert cert--lg">${ic('badge-check')}${esc(c)}</span>`).join('') : '<span style="color:var(--text-muted)">No certifications recorded yet.</span>'}</div>
    </section>

    <section class="detail-section">
      <h3>Materials supplied</h3>
      <div class="detail-body chips">${s.materials.length ? s.materials.map((m) => `<span class="chip">${esc(m)}</span>`).join('') : '<span style="color:var(--text-muted)">None listed.</span>'}</div>
    </section>

    <section class="detail-section">
      <h3>Products using this supplier</h3>
      <div class="detail-body chips">${prods.length ? prods.map((p) => `<button class="chip" type="button" data-action="view-product" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join('') : '<span style="color:var(--text-muted)">No products use this supplier yet.</span>'}</div>
    </section>`;
}

function openSupplierDetail(id) {
  const s = findSupplierById(id);
  if (!s) return;
  openModal({
    title: 'Supplier details', subtitle: `${s.id} · ${s.country}`, size: 'lg', body: supplierDetailHtml(s),
    footer: `<button class="btn btn--quiet push-left" type="button" data-action="delete-supplier" data-id="${esc(s.id)}" style="color:var(--danger)">${ic('trash-2')}Delete</button>
      <button class="btn btn--ghost" type="button" data-action="edit-supplier" data-id="${esc(s.id)}">${ic('pencil')}Edit</button>
      <button class="btn btn--primary" type="button" data-action="close-modal">Done</button>`
  });
}

function toggleSupplierCheck(id, key) {
  const s = findSupplierById(id);
  if (!s) return;
  s.checks = s.checks || {};
  s.checks[key] = !s.checks[key];
  persist();
  const body = $('.modal__body');
  if (body) { mount(body, supplierDetailHtml(s), false); const again = $(`[data-check="${key}"]`, body); if (again) again.focus({ preventScroll: true }); }
  renderCurrentPage();
  showToast('Supplier verification updated.');
}

/* Material detail */
function openMaterialDetail(id) {
  const m = findMaterialById(id);
  if (!m) return;
  const users = productsUsingMaterial(m.name);
  const tone = TYPE_TONE[m.type] || 'gray';
  openModal({
    title: m.name, subtitle: `${m.id} · ${m.type} material`, size: 'md',
    body: `
      <div class="chips" style="margin-bottom:18px">${badge(m.type, tone)}${m.renewable ? badge('Renewable', 'green', 'sprout') : ''}<span class="grade tone-${ratingTone(m.envRating)}" title="Environmental grade">${gradeFor(m.envRating)}</span></div>
      <div class="stat-row" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:0">
        <div class="stat"><small>${ic('handshake')}Supplier</small><strong>${esc(m.supplier || '—')}</strong></div>
        <div class="stat"><small>${ic('map-pin')}Origin</small><strong>${esc(m.origin || '—')}</strong></div>
        <div class="stat"><small>${ic('recycle')}Recycled content</small><strong>${Math.round(m.recycledPct)}%</strong></div>
        <div class="stat"><small>${ic('leaf')}Environmental rating</small><strong>${Math.round(m.envRating)} / 100</strong></div>
      </div>
      <section class="detail-section"><h3>Products using this material</h3>
        <div class="detail-body chips">${users.length ? users.map((p) => `<button class="chip" type="button" data-action="view-product" data-id="${esc(p.id)}">${esc(p.name)}</button>`).join('') : '<span style="color:var(--text-muted)">Not used in any product yet.</span>'}</div></section>`,
    footer: `<button class="btn btn--ghost" type="button" data-action="edit-material" data-id="${esc(m.id)}">${ic('pencil')}Edit</button><button class="btn btn--primary" type="button" data-action="close-modal">Done</button>`
  });
}

/* ---------- 9. Forms ---------- */
function fieldHtml({ id, label, value = '', type = 'text', required = false, placeholder = '', hint = '', attrs = '', span2 = false, list = '' }) {
  return `<div class="field${span2 ? ' span-2' : ''}">
    <label for="${id}">${esc(label)}${required ? '<span class="req" aria-hidden="true">*</span>' : ''}</label>
    <input class="input" id="${id}" name="${id}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}"${required ? ' required' : ''}${list ? ` list="${list}"` : ''} aria-describedby="${id}-error" ${attrs}>
    ${hint ? `<p class="field__hint">${esc(hint)}</p>` : ''}<p class="field__error" id="${id}-error" role="alert"></p>
  </div>`;
}
function selectFieldHtml({ id, label, options, value, span2 = false }) {
  return `<div class="field${span2 ? ' span-2' : ''}"><label for="${id}">${esc(label)}</label><select class="select" id="${id}" name="${id}">${selectOptions(options, value)}</select></div>`;
}
function switchHtml(id, label, checked) {
  return `<label class="switch"><input type="checkbox" id="${id}"${checked ? ' checked' : ''}><span class="switch__track"></span><span class="switch__label">${esc(label)}</span></label>`;
}

function showFormErrors(errors) {
  $$('.field.has-error').forEach((f) => f.classList.remove('has-error'));
  $$('[aria-invalid="true"]').forEach((i) => i.removeAttribute('aria-invalid'));
  const box = $('#materialError');
  if (box) { box.textContent = ''; box.hidden = true; }
  let first = null;
  const order = $$('.modal__body [id]').map((n) => n.id);
  Object.keys(errors).sort((a, b) => order.indexOf(a) - order.indexOf(b)).forEach((key) => {
    if (key === 'materials') {
      if (box) { box.textContent = errors[key]; box.hidden = false; }
      first = first || $('.js-mat-name');
      return;
    }
    const input = document.getElementById(key);
    if (!input) return;
    const f = input.closest('.field');
    if (f) f.classList.add('has-error');
    const msg = document.getElementById(`${key}-error`);
    if (msg) msg.textContent = errors[key];
    input.setAttribute('aria-invalid', 'true');
    first = first || input;
  });
  if (first) first.focus();
}

/* Product form */
function materialRowHtml(m = { name: '', percentage: '', supplier: '' }) {
  return `<div class="mat-row" data-mat-row>
    <div class="field"><span class="field__label">Material</span><input class="input js-mat-name" list="dlMaterials" value="${esc(m.name)}" placeholder="Organic Cotton" aria-label="Material name"></div>
    <div class="field"><span class="field__label">Percentage</span><div class="input-affix"><input class="input js-mat-pct" type="number" min="0" max="100" step="1" value="${esc(m.percentage)}" placeholder="70" aria-label="Percentage of product"><span class="affix-end">%</span></div></div>
    <div class="field"><span class="field__label">Supplier</span><input class="input js-mat-sup" list="dlSuppliers" value="${esc(m.supplier)}" placeholder="EcoTextiles Ltd." aria-label="Supplier"></div>
    <button class="icon-btn icon-btn--danger mat-remove" type="button" data-action="remove-material-row" aria-label="Remove material" title="Remove">${ic('trash-2')}</button>
  </div>`;
}

function blankProduct() {
  const id = nextId('PRD', state.products);
  return { id, name: '', category: '', batchNumber: `BATCH-${new Date().getFullYear()}-${id.split('-')[1]}`, description: '', origin: '', manufacturingCity: '', facility: '',
    ecoRating: 80, recycledPercentage: 0, carbonFootprint: '', fairTrade: false, verificationStatus: 'Pending', materials: [{ name: '', percentage: '', supplier: '' }] };
}

function productFormHtml(p) {
  const cats = unique([...Object.keys(CATEGORY_STYLE), ...state.products.map((x) => x.category)]);
  return `<form id="productForm" novalidate data-editing="${esc(p._editing || '')}">
    <div class="form-section">
      <h3>Basic information</h3><p class="form-section__desc">How this product is named and identified.</p>
      <div class="form-grid">
        ${fieldHtml({ id: 'pf-name', label: 'Product name', value: p.name, required: true, placeholder: 'Organic Cotton T-Shirt' })}
        ${fieldHtml({ id: 'pf-id', label: 'Product ID', value: p.id, required: true })}
        ${fieldHtml({ id: 'pf-category', label: 'Category', value: p.category, required: true, placeholder: 'Apparel', list: 'dlCategories' })}
        ${fieldHtml({ id: 'pf-batch', label: 'Batch number', value: p.batchNumber, placeholder: 'BATCH-2026-001' })}
        <div class="field span-2"><label for="pf-desc">Product description</label><textarea class="textarea" id="pf-desc" name="pf-desc" placeholder="What is it, and what makes it sustainable?">${esc(p.description)}</textarea></div>
      </div>
    </div>

    <div class="form-section">
      <h3>Manufacturing</h3><p class="form-section__desc">Where the finished product is made.</p>
      <div class="form-grid">
        ${fieldHtml({ id: 'pf-origin', label: 'Manufacturing country', value: p.origin, required: true, placeholder: 'India' })}
        ${fieldHtml({ id: 'pf-city', label: 'Manufacturing city', value: p.manufacturingCity, placeholder: 'Mumbai' })}
        ${fieldHtml({ id: 'pf-facility', label: 'Manufacturing facility', value: p.facility, placeholder: 'Sunrise Garments Unit 3', span2: true })}
      </div>
    </div>

    <div class="form-section">
      <h3>Sustainability</h3><p class="form-section__desc">Ratings and impact for this product.</p>
      <div class="form-grid">
        <div class="field"><label for="pf-eco">Eco rating</label><div class="range-row"><input type="range" id="pf-eco" min="0" max="100" value="${esc(p.ecoRating)}"><output id="pf-eco-out" for="pf-eco">${esc(p.ecoRating)}</output></div></div>
        ${fieldHtml({ id: 'pf-recycled', label: 'Recycled material %', value: p.recycledPercentage, type: 'number', attrs: 'min="0" max="100" step="1"', placeholder: '0' })}
        ${fieldHtml({ id: 'pf-carbon', label: 'Carbon footprint (kg CO₂e)', value: p.carbonFootprint, type: 'number', attrs: 'min="0" step="0.1"', placeholder: '3.9' })}
        ${selectFieldHtml({ id: 'pf-verification', label: 'Verification status', options: VERIFICATION, value: p.verificationStatus })}
        <div class="field span-2"><span class="field__label">Fair Trade status</span>${switchHtml('pf-fair', 'Fair Trade certified', p.fairTrade)}</div>
      </div>
    </div>

    <div class="form-section">
      <h3>Materials</h3><p class="form-section__desc">Add each material, its share of the product and who supplies it.</p>
      <div class="mat-rows" id="materialRows">${p.materials.map((m) => materialRowHtml(m)).join('')}</div>
      <p class="field__error" id="materialError" role="alert" style="display:block;margin-top:10px" hidden></p>
      <div class="mat-total" id="materialTotal"></div>
      <button class="btn btn--ghost btn--sm" type="button" data-action="add-material-row" style="margin-top:12px">${ic('plus')}Add material</button>
    </div>

    <datalist id="dlCategories">${cats.map((c) => `<option value="${esc(c)}"></option>`).join('')}</datalist>
    <datalist id="dlMaterials">${state.materials.map((m) => `<option value="${esc(m.name)}"></option>`).join('')}</datalist>
    <datalist id="dlSuppliers">${state.suppliers.map((s) => `<option value="${esc(s.name)}"></option>`).join('')}</datalist>
  </form>`;
}

function openProductForm(id) {
  const existing = id ? findProduct(id) : null;
  const p = existing ? { ...existing, _editing: existing.id, materials: existing.materials.length ? existing.materials : [{ name: '', percentage: '', supplier: '' }] } : blankProduct();
  openModal({
    title: existing ? 'Edit product' : 'Add product', subtitle: existing ? `Update the details for ${existing.name}.` : 'Record a product and how it is made.', size: 'lg',
    body: productFormHtml(p),
    footer: `<button class="btn btn--ghost" type="button" data-action="close-modal">Cancel</button><button class="btn btn--primary" type="submit" form="productForm">${ic('check')}Save product</button>`,
    onOpen: updateMaterialTotal
  });
}

function updateMaterialTotal() {
  const box = $('#materialTotal');
  if (!box) return;
  const total = $$('.js-mat-pct').reduce((sum, i) => sum + (parseFloat(i.value) || 0), 0);
  const rounded = Math.round(total * 10) / 10;
  const short = (n) => fmtNum(n, 1).replace('.0', '');
  let cls = 'is-ok';
  let msg = 'Materials add up to 100%.';
  if (rounded > 100) { cls = 'is-bad'; msg = `Over by ${short(rounded - 100)}%. Materials can't exceed 100%.`; }
  else if (rounded < 100) { cls = 'is-warn'; msg = `${short(100 - rounded)}% not yet assigned.`; }
  box.className = `mat-total ${cls}`;
  box.innerHTML = `<span>${msg}</span><strong>Total ${short(rounded)}%</strong>`;
}

function readProductForm() {
  const val = (id) => ($(`#${id}`) ? $(`#${id}`).value.trim() : '');
  const rows = $$('[data-mat-row]').map((r) => ({
    name: $('.js-mat-name', r).value.trim(),
    percentage: parseFloat($('.js-mat-pct', r).value),
    supplier: $('.js-mat-sup', r).value.trim()
  })).filter((m) => m.name || m.supplier || !Number.isNaN(m.percentage));
  return {
    id: val('pf-id'), name: val('pf-name'), category: val('pf-category'), batchNumber: val('pf-batch'), description: val('pf-desc'),
    origin: val('pf-origin'), manufacturingCity: val('pf-city'), facility: val('pf-facility'),
    ecoRating: parseInt($('#pf-eco').value, 10), recycledPercentage: val('pf-recycled') === '' ? 0 : parseFloat(val('pf-recycled')),
    carbonFootprint: val('pf-carbon') === '' ? 0 : parseFloat(val('pf-carbon')), fairTrade: $('#pf-fair').checked,
    verificationStatus: val('pf-verification'), materials: rows
  };
}

function validateProduct(d, editingId) {
  const e = {};
  if (!d.name) e['pf-name'] = 'Enter a product name.';
  if (!d.id) e['pf-id'] = 'Enter a product ID.';
  else if (state.products.some((p) => p.id.toLowerCase() === d.id.toLowerCase() && p.id !== editingId)) e['pf-id'] = 'This ID is already in use. Choose a different one.';
  if (!d.category) e['pf-category'] = 'Enter or choose a category.';
  if (!d.origin) e['pf-origin'] = 'Enter the manufacturing country.';
  if (Number.isNaN(d.recycledPercentage) || d.recycledPercentage < 0 || d.recycledPercentage > 100) e['pf-recycled'] = 'Enter a value from 0 to 100.';
  if (Number.isNaN(d.carbonFootprint) || d.carbonFootprint < 0) e['pf-carbon'] = 'Enter zero or a positive number.';
  if (!d.materials.length) e.materials = 'Add at least one material.';
  else {
    const bad = d.materials.find((m) => !m.name || Number.isNaN(m.percentage) || m.percentage <= 0 || m.percentage > 100);
    const total = d.materials.reduce((s, m) => s + (m.percentage || 0), 0);
    if (bad) e.materials = 'Each material needs a name and a percentage between 1 and 100.';
    else if (Math.round(total * 10) / 10 > 100) e.materials = 'Material percentages add up to more than 100%.';
  }
  return e;
}

function saveProduct(editingId) {
  const d = readProductForm();
  const errors = validateProduct(d, editingId);
  if (Object.keys(errors).length) { showFormErrors(errors); return; }
  const existing = editingId ? findProduct(editingId) : null;
  const product = {
    id: d.id, name: d.name, category: d.category, batchNumber: d.batchNumber, description: d.description,
    origin: d.origin, manufacturingCity: d.manufacturingCity, facility: d.facility,
    ecoRating: d.ecoRating, recycledPercentage: d.recycledPercentage, carbonFootprint: d.carbonFootprint,
    fairTrade: d.fairTrade, verificationStatus: d.verificationStatus, materials: d.materials,
    createdAt: existing ? existing.createdAt : isoDaysAgo(0)
  };
  if (existing) {
    state.products[state.products.indexOf(existing)] = product;
    if (state.consumerProductId === editingId) state.consumerProductId = product.id;
  } else {
    state.products.unshift(product);
  }
  persist();
  closeModal(true);
  renderCurrentPage();
  showToast(existing ? 'Product updated successfully.' : 'Product added successfully.');
}

function deleteProduct(id) {
  const p = findProduct(id);
  if (!p) return;
  confirmDialog({
    title: 'Delete this product?', message: `“${p.name}” will be removed from your catalog. This action cannot be undone.`,
    onConfirm: () => {
      state.products = state.products.filter((x) => x.id !== id);
      if (state.consumerProductId === id) state.consumerProductId = null;
      persist(); renderCurrentPage(); showToast('Product deleted.');
    }
  });
}

/* Supplier form */
function openSupplierForm(id) {
  const existing = id ? findSupplierById(id) : null;
  const s = existing || { id: nextId('SUP', state.suppliers), name: '', country: '', city: '', yearsActive: '', materials: [], checks: { identity: false, labor: false, environment: false, certification: false }, fairLabor: 'In review', certifications: [], lastAudit: '', score: 75 };
  openModal({
    title: existing ? 'Edit supplier' : 'Add supplier', subtitle: existing ? `Update ${existing.name}.` : 'Add a supplier so you can verify and track them.', size: 'lg',
    body: `<form id="supplierForm" novalidate data-editing="${esc(existing ? existing.id : '')}">
      <div class="form-section"><h3>Supplier overview</h3><p class="form-section__desc">Who they are and what they provide.</p>
        <div class="form-grid">
          ${fieldHtml({ id: 'sf-name', label: 'Supplier name', value: s.name, required: true, placeholder: 'EcoTextiles Ltd.' })}
          ${fieldHtml({ id: 'sf-country', label: 'Country', value: s.country, required: true, placeholder: 'India' })}
          ${fieldHtml({ id: 'sf-city', label: 'City', value: s.city, placeholder: 'Tirupur' })}
          ${fieldHtml({ id: 'sf-years', label: 'Years active', value: s.yearsActive, type: 'number', attrs: 'min="0" max="200" step="1"', placeholder: '5' })}
          ${fieldHtml({ id: 'sf-materials', label: 'Materials supplied', value: s.materials.join(', '), placeholder: 'Organic Cotton, Natural Dye', hint: 'Separate materials with commas.', span2: true })}
        </div></div>
      <div class="form-section"><h3>Ethics and performance</h3><p class="form-section__desc">Labor practices, audits and scoring.</p>
        <div class="form-grid">
          ${selectFieldHtml({ id: 'sf-labor', label: 'Fair-labor status', options: FAIR_LABOR, value: s.fairLabor })}
          ${fieldHtml({ id: 'sf-audit', label: 'Last audit date', value: s.lastAudit, type: 'date' })}
          ${fieldHtml({ id: 'sf-score', label: 'Sustainability score (0–100)', value: s.score, type: 'number', attrs: 'min="0" max="100" step="1"', required: true })}
        </div></div>
      <div class="form-section"><h3>Certifications</h3>
        <div class="chips" style="margin-top:12px">${CERTIFICATIONS.map((c) => `<label class="check-chip"><input type="checkbox" name="cert" value="${esc(c)}"${s.certifications.includes(c) ? ' checked' : ''}><span>${ic('badge-check')}${esc(c)}</span></label>`).join('')}</div></div>
      <div class="form-section"><h3>Verification checklist</h3><p class="form-section__desc">Status is set automatically: all four checks means Verified.</p>
        <div class="chips">${CHECKS.map((c) => `<label class="check-chip"><input type="checkbox" name="check" value="${c.key}"${s.checks && s.checks[c.key] ? ' checked' : ''}><span>${ic('check')}${esc(c.label)}</span></label>`).join('')}</div></div>
    </form>`,
    footer: `<button class="btn btn--ghost" type="button" data-action="close-modal">Cancel</button><button class="btn btn--primary" type="submit" form="supplierForm">${ic('check')}Save supplier</button>`
  });
}

function saveSupplier(editingId) {
  const val = (id) => $(`#${id}`).value.trim();
  const e = {};
  const name = val('sf-name');
  const score = parseFloat(val('sf-score'));
  if (!name) e['sf-name'] = 'Enter a supplier name.';
  else if (state.suppliers.some((s) => s.name.toLowerCase() === name.toLowerCase() && s.id !== editingId)) e['sf-name'] = 'A supplier with this name already exists.';
  if (!val('sf-country')) e['sf-country'] = 'Enter a country.';
  if (Number.isNaN(score) || score < 0 || score > 100) e['sf-score'] = 'Enter a score from 0 to 100.';
  if (Object.keys(e).length) { showFormErrors(e); return; }

  const existing = editingId ? findSupplierById(editingId) : null;
  const checks = {};
  CHECKS.forEach((c) => { checks[c.key] = $$('input[name="check"]:checked').some((i) => i.value === c.key); });
  const supplier = {
    id: existing ? existing.id : nextId('SUP', state.suppliers), name, country: val('sf-country'), city: val('sf-city'),
    yearsActive: parseInt(val('sf-years'), 10) || 0,
    materials: val('sf-materials').split(',').map((x) => x.trim()).filter(Boolean),
    checks, fairLabor: val('sf-labor'), certifications: $$('input[name="cert"]:checked').map((i) => i.value),
    lastAudit: val('sf-audit'), score
  };
  if (existing) {
    if (existing.name !== name) {
      state.products.forEach((p) => p.materials.forEach((m) => { if (m.supplier === existing.name) m.supplier = name; }));
      state.materials.forEach((m) => { if (m.supplier === existing.name) m.supplier = name; });
    }
    state.suppliers[state.suppliers.indexOf(existing)] = supplier;
  } else {
    state.suppliers.unshift(supplier);
  }
  persist(); closeModal(true); renderCurrentPage();
  showToast(existing ? 'Supplier updated successfully.' : 'Supplier added successfully.');
}

function deleteSupplier(id) {
  const s = findSupplierById(id);
  if (!s) return;
  const n = productsFromSupplier(s.name).length;
  confirmDialog({
    title: 'Delete this supplier?',
    message: `“${s.name}” will be removed.${n ? ` ${plural(n, 'product')} that use this supplier will show it as not listed.` : ''} This action cannot be undone.`,
    onConfirm: () => { state.suppliers = state.suppliers.filter((x) => x.id !== id); persist(); renderCurrentPage(); showToast('Supplier deleted.'); }
  });
}

/* Material form */
function openMaterialForm(id) {
  const existing = id ? findMaterialById(id) : null;
  const m = existing || { id: nextId('MAT', state.materials), name: '', type: 'Recycled', recycledPct: 0, renewable: false, supplier: '', origin: '', envRating: 75 };
  openModal({
    title: existing ? 'Edit material' : 'Add material', subtitle: existing ? `Update ${existing.name}.` : 'Add a material to your library.', size: 'md',
    body: `<form id="materialForm" novalidate data-editing="${esc(existing ? existing.id : '')}"><div class="form-grid">
      ${fieldHtml({ id: 'mf-name', label: 'Material name', value: m.name, required: true, placeholder: 'Recycled Polyester', span2: true })}
      ${selectFieldHtml({ id: 'mf-type', label: 'Type', options: MATERIAL_TYPES, value: m.type })}
      ${fieldHtml({ id: 'mf-recycled', label: 'Recycled content %', value: m.recycledPct, type: 'number', attrs: 'min="0" max="100" step="1"' })}
      ${fieldHtml({ id: 'mf-supplier', label: 'Supplier', value: m.supplier, placeholder: 'GreenFiber Co.', list: 'dlSuppliers2' })}
      ${fieldHtml({ id: 'mf-origin', label: 'Origin', value: m.origin, placeholder: 'Taichung, Taiwan' })}
      ${fieldHtml({ id: 'mf-rating', label: 'Environmental rating (0–100)', value: m.envRating, type: 'number', attrs: 'min="0" max="100" step="1"', required: true })}
      <div class="field"><span class="field__label">Renewable</span>${switchHtml('mf-renewable', 'Plant-based or renewable', m.renewable)}</div>
    </div><datalist id="dlSuppliers2">${state.suppliers.map((s) => `<option value="${esc(s.name)}"></option>`).join('')}</datalist></form>`,
    footer: `<button class="btn btn--ghost" type="button" data-action="close-modal">Cancel</button><button class="btn btn--primary" type="submit" form="materialForm">${ic('check')}Save material</button>`
  });
}

function saveMaterial(editingId) {
  const val = (id) => $(`#${id}`).value.trim();
  const e = {};
  const name = val('mf-name');
  const recycled = val('mf-recycled') === '' ? 0 : parseFloat(val('mf-recycled'));
  const rating = parseFloat(val('mf-rating'));
  if (!name) e['mf-name'] = 'Enter a material name.';
  else if (state.materials.some((m) => m.name.toLowerCase() === name.toLowerCase() && m.id !== editingId)) e['mf-name'] = 'This material is already in your library.';
  if (Number.isNaN(recycled) || recycled < 0 || recycled > 100) e['mf-recycled'] = 'Enter a value from 0 to 100.';
  if (Number.isNaN(rating) || rating < 0 || rating > 100) e['mf-rating'] = 'Enter a rating from 0 to 100.';
  if (Object.keys(e).length) { showFormErrors(e); return; }

  const existing = editingId ? findMaterialById(editingId) : null;
  const material = { id: existing ? existing.id : nextId('MAT', state.materials), name, type: val('mf-type'), recycledPct: recycled, renewable: $('#mf-renewable').checked, supplier: val('mf-supplier'), origin: val('mf-origin'), envRating: rating };
  if (existing) {
    if (existing.name !== name) state.products.forEach((p) => p.materials.forEach((m) => { if (m.name === existing.name) m.name = name; }));
    state.materials[state.materials.indexOf(existing)] = material;
  } else {
    state.materials.unshift(material);
  }
  persist(); closeModal(true); renderCurrentPage();
  showToast(existing ? 'Material updated successfully.' : 'Material added successfully.');
}

function deleteMaterial(id) {
  const m = findMaterialById(id);
  if (!m) return;
  const n = productsUsingMaterial(m.name).length;
  confirmDialog({
    title: 'Delete this material?',
    message: `“${m.name}” will be removed from the library.${n ? ` ${plural(n, 'product')} that use it will keep the name but lose its rating details.` : ''} This action cannot be undone.`,
    onConfirm: () => { state.materials = state.materials.filter((x) => x.id !== id); persist(); renderCurrentPage(); showToast('Material deleted.'); }
  });
}

/* ---------- 10. Filters ---------- */
const DEFAULT_FILTERS = () => ({
  products: { q: '', category: 'all', eco: 'all', origin: 'all', verification: 'all', recycled: 'all', sort: 'recent' },
  suppliers: { q: '', country: 'all', verification: 'all', certification: 'all', score: 'all', sort: 'score' },
  materials: { q: '', type: 'all', sort: 'name' }
});

function setFilter(path, value) {
  const [scope, key] = path.split('.');
  if (!state.filters[scope]) return;
  state.filters[scope][key] = value;
  ({ products: refreshProductsList, suppliers: refreshSuppliersList, materials: refreshMaterialsList })[scope]();
  const badgeEl = $(`[data-action="toggle-filters"][data-scope="${scope}"] .count`);
  if (badgeEl) { const n = activeFilterCount(scope); badgeEl.textContent = n; badgeEl.hidden = !n; }
}

function clearFilters(scope) {
  const sort = state.filters[scope].sort;
  state.filters[scope] = { ...DEFAULT_FILTERS()[scope], sort };
  renderCurrentPage();
}

function toggleFilters(btn) {
  const scope = btn.dataset.scope;
  state.filtersOpen[scope] = !state.filtersOpen[scope];
  btn.setAttribute('aria-expanded', String(state.filtersOpen[scope]));
  const panel = $(`#${scope}Filters`);
  if (panel) panel.classList.toggle('open', state.filtersOpen[scope]);
}

/* ---------- 11. Search ---------- */
function searchAll(q) {
  const term = q.trim().toLowerCase();
  if (!term) return null;
  const has = (parts) => parts.join(' ').toLowerCase().includes(term);
  return {
    product: state.products.filter((p) => has([p.name, p.id, p.category, p.origin, p.manufacturingCity, p.batchNumber, p.verificationStatus, ...p.materials.map((m) => m.name)])).slice(0, 5),
    supplier: state.suppliers.filter((s) => has([s.name, s.country, s.city, supplierStatus(s), ...s.materials, ...s.certifications])).slice(0, 5),
    material: state.materials.filter((m) => has([m.name, m.type, m.supplier, m.origin])).slice(0, 5)
  };
}

function renderSearchResults(q) {
  const box = $('#searchResults');
  const input = $('#globalSearch');
  searchIndex = -1;
  const res = searchAll(q);
  if (!res) {
    box.innerHTML = `<div class="search-empty"><strong>Search your supply chain</strong>Try “cotton”, “Vietnam” or “verified”.</div>`;
    input.setAttribute('aria-expanded', 'false');
    refreshIcons();
    return;
  }
  const hit = (type, id, icon, tone, title, sub) => `<button class="search-hit" type="button" role="option" data-action="open-result" data-type="${type}" data-id="${esc(id)}">
    <span class="search-hit__icon tone-${tone}">${ic(icon)}</span>
    <span class="search-hit__text"><span class="search-hit__name" style="display:block">${highlight(title, q.trim())}</span><span class="search-hit__sub" style="display:block">${esc(sub)}</span></span>${ic('arrow-right')}</button>`;
  const groups = [
    ['Products', res.product.map((p) => hit('product', p.id, catStyle(p.category).icon, catStyle(p.category).tone, p.name, `${p.id} · ${p.category} · ${placeText(p)}`))],
    ['Suppliers', res.supplier.map((s) => hit('supplier', s.id, 'handshake', STATUS_STYLE[supplierStatus(s)].tone, s.name, `${s.country} · ${supplierStatus(s)}`))],
    ['Materials', res.material.map((m) => hit('material', m.id, 'layers', TYPE_TONE[m.type] || 'gray', m.name, `${m.type} · ${m.origin || 'Origin not set'}`))]
  ].filter((g) => g[1].length);
  box.innerHTML = groups.length
    ? groups.map(([title, items]) => `<div role="group" aria-label="${title}"><div class="search-group__title">${title}</div>${items.join('')}</div>`).join('')
    : `<div class="search-empty"><strong>No results for “${esc(q.trim())}”</strong>Check the spelling or try a broader term.</div>`;
  input.setAttribute('aria-expanded', String(groups.length > 0));
  refreshIcons();
}

function moveSearchSelection(dir) {
  const hits = $$('.search-hit');
  if (!hits.length) return;
  searchIndex = (searchIndex + dir + hits.length) % hits.length;
  hits.forEach((h, i) => h.classList.toggle('is-active', i === searchIndex));
  hits[searchIndex].scrollIntoView({ block: 'nearest' });
}

function openResult(type, id) {
  closeDropdowns();
  if (type === 'product') openProductDetail(id);
  else if (type === 'supplier') openSupplierDetail(id);
  else openMaterialDetail(id);
}

/* ---------- 12. Notifications ---------- */
function buildNotifications() {
  const list = [];
  const verified = state.suppliers.filter((s) => supplierStatus(s) === 'Verified').sort((a, b) => String(b.lastAudit).localeCompare(String(a.lastAudit)))[0];
  const best = state.products.slice().sort((a, b) => b.ecoRating - a.ecoRating)[0];
  const attention = state.suppliers.filter((s) => supplierStatus(s) !== 'Verified').length;
  if (verified) list.push({ tone: 'green', icon: 'badge-check', title: 'New supplier verification completed.', meta: `${verified.name} · 2 hours ago` });
  list.push({ tone: 'amber', icon: 'clock', title: 'Organic Cotton supplier certification expires in 30 days.', meta: 'EcoTextiles Ltd. · GOTS · Yesterday' });
  if (best) list.push({ tone: 'blue', icon: 'leaf', title: `Product ${best.id} received a sustainability score of ${best.ecoRating}.`, meta: `${best.name} · 3 days ago` });
  if (attention) list.push({ tone: 'red', icon: 'triangle-alert', title: `${attention} ${attention === 1 ? 'supplier requires' : 'suppliers require'} review.`, meta: 'Open Suppliers to take action · This week' });
  return list;
}

function renderNotifications() {
  const list = buildNotifications();
  const unread = state.settings.notifRead ? 0 : list.length;
  $('#notifPanel').innerHTML = `
    <div class="notif__head"><h2>Notifications</h2>${unread ? `<button class="link-btn" type="button" data-action="mark-read" data-keep-open="1">Mark all as read</button>` : '<span style="font-size:13px;color:var(--text-muted)">All caught up</span>'}</div>
    <div class="notif__list">${list.map((n) => `<div class="notif__item${unread ? ' is-unread' : ''}">
      <span class="notif__icon tone-${n.tone}">${ic(n.icon)}</span>
      <div class="notif__body"><div class="notif__title">${esc(n.title)}</div><div class="notif__meta">${esc(n.meta)}</div></div></div>`).join('')}</div>`;
  const badgeEl = $('#notifBadge');
  badgeEl.textContent = unread;
  badgeEl.hidden = !unread;
  $('#notifToggle').setAttribute('aria-label', unread ? `Notifications, ${unread} unread` : 'Notifications');
}

/* ---------- 13. Toasts ---------- */
function showToast(message, type = 'success') {
  const map = { success: { tone: 'green', icon: 'check' }, error: { tone: 'red', icon: 'x' }, info: { tone: 'blue', icon: 'info' }, warning: { tone: 'amber', icon: 'triangle-alert' } };
  const t = map[type] || map.success;
  const el = document.createElement('div');
  el.className = `toast tone-${t.tone}`;
  el.setAttribute('role', 'status');
  el.innerHTML = `<span class="toast__icon">${ic(t.icon)}</span><span class="toast__msg">${esc(message)}</span><button class="toast__close" type="button" aria-label="Dismiss notification">${ic('x')}</button>`;
  $('#toastRegion').appendChild(el);
  refreshIcons();
  const dismiss = () => {
    if (el.dataset.gone) return;
    el.dataset.gone = '1';
    el.classList.add('leaving');
    setTimeout(() => el.remove(), 240);
  };
  $('.toast__close', el).addEventListener('click', dismiss);
  setTimeout(dismiss, 3800);
}

/* ---------- 14. Navigation, theme, actions & events ---------- */
function navigate(page, param) {
  const target = `#/${page}${param ? `/${encodeURIComponent(param)}` : ''}`;
  if (location.hash === target) route(); else location.hash = target;
}

function route() {
  const [key, param] = location.hash.replace(/^#\/?/, '').split('/');
  const page = PAGES[key] ? key : 'dashboard';
  if (page === 'consumer' && param) state.consumerProductId = decodeURIComponent(param);
  showPage(page);
}

function showPage(page) {
  closeDropdowns();
  if (document.body.classList.contains('preview-mode') && page !== 'consumer') exitPreview();
  state.page = page;
  $$('.page').forEach((s) => { s.hidden = s.dataset.page !== page; });
  $$('.nav__link').forEach((a) => { if (a.dataset.page === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#pageTitle').textContent = PAGES[page].title;
  $('#pageDesc').textContent = PAGES[page].desc;
  document.title = `${PAGES[page].title} · EcoTrace`;
  renderCurrentPage();
  closeSidebar();
  window.scrollTo(0, 0);
}

function toggleSidebar() {
  const open = document.body.classList.toggle('sidebar-open');
  $('.menu-btn').setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
}
function closeSidebar() {
  if (!document.body.classList.contains('sidebar-open')) return;
  document.body.classList.remove('sidebar-open');
  $('.menu-btn').setAttribute('aria-expanded', 'false');
  if (!modalState) document.body.style.overflow = '';
}

function toggleDropdown(trigger) {
  const panel = document.getElementById(trigger.getAttribute('aria-controls'));
  if (!panel) return;
  const willOpen = !panel.classList.contains('open');
  closeDropdowns();
  if (!willOpen) return;
  panel.classList.add('open');
  trigger.setAttribute('aria-expanded', 'true');
  if (panel.id === 'searchPanel') {
    const input = $('#globalSearch');
    input.value = '';
    renderSearchResults('');
    setTimeout(() => input.focus(), 30);
  }
  if (panel.id === 'notifPanel') { renderNotifications(); refreshIcons(); }
}
function closeDropdowns() {
  $$('.dropdown.open').forEach((p) => p.classList.remove('open'));
  $$('[data-action="toggle-dropdown"][aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
}
function openSearch() {
  const trigger = $('#searchToggle');
  if (!$('#searchPanel').classList.contains('open')) toggleDropdown(trigger);
  else $('#globalSearch').focus();
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(KEYS.theme, theme); } catch (e) { /* ignore */ }
  updateThemeButton();
  renderCurrentPage();
}
function updateThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  const btn = $('#themeToggle');
  btn.innerHTML = ic(dark ? 'sun' : 'moon');
  btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
  refreshIcons();
}

function enterPreview() {
  document.body.classList.add('preview-mode');
  $('#previewExit').hidden = false;
  window.scrollTo(0, 0);
}
function exitPreview() {
  document.body.classList.remove('preview-mode');
  $('#previewExit').hidden = true;
}

function refreshChrome() {
  $$('[data-business-name]').forEach((e) => { e.textContent = state.settings.businessName; });
  $$('[data-business-initials]').forEach((e) => { e.textContent = initials(state.settings.businessName); });
  $('#navProductCount').textContent = state.products.length || '';
  $('#navSupplierCount').textContent = state.suppliers.length || '';
  renderNotifications();
  refreshIcons();
}

function exportData() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), products: state.products, suppliers: state.suppliers, materials: state.materials }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ecotrace-data.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('Data exported as ecotrace-data.json.', 'info');
}

function resetData() {
  confirmDialog({
    title: 'Reset to sample data?', message: 'Your products, suppliers and materials will be replaced with the original demo data. This action cannot be undone.', confirmLabel: 'Reset data',
    onConfirm: () => {
      const seed = createSeedData();
      state.products = seed.products; state.suppliers = seed.suppliers; state.materials = seed.materials;
      state.filters = DEFAULT_FILTERS(); state.consumerProductId = null;
      persist(); renderCurrentPage(); showToast('Sample data restored.', 'info');
    }
  });
}

function saveSettings() {
  const input = $('#businessName');
  const name = input.value.trim();
  const field = input.closest('.field');
  if (!name) { field.classList.add('has-error'); input.focus(); return; }
  field.classList.remove('has-error');
  state.settings.businessName = name;
  saveToLocalStorage();
  refreshChrome();
  showToast('Business name updated.');
}

const actions = {
  navigate: (el) => navigate(el.dataset.page),
  'go-consumer': () => navigate('consumer'),
  'toggle-sidebar': toggleSidebar,
  'close-sidebar': closeSidebar,
  'toggle-dropdown': (el) => toggleDropdown(el),
  'toggle-theme': () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'),
  'mark-read': () => { state.settings.notifRead = true; saveToLocalStorage(); renderNotifications(); refreshIcons(); },
  'close-modal': () => closeModal(),
  'confirm-yes': () => { const fn = pendingConfirm; closeModal(); if (fn) fn(); },

  'add-product': () => openProductForm(),
  'view-product': (el) => openProductDetail(el.dataset.id),
  'edit-product': (el) => openProductForm(el.dataset.id),
  'delete-product': (el) => deleteProduct(el.dataset.id),
  'open-consumer': (el) => { closeModal(true); navigate('consumer', el.dataset.id); },
  'add-material-row': () => {
    $('#materialRows').insertAdjacentHTML('beforeend', materialRowHtml());
    refreshIcons(); updateMaterialTotal();
    const rows = $$('.js-mat-name'); rows[rows.length - 1].focus();
  },
  'remove-material-row': (el) => {
    const rows = $$('[data-mat-row]');
    if (rows.length <= 1) { const row = el.closest('[data-mat-row]'); $$('input', row).forEach((i) => { i.value = ''; }); }
    else el.closest('[data-mat-row]').remove();
    updateMaterialTotal();
  },

  'add-supplier': () => openSupplierForm(),
  'view-supplier': (el) => openSupplierDetail(el.dataset.id),
  'edit-supplier': (el) => openSupplierForm(el.dataset.id),
  'delete-supplier': (el) => deleteSupplier(el.dataset.id),
  'toggle-check': (el) => toggleSupplierCheck(el.dataset.id, el.dataset.check),

  'add-material': () => openMaterialForm(),
  'view-material': (el) => openMaterialDetail(el.dataset.id),
  'edit-material': (el) => openMaterialForm(el.dataset.id),
  'delete-material': (el) => deleteMaterial(el.dataset.id),

  'toggle-filters': (el) => toggleFilters(el),
  'clear-filters': (el) => clearFilters(el.dataset.scope),
  'open-result': (el) => openResult(el.dataset.type, el.dataset.id),

  'enter-preview': enterPreview,
  'exit-preview': exitPreview,
  'save-settings': saveSettings,
  'export-data': exportData,
  'reset-data': resetData
};

function bindEvents() {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-host')) closeDropdowns();
    const el = e.target.closest('[data-action]');
    if (e.target.closest('.dropdown .menu-item')) closeDropdowns();
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (!fn) return;
    fn(el, e);
    if (el.dataset.action !== 'toggle-dropdown' && !el.dataset.keepOpen && el.closest('.dropdown')) closeDropdowns();
  });

  document.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const editing = form.dataset.editing || '';
    if (form.id === 'productForm') saveProduct(editing);
    else if (form.id === 'supplierForm') saveSupplier(editing);
    else if (form.id === 'materialForm') saveMaterial(editing);
  });

  document.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset && t.dataset.filter) setFilter(t.dataset.filter, t.value);
    else if (t.id === 'globalSearch') renderSearchResults(t.value);
    else if (t.classList.contains('js-mat-pct')) updateMaterialTotal();
    else if (t.id === 'pf-eco') $('#pf-eco-out').textContent = t.value;
    const f = t.closest && t.closest('.field.has-error');
    if (f) f.classList.remove('has-error');
    if (t.classList && (t.classList.contains('js-mat-name') || t.classList.contains('js-mat-pct') || t.classList.contains('js-mat-sup'))) {
      const box = $('#materialError');
      if (box) box.hidden = true;
    }
  });

  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.id === 'consumerSelect') navigate('consumer', t.value);
    else if (t.id === 'themeSwitch') { setTheme(t.checked ? 'dark' : 'light'); const sw = $('#themeSwitch'); if (sw) sw.focus(); }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }

    if (e.key === 'Escape') {
      if (modalState) { closeModal(); return; }
      const open = $('.dropdown.open');
      if (open) { closeDropdowns(); const trigger = open.parentElement.querySelector('[data-action="toggle-dropdown"]'); if (trigger) trigger.focus(); return; }
      if (document.body.classList.contains('preview-mode')) { exitPreview(); return; }
      closeSidebar();
      return;
    }

    if (e.target.id === 'globalSearch') {
      if (e.key === 'ArrowDown') { e.preventDefault(); moveSearchSelection(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); moveSearchSelection(-1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const hits = $$('.search-hit');
        const target = hits[searchIndex] || hits[0];
        if (target) target.click();
      }
      return;
    }

    if (e.key === 'Tab' && modalState) {
      const items = $$(FOCUSABLE, modalState.overlay).filter((n) => n.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  window.addEventListener('hashchange', () => { closeModal(true); route(); });
}

/* ---------- 15. Init ---------- */
function init() {
  loadFromLocalStorage();
  bindEvents();
  updateThemeButton();
  route();
  setTimeout(() => {
    state.loading = false;
    if (state.page === 'dashboard') renderCurrentPage();
  }, reduceMotion() ? 0 : 650);
}

init();
