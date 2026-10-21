import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import dataRoutes from './routes/data.js';
import productRoutes from './routes/products.js';
import { errorHandler, notFound } from './middleware/errors.js';

/** The JSON API, mounted at /api. The frontend is added on top of it in index.js. */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', process.env.VERCEL ? true : 'loopback'); // Vercel terminates HTTPS in front of the function
  app.use('/api', express.json({ limit: '1mb' }), cookieParser());

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
  });
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api', dataRoutes);

  app.use('/api', notFound);
  app.use('/api', errorHandler);
  return app;
}
