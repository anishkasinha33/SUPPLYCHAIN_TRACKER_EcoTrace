import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { createApp, models, newAccount, request, setupDatabase, signedInAgent, teardownDatabase } from './helpers.js';

const app = () => createApp();

describe('authentication', () => {
  before(setupDatabase);
  after(teardownDatabase);

  it('signs up, sets an HttpOnly cookie, never returns the password hash, and copies the 8 sample products', async () => {
    const agent = request.agent(app());
    const res = await agent.post('/api/auth/signup').send(newAccount());
    assert.equal(res.status, 201);
    assert.equal(res.body.data.user.passwordHash, undefined);
    assert.equal(res.body.data.user.phoneKey, undefined);
    assert.match(res.headers['set-cookie'][0], /ecotrace_sid=/);
    assert.match(res.headers['set-cookie'][0], /HttpOnly/i);
    assert.match(res.headers['set-cookie'][0], /SameSite=Lax/i);

    const graph = await agent.get('/api/graph');
    assert.equal(graph.status, 200);
    assert.equal(graph.body.data.products.length, 8);
    assert.ok(graph.body.data.products.every((p) => p.id !== 'pr-001'), 'copies must have new ids');
  });

  it('stores only a hash of the password and of the session token', async () => {
    const { account } = await signedInAgent(app());
    const user = await models.User.findOne({ email: account.email }).select('+passwordHash').lean();
    assert.notEqual(user.passwordHash, account.password);
    assert.match(user.passwordHash, /^\$2[aby]\$/);
    const sessions = await models.Session.find({ userId: user._id }).lean();
    assert.equal(sessions.length, 1);
    assert.match(sessions[0].tokenHash, /^[0-9a-f]{64}$/);
  });

  it('rejects a duplicate email with 409', async () => {
    const account = newAccount();
    await request(app()).post('/api/auth/signup').send(account).expect(201);
    const again = await request(app()).post('/api/auth/signup').send({ ...account, phone: '+91 90000 11111' });
    assert.equal(again.status, 409);
  });

  it('rejects a duplicate phone number with 409', async () => {
    const account = newAccount();
    await request(app()).post('/api/auth/signup').send(account).expect(201);
    const again = await request(app()).post('/api/auth/signup').send(newAccount({ phone: account.phone }));
    assert.equal(again.status, 409);
  });

  it('rejects invalid sign-up details with field messages', async () => {
    const res = await request(app()).post('/api/auth/signup').send(newAccount({ password: 'short', email: 'nope' }));
    assert.equal(res.status, 400);
    assert.ok(res.body.error.fields.password);
    assert.ok(res.body.error.fields.email);
  });

  it('logs in by email and by phone, and gives the same error for a wrong password and an unknown account', async () => {
    const account = newAccount();
    await request(app()).post('/api/auth/signup').send(account).expect(201);

    await request(app()).post('/api/auth/login').send({ identifier: account.email.toUpperCase(), password: account.password }).expect(200);
    await request(app()).post('/api/auth/login').send({ identifier: account.phone, password: account.password }).expect(200);

    const wrong = await request(app()).post('/api/auth/login').send({ identifier: account.email, password: 'wrong-password' });
    const unknown = await request(app()).post('/api/auth/login').send({ identifier: 'nobody@example.com', password: 'whatever123' });
    assert.equal(wrong.status, 401);
    assert.equal(unknown.status, 401);
    assert.equal(wrong.body.error.message, unknown.body.error.message);
  });

  it('refuses NoSQL operator objects in the login form', async () => {
    const res = await request(app()).post('/api/auth/login').send({ identifier: { $ne: null }, password: { $ne: null } });
    assert.equal(res.status, 400);
  });

  it('reports anonymous visitors as user:null and signed-in users as themselves', async () => {
    const anon = await request(app()).get('/api/auth/me');
    assert.equal(anon.status, 200);
    assert.equal(anon.body.data.user, null);

    const { agent, account } = await signedInAgent(app());
    const me = await agent.get('/api/auth/me');
    assert.equal(me.body.data.user.email, account.email);
  });

  it('logout invalidates the session on the server, not just in the browser', async () => {
    const signup = await request(app()).post('/api/auth/signup').send(newAccount());
    const raw = signup.headers['set-cookie'][0].split(';')[0]; // "ecotrace_sid=..."
    await request(app()).get('/api/graph').set('Cookie', raw).expect(200);
    await request(app()).post('/api/auth/logout').set('Cookie', raw).expect(200);
    await request(app()).get('/api/graph').set('Cookie', raw).expect(401); // replaying the old cookie must fail
  });

  it('rejects expired sessions', async () => {
    const account = newAccount();
    const signup = await request(app()).post('/api/auth/signup').send(account);
    const raw = signup.headers['set-cookie'][0].split(';')[0];
    await models.Session.updateMany({}, { $set: { expiresAt: new Date(Date.now() - 1000) } });
    await request(app()).get('/api/graph').set('Cookie', raw).expect(401);
  });

  it('rate-limits repeated login attempts', async () => {
    const limited = createApp({ limits: { login: 3 } });
    let last;
    for (let i = 0; i < 4; i += 1) {
      last = await request(limited).post('/api/auth/login').send({ identifier: 'a@b.co', password: 'password1' });
    }
    assert.equal(last.status, 429);
  });

  it('updates only whitelisted profile fields and refuses a taken email', async () => {
    const first = await signedInAgent(app());
    const second = await signedInAgent(app());

    const ok = await first.agent.patch('/api/auth/profile').send({ businessName: 'Renamed Studio', role: 'admin', passwordHash: 'x' });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.data.user.businessName, 'Renamed Studio');
    assert.equal(ok.body.data.user.role, undefined);
    const stored = await models.User.findById(first.user.id).select('+passwordHash').lean();
    assert.notEqual(stored.passwordHash, 'x');
    assert.equal(stored.role, undefined);

    const clash = await first.agent.patch('/api/auth/profile').send({ email: second.account.email });
    assert.equal(clash.status, 409);

    await request(app()).patch('/api/auth/profile').send({ name: 'Nope Nope' }).expect(401);
  });

  it('blocks state-changing requests from an origin that is not allowed', async () => {
    const res = await request(app()).post('/api/auth/login').set('Origin', 'https://evil.example').send({ identifier: 'a@b.co', password: 'password1' });
    assert.equal(res.status, 403);
  });
});
