import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Product } from '../models/Product.js';
import { loadAllCatalogs } from '../services/catalogService.js';
import { addProductRows, emptyRaw } from '../services/rawGraph.js';

const r = Router();

// Everything the app needs for the signed-in account, in the same "raw rows" shape the frontend used with local data.
r.get('/', requireAuth, async (req, res) => {
  const [products, catalogs] = await Promise.all([
    Product.find({ ownerId: req.user._id }).sort({ createdAt: 1, _id: 1 }).lean(),
    loadAllCatalogs(),
  ]);
  const raw = { ...emptyRaw(), ...catalogs };
  products.forEach((p) => addProductRows(raw, p));
  res.json({ data: raw });
});

export default r;
