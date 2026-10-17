// Providers deliver SERVICES (moving, storing, certifying, verifying).
// Suppliers (see suppliers.js) deliver MATERIALS or manufacture products.
export const providerTypes = {
  transport: 'Transport carrier',
  logistics: 'Warehousing and logistics',
  'certification-body': 'Certification body',
  'verification-org': 'Verification organisation',
};

export const providers = [
  { id: 'p1', name: 'Ironwood Freight', type: 'transport', location: 'Sagarpur, Sahyadri Pradesh', services: ['Road freight', 'Full-truck-load', 'Temperature-controlled trucks'] },
  { id: 'p2', name: 'Railbridge Cargo Partners', type: 'transport', location: 'Sundarpur, Paschim Pradesh', services: ['Rail freight', 'Container rail', 'Terminal handling'] },
  { id: 'p3', name: 'Samudrapur Coastal Shipping', type: 'transport', location: 'Samudrapur, Dakshin Pradesh', services: ['Coastal sea freight', 'Container feeder service'] },
  { id: 'p8', name: 'SkyBridge Air Freight', type: 'transport', location: 'Rajdhani Nagar', services: ['Air freight', 'Priority replenishment'] },
  { id: 'p7', name: 'Blue Harbour Logistics', type: 'logistics', location: 'Bandarpada, Nav Sagarpur', services: ['Bonded warehousing', 'Inventory and batch tracking', 'Last-mile dispatch'] },
  { id: 'p5', name: 'Textile Standards Council', type: 'certification-body', location: 'Sagarpur, Sahyadri Pradesh', services: ['GOTS certification', 'GRS certification', 'Annual surveillance audits'] },
  { id: 'p4', name: 'FairCheck India', type: 'verification-org', location: 'Rajdhani Nagar', services: ['Fair-trade verification', 'Labour audits', 'Supplier onboarding checks'] },
  { id: 'p6', name: 'GreenLedger Audit', type: 'verification-org', location: 'Haritpur, Madhya Kshetra', services: ['Chain-of-custody audits', 'ISO 14001 audits', 'Carbon data review'] },
];
