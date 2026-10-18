// Test helpers. NODE_ENV is set BEFORE the app is imported, so the app uses MONGODB_URI_TEST.
process.env.NODE_ENV = 'test';

const { connectDb, disconnectDb } = await import('../src/config/db.js');
const { createApp } = await import('../src/app.js');
const { models } = await import('../src/models/index.js');
const { seedReferenceData } = await import('../src/seed/seedData.js');
const { default: request } = await import('supertest');

export { request, createApp, models };

/** Connects to the *_test database, empties it, and loads the catalogs and sample products. */
export async function setupDatabase() {
  await connectDb();
  await Promise.all(Object.values(models).map((m) => m.deleteMany({})));
  await seedReferenceData();
}

export async function teardownDatabase() {
  await Promise.all(Object.values(models).map((m) => m.deleteMany({})));
  await disconnectDb();
}

let counter = 0;
export const newAccount = (over = {}) => {
  counter += 1;
  const n = `${Date.now()}${counter}`.slice(-9);
  return {
    name: 'Test Owner', businessName: `Test Business ${counter}`, email: `owner${n}@example.com`,
    phone: `+91 98${n.slice(-8)}`, password: 'correct-horse-9', ...over,
  };
};

/** A logged-in supertest agent (it keeps the session cookie). */
export async function signedInAgent(app, over = {}) {
  const account = newAccount(over);
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/signup').send(account);
  if (res.status !== 201) throw new Error(`signup failed in test helper: ${res.status} ${JSON.stringify(res.body)}`);
  return { agent, account, user: res.body.data.user };
}

/** A valid product bundle in the exact shape the 5-step form sends. */
export function bundle(batchNumber, over = {}) {
  const id = 'pr-client';
  const stage = (order, stageName, location, organizationKind, organizationId, date) => ({
    id: `${id}-st${order}`, productId: id, order, stageName, location, organizationKind, organizationId, date, durationDays: 5,
  });
  return {
    product: {
      id, traceId: 'ECO-TEST-2601', name: 'Test Tote Bag', category: 'Bags', batchNumber, origin: 'Sundarpur, India',
      status: 'planned', manufacturerId: 's10', unitsInBatch: 100, shipmentTonnes: 0.5, startDate: '2026-10-01',
      story: 'A product made for testing.', ...over,
    },
    materialLines: [{ materialId: 'm1', quantityKg: 100 }, { materialId: 'm10', quantityKg: 5 }],
    stages: [
      stage(0, 'source', 'Sundarpur', 'supplier', 's1', '2026-09-15'),
      stage(1, 'supplier', 'Nandipur', 'supplier', 's1', '2026-09-20'),
      stage(2, 'manufacturing', 'Sundarpur', 'supplier', 's10', '2026-10-01'),
      stage(3, 'transportation', 'Sundarpur Rail Terminal', 'provider', 'p2', '2026-10-11'),
      stage(4, 'warehouse', 'Bandarpada, Nav Sagarpur', 'provider', 'p7', '2026-10-14'),
    ],
    legs: [{ id: `${id}-lg0`, productId: id, fromStageId: `${id}-st3`, toStageId: `${id}-st4`, distanceKm: 525, mode: 'rail', providerId: 'p2' }],
  };
}
