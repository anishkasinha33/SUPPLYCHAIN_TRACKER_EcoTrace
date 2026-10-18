// Talks to the EcoTrace backend (POST /api/auth/*). The server keeps the session in an HTTP-only cookie
// and stores only password hashes. `current` below is just an in-memory copy of who is signed in.
import { DEMO_USER, DEMO_PASSWORD } from '../data/users.js';
import { api } from './api.js';

let current = null; // { user, at } while signed in, otherwise null

export const authService = {
  getSession() {
    return current;
  },

  /** Asks the server who is signed in (used once when the app starts). A failure counts as signed out. */
  async restore() {
    try {
      const { user } = await api('/auth/me');
      current = user ? { user, at: Date.now() } : null;
    } catch {
      current = null;
    }
    return current;
  },

  async login({ identifier, password }) {
    const { user } = await api('/auth/login', { method: 'POST', body: { identifier, password } });
    current = { user, at: Date.now() };
    return current;
  },

  async loginDemo() {
    return this.login({ identifier: DEMO_USER.email, password: DEMO_PASSWORD });
  },

  async signup({ name, businessName, email, phone, password }) {
    const { user } = await api('/auth/signup', { method: 'POST', body: { name, businessName, email, phone, password } });
    current = { user, at: Date.now() };
    return current;
  },

  async updateProfile(patch) {
    if (!current) return null;
    const { user } = await api('/auth/profile', { method: 'PATCH', body: patch });
    current = { ...current, user };
    return current;
  },

  logout() {
    current = null;
    api('/auth/logout', { method: 'POST' }).catch(() => { /* the cookie is cleared on the next successful call */ });
  },
};
