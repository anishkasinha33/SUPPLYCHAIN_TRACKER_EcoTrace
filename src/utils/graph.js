// Turns raw, SQL-shaped rows into the connected views the interface needs
// (product -> materials -> suppliers -> stages -> legs -> sustainability).
// BACKEND: with a real API this joining would move into SQL views or API endpoints.
import { withShares, sumCo2e } from './carbon.js';
import { computeEcoScore, TIER_SCORE } from './sustainability.js';
import { supplierSdg } from '../data/sdgChecklist.js';

const unique = (arr) => [...new Set(arr)];
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);

export function buildGraph(raw, business) {
  const certById = Object.fromEntries(raw.certifications.map((c) => [c.id, c]));
  const providerById = Object.fromEntries(raw.providers.map((p) => [p.id, p]));
  const supplierById = Object.fromEntries(raw.suppliers.map((s) => [s.id, s]));
  const materialRaw = Object.fromEntries(raw.materials.map((m) => [m.id, m]));

  const certsFor = (ids) => ids.map((id) => certById[id]).filter(Boolean);
  const materialView = (m) => ({ ...m, supplier: supplierById[m.supplierId], certifications: certsFor(m.certificationIds) });

  const resolveOrg = (kind, id) => {
    if (kind === 'supplier') return { ...supplierById[id], href: `/suppliers/${id}` };
    if (kind === 'provider') return { ...providerById[id], href: `/providers/${id}` };
    return { id: 'biz', name: business?.businessName || 'Your business', location: business?.location || '', href: null };
  };

  const products = raw.products.map((p) => {
    const lines = raw.productMaterials
      .filter((l) => l.productId === p.id && materialRaw[l.materialId])
      .map((l) => ({ ...materialView(materialRaw[l.materialId]), quantityKg: l.quantityKg }));
    const manufacturer = supplierById[p.manufacturerId];
    const supplierIds = unique([...lines.map((l) => l.supplierId), p.manufacturerId].filter(Boolean));
    const suppliers = supplierIds.map((id) => supplierById[id]).filter(Boolean);

    const stageRows = raw.stages.filter((s) => s.productId === p.id).sort((a, b) => a.order - b.order);
    const legsWithShares = withShares(raw.legs.filter((l) => l.productId === p.id), p.shipmentTonnes);
    const legs = legsWithShares.map((l) => {
      const from = stageRows.find((s) => s.id === l.fromStageId);
      const to = stageRows.find((s) => s.id === l.toStageId);
      return { ...l, from, to, provider: providerById[l.providerId] };
    });

    const totalKg = sum(lines, (l) => l.quantityKg) || 1;
    const materialsCo2e = sum(lines, (l) => l.quantityKg * l.co2ePerKg);
    const transportCo2e = sumCo2e(legs);
    const recycledPct = sum(lines, (l) => l.quantityKg * l.recycledPercentage) / totalKg;
    const fairTradePct = (sum(lines.filter((l) => l.fairTrade), (l) => l.quantityKg) / totalKg) * 100;
    const verifiedSupplierPct = (suppliers.filter((s) => s.verificationStatus === 'verified').length / (suppliers.length || 1)) * 100;
    const fairLaborPct = (suppliers.filter((s) => s.fairLabor === 'certified').length / (suppliers.length || 1)) * 100;
    const materialTierScore = sum(lines, (l) => l.quantityKg * TIER_SCORE[l.tier]) / totalKg;
    const wavg = (f) => sum(lines, (l) => l.quantityKg * (l[f] ?? 0)) / totalKg;
    const certifiedPct = (sum(lines.filter((l) => l.certificationIds.length > 0), (l) => l.quantityKg) / totalKg) * 100;
    const eco = computeEcoScore({
      materialCo2ePerKg: materialsCo2e / totalKg,
      waterLPerKg: wavg('waterLPerKg'),
      endOfLifePct: wavg('endOfLifePct'),
      certifiedPct,
      stagesRecorded: Math.min(stageRows.length, 7),
      recycledPct,
      transportKgPerTonne: transportCo2e / (p.shipmentTonnes || 1),
      verifiedSupplierPct,
      fairLaborPct,
      materialTierScore,
    });

    const order = ['planned', 'in-production', 'in-transit', 'in-warehouse', 'on-sale'];
    const target = { planned: null, 'in-production': 'manufacturing', 'in-transit': 'transportation', 'in-warehouse': 'warehouse', 'on-sale': null }[p.status];
    const targetIndex = Math.max(-1, stageRows.findIndex((s) => s.stageName === target));
    const stages = stageRows.map((s, i) => ({
      ...s,
      organization: resolveOrg(s.organizationKind, s.organizationId),
      status: p.status === 'on-sale' || i < targetIndex ? 'complete' : i === targetIndex ? 'in-progress' : 'upcoming',
      outboundLegs: legs.filter((l) => l.fromStageId === s.id),
      materials: ['source', 'supplier', 'processing', 'manufacturing'].includes(s.stageName) ? lines : [],
    }));

    const worst = suppliers.some((s) => s.verificationStatus === 'needs-review')
      ? 'needs-review'
      : suppliers.some((s) => s.verificationStatus === 'pending') ? 'pending' : 'verified';

    return {
      ...p,
      statusOrder: order.indexOf(p.status),
      materials: lines,
      suppliers,
      manufacturer,
      stages,
      legs,
      recycledPct,
      fairTradePct,
      fairTradeStatus: fairTradePct >= 90 ? 'Fair trade throughout' : fairTradePct > 0 ? 'Partly fair trade' : 'Not fair trade',
      verifiedSupplierPct,
      fairLaborPct,
      carbon: { materialsKg: materialsCo2e, transportKg: transportCo2e, totalKg: materialsCo2e + transportCo2e, perUnitKg: (materialsCo2e + transportCo2e) / (p.unitsInBatch || 1) },
      eco,
      ecoScore: eco.score,
      sustainabilityStatus: eco.band.label,
      supplierStatus: worst,
    };
  });

  const suppliers = raw.suppliers.map((s) => {
    const ownMaterials = raw.materials.filter((m) => m.supplierId === s.id).map(materialView);
    const usedIn = products.filter((p) => p.suppliers.some((x) => x.id === s.id));
    const certIds = unique(ownMaterials.flatMap((m) => m.certificationIds));
    return { ...s, sdg: supplierSdg(s.id), materials: ownMaterials, products: usedIn, certifications: certsFor(certIds) };
  });

  const materials = raw.materials.map((m) => ({
    ...materialView(m),
    products: products.filter((p) => p.materials.some((l) => l.id === m.id)),
    totalKg: sum(raw.productMaterials.filter((l) => l.materialId === m.id), (l) => l.quantityKg),
  }));

  const providers = raw.providers.map((p) => {
    const usedLegs = products.flatMap((pr) => pr.legs.filter((l) => l.providerId === p.id).map((l) => ({ ...l, product: pr })));
    const usedStages = products.flatMap((pr) => pr.stages.filter((s) => s.organizationKind === 'provider' && s.organizationId === p.id).map((s) => ({ ...s, product: pr })));
    const issued = raw.certifications.filter((c) => c.issuerProviderId === p.id);
    const products_ = unique([...usedLegs.map((l) => l.product.id), ...usedStages.map((s) => s.product.id)]).map((id) => products.find((x) => x.id === id));
    return { ...p, legs: usedLegs, stages: usedStages, certificationsIssued: issued, products: products_ };
  });

  return { products, suppliers, materials, providers, certifications: raw.certifications, maps: { supplierById, providerById, materialRaw, certById } };
}

/** Portfolio-wide numbers for the dashboard and sustainability pages. */
export function portfolioStats(graph) {
  const { products, suppliers, materials } = graph;
  const n = products.length || 1;
  const usedSuppliers = suppliers.filter((s) => s.products.length > 0);
  const avgEco = sum(products, (p) => p.ecoScore) / n;
  const totalKg = sum(products, (p) => sum(p.materials, (l) => l.quantityKg)) || 1;
  const recycledPct = sum(products, (p) => sum(p.materials, (l) => l.quantityKg * l.recycledPercentage)) / totalKg;
  const fairTradePct = (sum(products, (p) => sum(p.materials.filter((l) => l.fairTrade), (l) => l.quantityKg)) / totalKg) * 100;
  const transportKg = sum(products, (p) => p.carbon.transportKg);
  const materialsKg = sum(products, (p) => p.carbon.materialsKg);
  const verified = usedSuppliers.filter((s) => s.verificationStatus === 'verified').length;
  const fairCertified = usedSuppliers.filter((s) => s.fairLabor === 'certified').length;
  const certifiedMaterials = materials.filter((m) => m.certifications.length > 0).length;
  const factorAvg = (key) => sum(products, (p) => (p.eco.factors.find((f) => f.key === key)?.ratio ?? 0)) / n;
  return {
    productCount: products.length,
    supplierCount: usedSuppliers.length,
    materialCount: materials.length,
    avgEco, recycledPct, fairTradePct, transportKg, materialsKg,
    totalCarbonKg: transportKg + materialsKg,
    avgCarbonKg: (transportKg + materialsKg) / n,
    verified, fairCertified, certifiedMaterials,
    verifiedPct: (verified / (usedSuppliers.length || 1)) * 100,
    fairPct: (fairCertified / (usedSuppliers.length || 1)) * 100,
    certCoveragePct: (certifiedMaterials / (materials.length || 1)) * 100,
    needsAttention: usedSuppliers.filter((s) => s.verificationStatus !== 'verified').length,
    factorAvg,
  };
}
