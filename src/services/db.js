// BACKEND: this file is the seam. Today it merges seed data with products the user created
// in this browser. Later, each function below becomes a fetch() to the Node.js API.
import { certifications } from '../data/certifications.js';
import { providers } from '../data/providers.js';
import { suppliers } from '../data/suppliers.js';
import { materials } from '../data/materials.js';
import { products, productMaterials } from '../data/products.js';
import { stages, legs } from '../data/pipeline.js';
import { storage } from './storage.js';

const KEY = 'sct.productPayloads';

/** Payloads the user created or edited: { [productId]: { product, materialLines, stages, legs } } */
export const readPayloads = () => storage.get(KEY, {});
export const writePayloads = (map) => storage.set(KEY, map);

export function loadRaw() {
  const payloads = readPayloads();
  const ids = new Set(Object.keys(payloads));
  const keep = (row) => !ids.has(row.productId);
  const created = Object.values(payloads);
  return {
    certifications,
    providers,
    suppliers,
    materials,
    products: [...products.filter((p) => !ids.has(p.id)), ...created.map((c) => c.product)],
    productMaterials: [...productMaterials.filter(keep), ...created.flatMap((c) => c.materialLines.map((l) => ({ ...l, productId: c.product.id })))],
    stages: [...stages.filter(keep), ...created.flatMap((c) => c.stages)],
    legs: [...legs.filter(keep), ...created.flatMap((c) => c.legs)],
  };
}

export const seedProductIds = new Set(products.map((p) => p.id));
