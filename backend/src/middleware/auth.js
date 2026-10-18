import { createHash, randomBytes } from 'node:crypto';
import { env } from '../config/env.js';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';

export const COOKIE_NAME = 'ecotrace_sid';
const DAY_MS = 24 * 60 * 60 * 1000;

const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const cookieOptions = () => ({ httpOnly: true, sameSite: 'lax', secure: env.isProd, path: '/' });

export async function startSession(res, userId, userAgent) {
  const token = randomBytes(32).toString('base64url');
  const maxAge = env.sessionTtlDays * DAY_MS;
  await Session.create({ tokenHash: hashToken(token), userId, expiresAt: new Date(Date.now() + maxAge), userAgent: (userAgent || '').slice(0, 200) });
  res.cookie(COOKIE_NAME, token, { ...cookieOptions(), maxAge });
}

export async function endSession(req, res) {
  const token = req.cookies?.[COOKIE_NAME];
  if (typeof token === 'string' && token) await Session.deleteOne({ tokenHash: hashToken(token) });
  res.clearCookie(COOKIE_NAME, cookieOptions());
}

/** The signed-in user for this request, or null. Never throws for a missing or expired login. */
export async function loadSessionUser(req) {
  const token = req.cookies?.[COOKIE_NAME];
  if (typeof token !== 'string' || !token || token.length > 200) return null;
  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } }).lean();
  if (!session) return null;
  return User.findById(session.userId);
}

export async function requireAuth(req, _res, next) {
  const user = await loadSessionUser(req);
  if (!user) throw new AppError(401, 'Please log in to continue.');
  req.user = user;
  next();
}
