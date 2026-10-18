import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { bundle, createApp, models, request, setupDatabase, signedInAgent, teardownDatabase } from './helpers.js';

describe('products and the graph', () => {
  let app;
  before(async () => { await setupDatabase(); app = createApp(); });
  after(teardownDatabase);

  it('requires a login for every private endpoint', async () => {
    await request(app).get('/api/graph').expect(401);
    await request(app).post('/api/products').send(bundle('NO-LOGIN-1')).expect(401);
    await request(app).put('/api/products/pr-001').send(bundle('NO-LOGIN-1')).expect(401);
    await request(app).delete('/api/products/pr-001').expect(401);
    await request(app).post('/api/products/reset-demo').expect(401);
  });

  it('returns the raw-row shape the frontend expects', async () => {
    const { agent } = await signedInAgent(app);
    const { body } = await agent.get('/api/graph');
    const raw = body.data;
    for (const key of ['certifications', 'providers', 'suppliers', 'materials', 'products', 'productMaterials', 'stages', 'legs']) {
      assert.ok(Array.isArray(raw[key]), `${key} should be an array`);
    }
    assert.equal(raw.suppliers.length, 13);
    assert.equal(raw.materials.length, 10);
    assert.equal(raw.stages.length, 8 * 7);
    assert.ok(raw.stages.every((s) => s.productId && raw.products.some((p) => p.id === s.productId)));
    assert.equal(raw.products[0].ownerId, undefined);
    assert.equal(raw.products[0].isSample, undefined);
  });

  it('creates a product: owner comes from the login, ids from the server, extra fields are ignored', async () => {
    const { agent, user } = await signedInAgent(app);
    const payload = bundle('CREATE-1', { ownerId: 'u-someone-else', isSample: true, _id: 'hacked' });
    payload.product.ownerId = 'u-someone-else';
    const res = await agent.post('/api/products').send(payload);
    assert.equal(res.status, 201);
    assert.notEqual(res.body.data.id, 'pr-client');
    assert.match(res.body.data.traceId, /^ECO-[A-Z0-9]{4}-\d{4}$/);

    const stored = await models.Product.findById(res.body.data.id).lean();
    assert.equal(stored.ownerId, user.id);
    assert.equal(stored.isSample, false);
    assert.ok(stored.stages.every((s) => s.id.startsWith(`${res.body.data.id}-st`)));
    assert.equal(stored.legs[0].fromStageId, `${res.body.data.id}-st3`);

    const graph = (await agent.get('/api/graph')).body.data;
    assert.ok(graph.products.some((p) => p.id === res.body.data.id));
    assert.equal(graph.products.length, 9);
  });

  it('gives a new traceability id when the client-proposed one is already taken', async () => {
    const a = await signedInAgent(app);
    const b = await signedInAgent(app);
    const first = await a.agent.post('/api/products').send(bundle('TRACE-A1')).expect(201);
    const second = await b.agent.post('/api/products').send(bundle('TRACE-B1')).expect(201);
    assert.notEqual(first.body.data.traceId, second.body.data.traceId);
  });

  it('rejects unknown materials, suppliers and providers', async () => {
    const { agent } = await signedInAgent(app);
    const bad = bundle('BADREF-1');
    bad.materialLines[0].materialId = 'm999';
    const res = await agent.post('/api/products').send(bad);
    assert.equal(res.status, 400);
    assert.ok(res.body.error.fields.materialLines);

    const notAManufacturer = bundle('BADREF-2', { manufacturerId: 's1' }); // s1 supplies materials only
    assert.equal((await agent.post('/api/products').send(notAManufacturer)).status, 400);
  });

  it('rejects invalid input with field messages', async () => {
    const { agent } = await signedInAgent(app);
    const bad = bundle('x', { name: 'ab', status: 'shipped', unitsInBatch: -3 });
    const res = await agent.post('/api/products').send(bad);
    assert.equal(res.status, 400);
    assert.ok(res.body.error.fields['product.name']);
    assert.ok(res.body.error.fields['product.status']);
    assert.ok(res.body.error.fields['product.batchNumber']);
  });

  it('rejects legs that point at stages that do not exist', async () => {
    const { agent } = await signedInAgent(app);
    const bad = bundle('LEG-1');
    bad.legs[0].toStageId = 'nowhere';
    assert.equal((await agent.post('/api/products').send(bad)).status, 400);
  });

  it('refuses a duplicate batch number within one account, but allows it in another', async () => {
    const a = await signedInAgent(app);
    const b = await signedInAgent(app);
    await a.agent.post('/api/products').send(bundle('DUP-1')).expect(201);
    const dup = await a.agent.post('/api/products').send(bundle('DUP-1'));
    assert.equal(dup.status, 409);
    await b.agent.post('/api/products').send(bundle('DUP-1')).expect(201);
  });

  it('refuses a batch number that a copied sample product already uses', async () => {
    const { agent } = await signedInAgent(app);
    assert.equal((await agent.post('/api/products').send(bundle('RC-2608-A'))).status, 409);
  });

  it('updates a product and keeps its traceability id', async () => {
    const { agent } = await signedInAgent(app);
    const created = (await agent.post('/api/products').send(bundle('UPD-1')).expect(201)).body.data;
    const edit = bundle('UPD-1', { name: 'Renamed Tote', status: 'on-sale', traceId: 'ECO-ZZZZ-9999' });
    edit.product.id = created.id;
    const res = await agent.put(`/api/products/${created.id}`).send(edit);
    assert.equal(res.status, 200);
    assert.equal(res.body.data.traceId, created.traceId);
    const stored = await models.Product.findById(created.id).lean();
    assert.equal(stored.name, 'Renamed Tote');
    assert.equal(stored.status, 'on-sale');
  });

  it("keeps people out of each other's products (404, and never in the graph)", async () => {
    const a = await signedInAgent(app);
    const b = await signedInAgent(app);
    const created = (await a.agent.post('/api/products').send(bundle('PRIV-1')).expect(201)).body.data;

    assert.ok(!(await b.agent.get('/api/graph')).body.data.products.some((p) => p.id === created.id));
    assert.equal((await b.agent.put(`/api/products/${created.id}`).send(bundle('PRIV-1'))).status, 404);
    assert.equal((await b.agent.delete(`/api/products/${created.id}`)).status, 404);
    assert.ok(await models.Product.exists({ _id: created.id }), 'the product must still exist');
  });

  it('cannot edit or delete the shared sample templates', async () => {
    const { agent } = await signedInAgent(app);
    assert.equal((await agent.put('/api/products/pr-001').send(bundle('TPL-1'))).status, 404);
    assert.equal((await agent.delete('/api/products/pr-001')).status, 404);
    assert.ok(await models.Product.exists({ _id: 'pr-001', isSample: true }));
  });

  it('deletes a product', async () => {
    const { agent } = await signedInAgent(app);
    const created = (await agent.post('/api/products').send(bundle('DEL-1')).expect(201)).body.data;
    await agent.delete(`/api/products/${created.id}`).expect(200);
    await agent.delete(`/api/products/${created.id}`).expect(404);
  });

  it('reset-demo replaces the account products with a fresh copy of the samples', async () => {
    const { agent } = await signedInAgent(app);
    await agent.post('/api/products').send(bundle('RESET-1')).expect(201);
    assert.equal((await agent.get('/api/graph')).body.data.products.length, 9);
    await agent.post('/api/products/reset-demo').expect(200);
    const after = (await agent.get('/api/graph')).body.data.products;
    assert.equal(after.length, 8);
    assert.ok(!after.some((p) => p.batchNumber === 'RESET-1'));
  });

  it('refuses oversized request bodies', async () => {
    const { agent } = await signedInAgent(app);
    const huge = bundle('HUGE-1', { story: 'x'.repeat(150_000) });
    assert.equal((await agent.post('/api/products').send(huge)).status, 413);
  });
});
