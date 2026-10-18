// Turns the frontend's seed files (read-only) into the sample product documents stored in MongoDB.
// Pure: no database access, so it can be tested without MongoDB.
import { products, productMaterials } from '../../../src/data/products.js';
import { stages, legs } from '../../../src/data/pipeline.js';

export function sampleProductDocs() {
  return products.map((p) => {
    const { id, ...fields } = p;
    return {
      _id: id,
      ...fields,
      ownerId: null,
      isSample: true,
      materialLines: productMaterials.filter((l) => l.productId === id).map((l) => ({ materialId: l.materialId, quantityKg: l.quantityKg })),
      stages: stages.filter((s) => s.productId === id).map((s) => ({
        id: s.id, order: s.order, stageName: s.stageName, location: s.location, organizationKind: s.organizationKind,
        organizationId: s.organizationId, date: s.date, durationDays: s.durationDays,
      })),
      legs: legs.filter((l) => l.productId === id).map((l) => ({
        id: l.id, fromStageId: l.fromStageId, toStageId: l.toStageId, distanceKm: l.distanceKm, mode: l.mode,
        providerId: l.providerId, ...(l.co2eOverride != null ? { co2eOverride: l.co2eOverride } : {}),
      })),
    };
  });
}
