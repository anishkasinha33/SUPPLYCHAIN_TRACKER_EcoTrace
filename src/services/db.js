// BACKEND seam: raw rows now come from the EcoTrace API (see ./api.js and /backend) instead of local seed data.
import { api } from './api.js';

export const emptyRaw = () => ({
  certifications: [], providers: [], suppliers: [], materials: [],
  products: [], productMaterials: [], stages: [], legs: [],
});

/** The signed-in account's products plus the catalogs, as { products, productMaterials, stages, legs, ... }. */
export const loadRaw = () => api('/graph');

/** The sample product shown to visitors who are not signed in (landing page). */
export const loadSampleRaw = () => api('/public/sample');

// Sample products are now copied into every account, so every product can be deleted.
// Kept (empty) because ProductDetailsPage imports it.
export const seedProductIds = new Set();
