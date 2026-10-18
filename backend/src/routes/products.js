import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProduct, deleteProduct, updateProduct } from '../services/productService.js';
import { resetSamplesForUser } from '../services/sampleService.js';
import { bundleSchema } from '../validators/product.js';

const r = Router();
r.use(requireAuth);

r.post('/', validate(bundleSchema), async (req, res) => {
  const product = await createProduct(req.user._id, req.body);
  res.status(201).json({ data: { id: String(product._id), traceId: product.traceId } });
});

// Declared before "/:id" so "reset-demo" is never read as a product id.
r.post('/reset-demo', async (req, res) => {
  const count = await resetSamplesForUser(req.user._id);
  res.json({ data: { products: count } });
});

r.put('/:id', validate(bundleSchema), async (req, res) => {
  const product = await updateProduct(req.user._id, req.params.id, req.body);
  res.json({ data: { id: String(product._id), traceId: product.traceId } });
});

r.delete('/:id', async (req, res) => {
  await deleteProduct(req.user._id, req.params.id);
  res.json({ data: { ok: true } });
});

export default r;
