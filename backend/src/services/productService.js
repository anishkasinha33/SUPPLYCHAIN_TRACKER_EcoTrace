import { Material, Provider, Supplier } from '../models/Catalog.js';
import { Product } from '../models/Product.js';
import { AppError, isDuplicateKey } from '../utils/errors.js';
import { generateTraceId, newId, TRACE_ID_PATTERN } from '../utils/ids.js';
import { remapIds } from '../utils/remap.js';

const fieldsOf = (p) => ({
  name: p.name, category: p.category, batchNumber: p.batchNumber, origin: p.origin, status: p.status,
  manufacturerId: p.manufacturerId, unitsInBatch: p.unitsInBatch, shipmentTonnes: p.shipmentTonnes,
  startDate: p.startDate, story: p.story ?? '',
});

/** Every material, supplier and provider a product points at must exist in the catalog. */
export async function assertReferences({ product, materialLines, stages, legs }) {
  const problems = {};
  const check = async (Model, ids, key, label, extra = {}) => {
    const wanted = [...new Set(ids)];
    if (!wanted.length) return;
    const found = new Set(await Model.distinct('_id', { _id: { $in: wanted }, ...extra }));
    const missing = wanted.filter((i) => !found.has(i));
    if (missing.length) problems[key] = `Unknown ${label}: ${missing.join(', ')}.`;
  };
  await Promise.all([
    check(Material, materialLines.map((l) => l.materialId), 'materialLines', 'material'),
    check(Supplier, [product.manufacturerId], 'product.manufacturerId', 'manufacturer', { type: 'manufacturer' }),
    check(Supplier, stages.filter((s) => s.organizationKind === 'supplier').map((s) => s.organizationId), 'stages', 'supplier'),
    check(Provider, stages.filter((s) => s.organizationKind === 'provider').map((s) => s.organizationId), 'stages.provider', 'provider'),
    check(Provider, legs.map((l) => l.providerId), 'legs', 'provider'),
  ]);
  if (Object.keys(problems).length) throw new AppError(400, 'Some linked items do not exist.', problems);
}

function rethrowDuplicate(err) {
  if (isDuplicateKey(err) && err.keyPattern?.batchNumber) {
    throw new AppError(409, 'You already have a product with that batch number.', {
      'product.batchNumber': 'This batch number is already used by one of your products.',
    });
  }
  throw err;
}

export async function createProduct(userId, bundle) {
  await assertReferences(bundle);
  const _id = newId('pr');
  const { stages, legs } = remapIds(bundle, _id);
  const wanted = bundle.product.traceId;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    // Keep the id the form already showed the user if it is well formed and free; otherwise make a new one.
    const traceId = attempt === 0 && wanted && TRACE_ID_PATTERN.test(wanted) ? wanted : generateTraceId();
    try {
      return await Product.create({
        _id, ownerId: userId, isSample: false, traceId, ...fieldsOf(bundle.product),
        materialLines: bundle.materialLines.map((l) => ({ materialId: l.materialId, quantityKg: l.quantityKg })),
        stages, legs,
      });
    } catch (err) {
      if (isDuplicateKey(err) && err.keyPattern?.traceId) continue; // unlucky collision: try another id
      rethrowDuplicate(err);
    }
  }
  throw new AppError(500, 'Could not create a unique traceability id. Please try again.');
}

export async function updateProduct(userId, id, bundle) {
  // The owner comes from the login, never from the request, so other people's products look like "not found".
  const doc = await Product.findOne({ _id: id, ownerId: userId });
  if (!doc) throw new AppError(404, 'Product not found.');
  await assertReferences(bundle);
  const { stages, legs } = remapIds(bundle, doc._id);
  doc.set({
    ...fieldsOf(bundle.product),
    materialLines: bundle.materialLines.map((l) => ({ materialId: l.materialId, quantityKg: l.quantityKg })),
    stages, legs,
  });
  try {
    await doc.save();
  } catch (err) {
    rethrowDuplicate(err);
  }
  return doc;
}

export async function deleteProduct(userId, id) {
  const result = await Product.deleteOne({ _id: id, ownerId: userId });
  if (result.deletedCount === 0) throw new AppError(404, 'Product not found.');
}
