// Products are stored in MongoDB through the Express API (server/routes/products.js).
import { fetchRaw, cachedRaw } from './db.js';
import { buildGraph } from '../utils/graph.js';
import { api } from './api.js';
import { authService } from './authService.js';
import { DEMO_USER } from '../data/users.js';

const business = () => authService.getSession()?.user || DEMO_USER;

export const productService = {
  /** Returns the full connected graph (products, suppliers, materials, providers). */
  async getGraph() {
    return buildGraph(await fetchRaw(), business());
  },

  /** Saves a created or edited product payload. */
  async save(payload) {
    const { id } = await api(`/products/${encodeURIComponent(payload.product.id)}`, { method: 'PUT', body: payload });
    return id;
  },

  /** Removes a product the user created. Seed products can only be edited (the API enforces this). */
  async remove(id) {
    await api(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async resetDemoData() {
    await api('/products/reset', { method: 'POST' });
  },
};

export const newProductId = () => `pr-${Date.now().toString(36)}`;
export const newTraceId = () => {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ECO-${a}-${String(new Date().getFullYear()).slice(2)}${String(Math.floor(Math.random() * 90) + 10)}`;
};

/** Builds the connected view of a not-yet-saved product (used by the form's review step). */
export function previewProduct(payload) {
  const raw = cachedRaw();
  const id = payload.product.id;
  const merged = {
    ...raw,
    products: [...raw.products.filter((p) => p.id !== id), payload.product],
    productMaterials: [...raw.productMaterials.filter((l) => l.productId !== id), ...payload.materialLines.map((l) => ({ ...l, productId: id }))],
    stages: [...raw.stages.filter((s) => s.productId !== id), ...payload.stages],
    legs: [...raw.legs.filter((l) => l.productId !== id), ...payload.legs],
  };
  return buildGraph(merged, business()).products.find((p) => p.id === id);
}
