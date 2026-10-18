import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { bundle, createApp, request, setupDatabase, signedInAgent, teardownDatabase } from './helpers.js';

describe('public endpoints', () => {
  let app;
  before(async () => { await setupDatabase(); app = createApp(); });
  after(teardownDatabase);

  it('serves a passport without login and leaks nothing private', async () => {
    const { agent, account } = await signedInAgent(app);
    const created = (await agent.post('/api/products').send(bundle('PUB-1')).expect(201)).body.data;

    const res = await request(app).get(`/api/public/passports/${created.traceId.toLowerCase()}`);
    assert.equal(res.status, 200);
    const text = JSON.stringify(res.body);
    assert.equal(res.body.data.business.businessName, account.businessName);
    assert.equal(res.body.data.raw.products.length, 1);
    for (const secret of [account.email, account.phone, 'ownerId', 'passwordHash', 'isSample', '"rating"', 'sdgChecks', 'needs-review']) {
      assert.ok(!text.includes(secret), `public passport must not contain ${secret}`);
    }
    assert.ok(res.body.data.raw.suppliers.length > 0);
    assert.ok(res.body.data.raw.suppliers.every((s) => ['verified', 'pending'].includes(s.verificationStatus)));
  });

  it('returns 404 for unknown or malformed traceability ids', async () => {
    await request(app).get('/api/public/passports/ECO-NOPE-0000').expect(404);
    await request(app).get('/api/public/passports/not-an-id').expect(404);
    await request(app).get('/api/public/passports/%24ne').expect(404);
  });

  it('serves the sample passport used by the landing page', async () => {
    const res = await request(app).get('/api/public/passports/ECO-7K4M-2610');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.raw.products[0].id, 'pr-001');
    assert.equal(res.body.data.business.businessName, 'Kora & Kin Studio');
  });

  it('serves the sample graph to logged-out visitors', async () => {
    const res = await request(app).get('/api/public/sample');
    assert.equal(res.status, 200);
    assert.equal(res.body.data.raw.products.length, 8);
    assert.ok(res.body.data.raw.products.some((p) => p.id === 'pr-001'));
    assert.ok(!JSON.stringify(res.body).includes('"rating"'));
  });

  it('keeps the health check public and the unknown routes JSON', async () => {
    const health = await request(app).get('/api/health');
    assert.equal(health.status, 200);
    assert.equal(health.body.data.database, 'up');
    const missing = await request(app).get('/api/does-not-exist');
    assert.equal(missing.status, 404);
    assert.ok(missing.body.error.message);
  });
});
