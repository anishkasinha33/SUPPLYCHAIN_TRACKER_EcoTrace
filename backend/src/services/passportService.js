import { SAMPLE_BUSINESS } from '../config/sample.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { loadPublicCatalogsFor } from './catalogService.js';
import { addProductRows, emptyRaw } from './rawGraph.js';

async function rawFor(products) {
  const raw = emptyRaw();
  products.forEach((p) => addProductRows(raw, p));
  Object.assign(raw, await loadPublicCatalogsFor(products));
  return raw;
}

/** Public data for one product passport. Nothing about the owner except the business name and location. */
export async function getPassport(traceId) {
  const product = await Product.findOne({ traceId }).lean();
  if (!product) return null;
  let business = SAMPLE_BUSINESS;
  if (!product.isSample) {
    const owner = await User.findById(product.ownerId).select('businessName location').lean();
    business = { businessName: owner?.businessName || 'This business', location: owner?.location || '' };
  }
  return { raw: await rawFor([product]), business };
}

/** The sample products shown to logged-out visitors on the landing page. */
export async function getSampleGraph() {
  const products = await Product.find({ isSample: true }).sort({ _id: 1 }).lean();
  return { raw: await rawFor(products), business: SAMPLE_BUSINESS };
}
