// The frontend works with "raw rows" (see src/services/db.js and src/utils/graph.js):
// products, productMaterials, stages, legs, plus the four catalogs. These helpers produce that shape.
export const emptyRaw = () => ({
  certifications: [], providers: [], suppliers: [], materials: [],
  products: [], productMaterials: [], stages: [], legs: [],
});

/** Adds one stored product (lean document) to a raw-rows object, flattened the way the frontend expects. */
export function addProductRows(raw, p) {
  const productId = String(p._id);
  raw.products.push({
    id: productId, traceId: p.traceId, name: p.name, category: p.category, batchNumber: p.batchNumber,
    origin: p.origin, status: p.status, manufacturerId: p.manufacturerId, unitsInBatch: p.unitsInBatch,
    shipmentTonnes: p.shipmentTonnes, startDate: p.startDate, story: p.story ?? '',
  });
  for (const l of p.materialLines || []) raw.productMaterials.push({ productId, materialId: l.materialId, quantityKg: l.quantityKg });
  for (const s of p.stages || []) {
    raw.stages.push({
      id: s.id, productId, order: s.order, stageName: s.stageName, location: s.location,
      organizationKind: s.organizationKind, organizationId: s.organizationId, date: s.date, durationDays: s.durationDays,
    });
  }
  for (const l of p.legs || []) {
    raw.legs.push({
      id: l.id, productId, fromStageId: l.fromStageId, toStageId: l.toStageId, distanceKm: l.distanceKm,
      mode: l.mode, providerId: l.providerId, ...(l.co2eOverride != null ? { co2eOverride: l.co2eOverride } : {}),
    });
  }
}
