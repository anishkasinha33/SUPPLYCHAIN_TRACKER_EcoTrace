// Raw, SQL-shaped rows from the API (GET /api/data). The last response is kept so the
// product form can preview an unsaved product synchronously.
import { products } from '../data/products.js';
import { api } from './api.js';

let lastRaw = null;

export async function fetchRaw() {
  lastRaw = await api('/data');
  return lastRaw;
}

export function cachedRaw() {
  if (!lastRaw) throw new Error('Data has not loaded yet.');
  return lastRaw;
}

// Sample products can be edited but not deleted (the API enforces this too).
export const seedProductIds = new Set(products.map((p) => p.id));
