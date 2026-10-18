import { Product } from '../models/Product.js';
import { generateTraceId, newId } from '../utils/ids.js';
import { remapIds } from '../utils/remap.js';

/** Builds fresh, account-owned copies of the shared sample products (new ids, new traceability ids). */
async function buildSampleCopies(userId) {
  const templates = await Product.find({ isSample: true }).sort({ _id: 1 }).lean();
  const taken = new Set();
  const base = Date.now();
  const docs = [];
  for (const [i, t] of templates.entries()) {
    const _id = newId('pr');
    let traceId;
    do {
      traceId = generateTraceId();
    } while (taken.has(traceId) || (await Product.exists({ traceId })));
    taken.add(traceId);
    const { stages, legs } = remapIds({ stages: t.stages, legs: t.legs }, _id);
    docs.push({
      _id, ownerId: userId, isSample: false, traceId,
      name: t.name, category: t.category, batchNumber: t.batchNumber, origin: t.origin, status: t.status,
      manufacturerId: t.manufacturerId, unitsInBatch: t.unitsInBatch, shipmentTonnes: t.shipmentTonnes,
      startDate: t.startDate, story: t.story,
      materialLines: t.materialLines.map((l) => ({ materialId: l.materialId, quantityKg: l.quantityKg })),
      stages, legs,
      createdAt: new Date(base + i), // keeps the sample products in their original order
    });
  }
  return docs;
}

export async function cloneSamplesForUser(userId) {
  const docs = await buildSampleCopies(userId);
  if (docs.length) await Product.insertMany(docs);
  return docs.length;
}

/** "Reset demo data": the account's products are replaced by a fresh copy of the samples. */
export async function resetSamplesForUser(userId) {
  const docs = await buildSampleCopies(userId); // build first, so a failure here deletes nothing
  await Product.deleteMany({ ownerId: userId });
  if (docs.length) await Product.insertMany(docs);
  return docs.length;
}
