// Vercel serverless entry: runs the same Express API as server/index.js.
// vercel.json rewrites /api/* here; req.url keeps the original /api/... path, so the routes match.
// Set MONGODB_URI (a cloud database such as MongoDB Atlas) and JWT_SECRET in the Vercel project.
import { createApp } from '../server/app.js';
import { connectDb } from '../server/config/db.js';
import { seedIfEmpty } from '../server/seed.js';

const app = createApp();
let ready; // reused across requests while the function instance stays warm

function fail(res, message) {
  res.statusCode = 503;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: message }));
}

export default async function handler(req, res) {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    return fail(res, 'The server is not configured: set MONGODB_URI and JWT_SECRET in the Vercel project settings.');
  }
  ready ??= connectDb().then(seedIfEmpty).catch((err) => {
    ready = null; // retry on the next request
    throw err;
  });
  try {
    await ready;
  } catch (err) {
    console.error(err);
    return fail(res, 'We could not reach the database. Try again in a moment.');
  }
  return app(req, res);
}
