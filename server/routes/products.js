import { Router } from 'express';
import { Product, ProductMaterial, PipelineStage, TransportLeg, Material, Supplier, toRow } from '../models/index.js';
import { HttpError } from '../middleware/errors.js';
import { requireAuth } from '../middleware/auth.js';
import { seedProducts } from '../seed.js';

const router = Router();
const strip = ({ id, ...rest }) => ({ _id: id, ...rest });

router.get('/', async (req, res) => {
  res.json((await Product.find().lean()).map(toRow));
});

router.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new HttpError(404, 'We could not find that product.');
  const [materialLines, stages, legs] = await Promise.all([
    ProductMaterial.find({ productId: product._id }).select('-_id').lean(),
    PipelineStage.find({ productId: product._id }).sort({ order: 1 }).lean(),
    TransportLeg.find({ productId: product._id }).lean(),
  ]);
  res.json({ product: toRow(product), materialLines, stages: stages.map(toRow), legs: legs.map(toRow) });
});

router.post('/reset', requireAuth, async (req, res) => {
  await seedProducts();
  res.status(204).end();
});

/** Creates or replaces a product with its material lines, stages and legs: { product, materialLines, stages, legs }. */
router.put('/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const { product, materialLines = [], stages = [], legs = [] } = req.body || {};
  if (!product || product.id !== id) throw new HttpError(400, 'The product id in the body must match the URL.');
  if (!Array.isArray(materialLines) || !materialLines.length) throw new HttpError(400, 'Add at least one material.');

  const existing = await Product.findById(id).lean();
  if (existing && !existing.isSeed && existing.ownerId && existing.ownerId !== req.userId) {
    throw new HttpError(403, 'You can only edit products you created.');
  }

  const materialIds = [...new Set(materialLines.map((l) => l.materialId))];
  const [found, manufacturer] = await Promise.all([
    Material.countDocuments({ _id: { $in: materialIds } }),
    product.manufacturerId ? Supplier.exists({ _id: product.manufacturerId }) : true,
  ]);
  if (found !== materialIds.length) throw new HttpError(400, 'One or more materials do not exist.');
  if (!manufacturer) throw new HttpError(400, 'That manufacturer does not exist.');

  // Validate everything before writing, so a bad payload never leaves a half-saved product.
  const productDoc = new Product({
    ...strip(product),
    isSeed: existing?.isSeed ?? false,
    ownerId: existing ? existing.ownerId : req.userId,
  });
  const lineDocs = materialLines.map((l) => new ProductMaterial({ productId: id, materialId: l.materialId, quantityKg: l.quantityKg }));
  const stageDocs = stages.map((s) => new PipelineStage({ ...strip(s), productId: id }));
  const legDocs = legs.map((l) => new TransportLeg({ ...strip(l), productId: id }));
  await Promise.all([productDoc, ...lineDocs, ...stageDocs, ...legDocs].map((d) => d.validate()));

  await Product.replaceOne({ _id: id }, productDoc.toObject(), { upsert: true });
  await Promise.all([ProductMaterial, PipelineStage, TransportLeg].map((M) => M.deleteMany({ productId: id })));
  await Promise.all([
    ProductMaterial.insertMany(lineDocs),
    PipelineStage.insertMany(stageDocs),
    TransportLeg.insertMany(legDocs),
  ]);
  res.status(existing ? 200 : 201).json({ id });
});

router.delete('/:id', requireAuth, async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) throw new HttpError(404, 'We could not find that product.');
  if (product.isSeed) throw new HttpError(400, 'Sample products cannot be deleted. You can edit them instead.');
  if (product.ownerId && product.ownerId !== req.userId) throw new HttpError(403, 'You can only delete products you created.');
  await Promise.all([
    Product.deleteOne({ _id: product._id }),
    ProductMaterial.deleteMany({ productId: product._id }),
    PipelineStage.deleteMany({ productId: product._id }),
    TransportLeg.deleteMany({ productId: product._id }),
  ]);
  res.status(204).end();
});

export default router;
