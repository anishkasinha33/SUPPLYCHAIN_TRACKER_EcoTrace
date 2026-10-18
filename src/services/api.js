// Small fetch wrapper for the EcoTrace backend (see /backend).
// In development Vite forwards /api to http://localhost:4000 (see vite.config.js). To call an API on another
// address, set VITE_API_BASE_URL (for example https://api.example.com/api). The login cookie is HTTP-only,
// so this code never sees or stores a token.
const BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status = 0, fields) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

/** Calls the API and returns the `data` part of the response. Throws ApiError with a message that is safe to show. */
export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'include',
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('We could not reach the server. Check that the backend is running, then try again.');
  }
  let json = null;
  try { json = await res.json(); } catch { /* empty or non-JSON body */ }
  if (!res.ok) throw new ApiError(json?.error?.message || 'Something went wrong. Please try again.', res.status, json?.error?.fields);
  return json?.data;
}
