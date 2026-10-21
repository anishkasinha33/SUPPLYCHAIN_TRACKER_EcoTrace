// Auth goes through the API (server/routes/auth.js): bcrypt-hashed passwords in MongoDB and an
// HTTP-only session cookie. The profile is cached in localStorage only so the first render knows
// who is signed in; the cookie is what the server trusts.
import { DEMO_USER, DEMO_PASSWORD } from '../data/users.js';
import { storage } from './storage.js';
import { api } from './api.js';

const SESSION = 'sct.session'; // { user, at } (profile only, no token)

const remember = ({ user }) => {
  const session = { user, at: Date.now() };
  storage.set(SESSION, session);
  return session;
};

// A cached profile can outlive its cookie (expired, or saved before the API existed).
// Check it once on load; if the server no longer knows the session, sign out and reload.
if (storage.get(SESSION)) {
  api('/auth/me').then(remember).catch((e) => {
    if (e.status !== 401) return; // server unreachable: keep the cached profile
    storage.remove(SESSION);
    window.location.reload();
  });
}

export const authService = {
  getSession() {
    return storage.get(SESSION);
  },

  async login({ identifier, password }) {
    return remember(await api('/auth/login', { method: 'POST', body: { identifier, password } }));
  },

  async loginDemo() {
    return this.login({ identifier: DEMO_USER.email, password: DEMO_PASSWORD });
  },

  async signup({ name, businessName, email, phone, password }) {
    return remember(await api('/auth/signup', { method: 'POST', body: { name, businessName, email, phone, password } }));
  },

  /** Updates the profile right away and saves it to the server in the background. */
  updateProfile(patch) {
    const session = storage.get(SESSION);
    if (!session) return null;
    const next = { ...session, user: { ...session.user, ...patch } };
    storage.set(SESSION, next);
    api('/auth/me', { method: 'PATCH', body: patch }).then(remember).catch((e) => console.error('Could not save profile:', e.message));
    return next;
  },

  logout() {
    storage.remove(SESSION);
    api('/auth/logout', { method: 'POST' }).catch(() => {});
  },
};
