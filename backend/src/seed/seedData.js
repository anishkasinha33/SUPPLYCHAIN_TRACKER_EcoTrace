// Reads the frontend's existing seed files (read-only) and loads them into MongoDB.
// Nothing under ../../../src is modified.
import { Certification, Material, Provider, Supplier } from '../models/Catalog.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { hashPassword } from '../services/passwords.js';
import { cloneSamplesForUser } from '../services/sampleService.js';
import { phoneKey } from '../utils/phone.js';
import { certifications } from '../../../src/data/certifications.js';
import { providers } from '../../../src/data/providers.js';
import { suppliers } from '../../../src/data/suppliers.js';
import { materials } from '../../../src/data/materials.js';
import { products } from '../../../src/data/products.js';
import { sampleProductDocs } from './sampleDocs.js';
import { supplierSdg } from '../../../src/data/sdgChecklist.js';
import { DEMO_USER, DEMO_PASSWORD } from '../../../src/data/users.js';

/** Replaces each row by id, so running the seed twice gives the same result. `seq` keeps the original order. */
async function upsertRows(Model, rows) {
  for (const [seq, row] of rows.entries()) {
    const { id, ...rest } = row;
    await Model.replaceOne({ _id: id }, { ...rest, seq }, { upsert: true });
  }
}

/** Catalogs plus the shared sample products. Never touches user accounts or their products. */
export async function seedReferenceData() {
  await upsertRows(Certification, certifications);
  await upsertRows(Provider, providers);
  await upsertRows(Supplier, suppliers.map((s) => ({ ...s, sdgChecks: supplierSdg(s.id).items.map((i) => i.pass) })));
  await upsertRows(Material, materials);

  const samples = sampleProductDocs();
  for (const doc of samples) {
    const { _id, ...rest } = doc;
    await Product.replaceOne({ _id }, rest, { upsert: true });
  }
  await Product.deleteMany({ isSample: true, _id: { $nin: samples.map((d) => d._id) } });

  return { suppliers: suppliers.length, materials: materials.length, providers: providers.length, certifications: certifications.length, sampleProducts: products.length };
}

/** The "Use demo account" login shown on the login page. Skipped if the account already exists. */
export async function seedDemoUser() {
  if (await User.exists({ _id: DEMO_USER.id })) return false;
  await User.create({
    _id: DEMO_USER.id, name: DEMO_USER.name, email: DEMO_USER.email, phone: DEMO_USER.phone, phoneKey: phoneKey(DEMO_USER.phone),
    businessName: DEMO_USER.businessName, industry: DEMO_USER.industry, location: DEMO_USER.location,
    passwordHash: await hashPassword(DEMO_PASSWORD),
  });
  await cloneSamplesForUser(DEMO_USER.id);
  return true;
}
