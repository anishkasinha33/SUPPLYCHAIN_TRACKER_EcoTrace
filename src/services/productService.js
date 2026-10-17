// BACKEND: replace each body with a fetch() call, e.g. getAll -> GET /api/products.
import { loadRaw, readPayloads, writePayloads, seedProductIds } from './db.js';
import { buildGraph } from '../utils/graph.js';
import { delay } from './storage.js';
import { authService } from './authService.js';
import { DEMO_USER } from '../data/users.js';

export const productService = {
  /** Returns the full connected graph (products, suppliers, materials, providers). */
  async getGraph() {
    await delay(260);
    const business = authService.getSession()?.user || DEMO_USER;
    return buildGraph(loadRaw(), business);
  },

  /** Saves a created or edited product payload. */
  async save(payload) {
    await delay(500);
    const map = readPayloads();
    map[payload.product.id] = payload;
    if (!writePayloads(map)) throw new Error('Your browser blocked saving. Check that storage is enabled and try again.');
    return payload.product.id;
  },

  /** Removes a product the user created. Seed products can only be edited. */
  async remove(id) {
    await delay(300);
    if (seedProductIds.has(id)) throw new Error('Sample products cannot be deleted. You can edit them instead.');
    const map = readPayloads();
    delete map[id];
    writePayloads(map);
  },

  async resetDemoData() {
    await delay(300);
    writePayloads({});
  },
};

export const newProductId = () => `pr-${Date.now().toString(36)}`;
export const newTraceId = () => {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ECO-${a}-${String(new Date().getFullYear()).slice(2)}${String(Math.floor(Math.random() * 90) + 10)}`;
};

/** Builds the connected view of a not-yet-saved product (used by the form's review step). */
export function previewProduct(payload) {
  const raw = loadRaw();
  const id = payload.product.id;
  const merged = {
    ...raw,
    products: [...raw.products.filter((p) => p.id !== id), payload.product],
    productMaterials: [...raw.productMaterials.filter((l) => l.productId !== id), ...payload.materialLines.map((l) => ({ ...l, productId: id }))],
    stages: [...raw.stages.filter((s) => s.productId !== id), ...payload.stages],
    legs: [...raw.legs.filter((l) => l.productId !== id), ...payload.legs],
  };
  const business = authService.getSession()?.user || DEMO_USER;
  return buildGraph(merged, business).products.find((p) => p.id === id);
}
