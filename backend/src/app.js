import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { noStore, originGuard } from './middleware/security.js';
import { authRoutes } from './routes/auth.js';
import graphRoutes from './routes/graph.js';
import productRoutes from './routes/products.js';
import publicRoutes from './routes/public.js';

const limiter = (limit, windowMs, message) => rateLimit({
  windowMs,
  limit,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: { message } }),
});

/** `limits` can be overridden (the tests use this to check rate limiting). */
export function createApp({ limits = {} } = {}) {
  const max = {
    login: env.isTest ? 10_000 : 10,
    signup: env.isTest ? 10_000 : 10,
    api: env.isTest ? 1_000_000 : 600,
    ...limits,
  };

  const app = express();
  app.disable('x-powered-by');
  if (env.trustProxy) app.set('trust proxy', env.trustProxy);

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use('/api', noStore, originGuard(env.corsOrigins), limiter(max.api, 15 * 60 * 1000, 'Too many requests. Please slow down.'));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.get('/api/health', (_req, res) => {
    res.json({ data: { status: 'ok', database: mongoose.connection.readyState === 1 ? 'up' : 'down' } });
  });

  app.use('/api/auth', authRoutes({
    loginLimiter: limiter(max.login, 15 * 60 * 1000, 'Too many login attempts. Please wait a few minutes and try again.'),
    signupLimiter: limiter(max.signup, 60 * 60 * 1000, 'Too many sign-up attempts. Please try again later.'),
  }));
  app.use('/api/graph', graphRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/public', publicRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
