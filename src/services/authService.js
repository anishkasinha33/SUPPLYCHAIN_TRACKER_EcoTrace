// DEMO AUTHENTICATION ONLY. This is not secure and must be replaced before real use.
// BACKEND: Frontend -> POST /api/auth/login -> Node.js -> SQL (hashed passwords, HTTP-only cookie).
// Registered passwords are stored only as a salted SHA-256 hash in this browser (demo grade, not a real
// password KDF). The seeded demo account is checked against the published demo password.
import { DEMO_USER, DEMO_PASSWORD } from '../data/users.js';
import { storage, delay } from './storage.js';

const SESSION = 'sct.session';
const USERS = 'sct.users'; // profiles only (no passwords)
const CREDS = 'sct.creds'; // { [userId]: { salt, hash } }

const toHex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  if (globalThis.crypto?.subtle) return toHex(await crypto.subtle.digest('SHA-256', data));
  let h = 5381; for (const c of data) h = ((h << 5) + h + c) >>> 0; // fallback for non-secure contexts
  return h.toString(16);
}

const clean = (v) => (v || '').trim().toLowerCase();
const phoneDigits = (v) => (v || '').replace(/\D/g, '');

export const authService = {
  getSession() {
    return storage.get(SESSION);
  },

  async login({ identifier, password }) {
    await delay(500);
    const id = clean(identifier);
    const digits = phoneDigits(identifier);
    const all = [DEMO_USER, ...storage.get(USERS, [])];
    const user = all.find((u) => clean(u.email) === id || (digits.length >= 8 && phoneDigits(u.phone).endsWith(digits.slice(-10))));
    if (!user) throw new Error('We could not find an account with that email or phone number.');
    let ok;
    if (user.id === DEMO_USER.id) ok = password === DEMO_PASSWORD;
    else {
      const cred = storage.get(CREDS, {})[user.id];
      ok = !!cred && (await hashPassword(password, cred.salt)) === cred.hash;
    }
    if (!ok) throw new Error('That password is not correct. Try again, or use the demo credentials.');
    const session = { user, token: 'demo-session', at: Date.now() };
    storage.set(SESSION, session);
    return session;
  },

  async loginDemo() {
    return this.login({ identifier: DEMO_USER.email, password: DEMO_PASSWORD });
  },

  async signup({ name, businessName, email, phone, password }) {
    await delay(600);
    const users = storage.get(USERS, []);
    if (clean(email) === clean(DEMO_USER.email) || users.some((u) => clean(u.email) === clean(email))) {
      throw new Error('An account with this email already exists. Log in instead.');
    }
    const user = { id: `u-${Date.now().toString(36)}`, name: name.trim(), email: email.trim(), phone: phone.trim(), businessName: businessName.trim(), industry: '', location: '' };
    const salt = Math.random().toString(36).slice(2) + Date.now().toString(36);
    storage.set(CREDS, { ...storage.get(CREDS, {}), [user.id]: { salt, hash: await hashPassword(password, salt) } });
    storage.set(USERS, [...users, user]);
    const session = { user, token: 'demo-session', at: Date.now() };
    storage.set(SESSION, session);
    return session;
  },

  updateProfile(patch) {
    const session = storage.get(SESSION);
    if (!session) return null;
    const next = { ...session, user: { ...session.user, ...patch } };
    storage.set(SESSION, next);
    return next;
  },

  logout() {
    storage.remove(SESSION);
  },
};
