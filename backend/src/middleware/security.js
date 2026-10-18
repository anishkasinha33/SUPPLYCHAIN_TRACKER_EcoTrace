import { AppError } from '../utils/errors.js';

/** Private API responses must never be cached by the browser or a proxy. */
export const noStore = (_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
};

/**
 * Extra CSRF protection on top of SameSite cookies: a state-changing request that names an Origin
 * must come from one of the allowed frontend origins.
 */
export const originGuard = (allowedOrigins) => (req, _res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  const origin = req.get('origin');
  if (origin && !allowedOrigins.includes(origin)) throw new AppError(403, 'This request origin is not allowed.');
  next();
};
