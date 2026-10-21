// Small fetch wrapper for the API in server/. The API is served from the same origin as the app,
// so paths are relative and the HTTP-only session cookie is sent automatically.
export async function api(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new Error('We could not reach the server. Check your connection and try again.');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error(data?.error || `The server returned an error (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}
