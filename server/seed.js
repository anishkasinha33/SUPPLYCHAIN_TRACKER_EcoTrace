// Loads the frontend's seed data (src/data) into MongoDB, so there is one source of truth.
// `npm run seed` wipes and reloads everything; the server calls seedIfEmpty() on start.
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';
import { certifications } from '../src/data/certifications.js';
import { providers } from '../src/data/providers.js';
import { suppliers } from '../src/data/suppliers.js';
import { materials } from '../src/data/materials.js';
import { products, productMaterials } from '../src/data/products.js';
import { stages, legs } from '../src/data/pipeline.js';
import { DEMO_USER, DEMO_PASSWORD } from '../src/data/users.js';
import { connectDb } from './config/db.js';
import {
  Certification, Provider, Supplier, Material, Product, ProductMaterial, PipelineStage, TransportLeg, User,
} from './models/index.js';

const withId = (rows) => rows.map(({ id, ...r }) => ({ _id: id, ...r }));

async function replaceAll(Model, rows) {
  await Model.deleteMany({});
  if (rows.length) await Model.insertMany(rows);
}

export async function seedReference() {
  await replaceAll(Certification, withId(certifications));
  await replaceAll(Provider, withId(providers));
  await replaceAll(Supplier, withId(suppliers));
  await replaceAll(Material, withId(materials));
}

/** Restores the sample products and removes every user-created product. */
export async function seedProducts() {
  await replaceAll(Product, withId(products.map((p) => ({ ...p, isSeed: true }))));
  await replaceAll(ProductMaterial, productMaterials);
  await replaceAll(PipelineStage, withId(stages));
  await replaceAll(TransportLeg, withId(legs));
}

export async function seedDemoUser() {
  const { id, ...profile } = DEMO_USER;
  await User.updateOne(
    { _id: id },
    { $set: { ...profile, phoneDigits: profile.phone.replace(/\D/g, ''), passwordHash: await bcrypt.hash(DEMO_PASSWORD, 10) } },
    { upsert: true },
  );
}

export async function seedAll() {
  await seedReference();
  await seedProducts();
  await seedDemoUser();
}

export async function seedIfEmpty() {
  if (await Certification.estimatedDocumentCount()) return false;
  await seedAll();
  console.log('Empty database: loaded seed data.');
  return true;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await connectDb();
  await seedAll();
  console.log('Seed data loaded.');
  await mongoose.disconnect();
}
