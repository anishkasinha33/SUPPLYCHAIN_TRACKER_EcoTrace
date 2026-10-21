// One process, one port: the Express API at /api and the React app on every other path.
// `npm run dev` runs Vite inside Express (with hot reload); `npm start` serves the built dist/.
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';
import { seedIfEmpty } from './seed.js';

const production = process.argv.includes('--production') || process.env.NODE_ENV === 'production';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT) || 5173;

if (!process.env.JWT_SECRET) {
  if (production) {
    console.error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
    process.exit(1);
  }
  process.env.JWT_SECRET = 'ecotrace-local-dev-secret';
  console.warn('JWT_SECRET is not set; using a development-only secret.');
}

try {
  await connectDb();
  await seedIfEmpty();
} catch (err) {
  console.error(`Could not start: ${err.message}`);
  console.error('Is MongoDB running? Set MONGODB_URI in .env to point at it.');
  process.exit(1);
}

const app = createApp();
const server = http.createServer(app);

if (production) {
  const dist = path.join(root, 'dist');
  app.use(express.static(dist, { index: false }));
  app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
} else {
  const { createServer } = await import('vite');
  const vite = await createServer({
    root,
    appType: 'spa',
    server: { middlewareMode: true, hmr: { server } },
  });
  app.use(vite.middlewares);
}

server.listen(port, () => console.log(`EcoTrace running on http://localhost:${port}${production ? '' : ' (dev)'}`));

const shutdown = async () => {
  server.close();
  await mongoose.disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
