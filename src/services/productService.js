// Products, suppliers, materials and providers come from the EcoTrace API (GET /api/graph and friends).
import { loadRaw, loadSampleRaw, emptyRaw } from './db.js';
import { buildGraph } from '../utils/graph.js';
import { api } from './api.js';
import { authService } from './authService.js';

let lastRaw = null; // the rows from the most recent load; the form's review step previews against them

export const productService = {
  /** Returns the full connected graph (products, suppliers, materials, providers). */
  async getGraph() {
    const session = authService.getSession();
    if (!session) {
      const { raw, business } = await loadSampleRaw(); // signed out: just the public sample
      lastRaw = raw;
      return buildGraph(raw, business);
    }
    const raw = await loadRaw();
    lastRaw = raw;
    return buildGraph(raw, session.user);
  },

  /** Saves a created or edited product payload. Returns the product id. */
  async save(payload) {
    const isEdit = !!lastRaw?.products.some((p) => p.id === payload.product.id);
    const body = { product: payload.product, materialLines: payload.materialLines, stages: payload.stages, legs: payload.legs };
    const data = isEdit
      ? await api(`/products/${encodeURIComponent(payload.product.id)}`, { method: 'PUT', body })
      : await api('/products', { method: 'POST', body });
    return data.id;
  },

  /** Removes one of the account's products. */
  async remove(id) {
    await api(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  /** Replaces the account's products with a fresh copy of the sample products. */
  async resetDemoData() {
    await api('/products/reset-demo', { method: 'POST' });
  },
};

// The server owns the real ids. These are placeholders the form uses until the product is saved;
// the server keeps the traceability id if it is well formed and free, and otherwise issues a new one.
export const newProductId = () => `pr-${Date.now().toString(36)}`;
export const newTraceId = () => {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ECO-${a}-${String(new Date().getFullYear()).slice(2)}${String(Math.floor(Math.random() * 90) + 10)}`;
};

/** Builds the connected view of a not-yet-saved product (used by the form's review step). */
export function previewProduct(payload) {
  const raw = lastRaw || emptyRaw();
  const id = payload.product.id;
  const merged = {
    ...raw,
    products: [...raw.products.filter((p) => p.id !== id), payload.product],
    productMaterials: [...raw.productMaterials.filter((l) => l.productId !== id), ...payload.materialLines.map((l) => ({ ...l, productId: id }))],
    stages: [...raw.stages.filter((s) => s.productId !== id), ...payload.stages],
    legs: [...raw.legs.filter((l) => l.productId !== id), ...payload.legs],
  };
  const business = authService.getSession()?.user || null;
  return buildGraph(merged, business).products.find((p) => p.id === id);
}
