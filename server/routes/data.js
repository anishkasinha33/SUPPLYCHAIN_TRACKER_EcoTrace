// Read-only endpoints. The client joins these rows into its views in src/utils/graph.js.
import { Router } from 'express';
import {
  Certification, Provider, Supplier, Material, Product, ProductMaterial, PipelineStage, TransportLeg, toRow,
} from '../models/index.js';

const router = Router();

const rows = async (Model) => (await Model.find().lean()).map(toRow);

/** Everything the dashboard needs in one round trip, in the same shape as the old local db. */
router.get('/data', async (req, res) => {
  const [certifications, providers, suppliers, materials, products, productMaterials, stages, legs] = await Promise.all([
    rows(Certification), rows(Provider), rows(Supplier), rows(Material), rows(Product),
    ProductMaterial.find().select('-_id').lean(),
    PipelineStage.find().sort({ productId: 1, order: 1 }).lean().then((r) => r.map(toRow)),
    rows(TransportLeg),
  ]);
  res.json({ certifications, providers, suppliers, materials, products, productMaterials, stages, legs });
});

for (const [path, Model] of [['certifications', Certification], ['providers', Provider], ['suppliers', Supplier], ['materials', Material]]) {
  router.get(`/${path}`, async (req, res) => res.json(await rows(Model)));
}

export default router;
