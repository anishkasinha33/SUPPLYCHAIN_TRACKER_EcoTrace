// Thin, safe wrapper around localStorage. localStorage is NOT secure storage;
// it is used here only for demo state (session, user-created products, preferences).
export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  },
};

export const delay = (ms = 220) => new Promise((resolve) => setTimeout(resolve, ms));
