import jwt from 'jsonwebtoken';

const COOKIE = 'ecotrace_session';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

// The app and API share one origin, so SameSite=Lax is enough; Secure follows the request (HTTPS or not).
const cookieOptions = (req) => ({ httpOnly: true, secure: req.secure, sameSite: 'lax', path: '/' });

export function setSessionCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: MAX_AGE_MS / 1000 });
  res.cookie(COOKIE, token, { ...cookieOptions(res.req), maxAge: MAX_AGE_MS });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE, cookieOptions(res.req));
}

/** Sets req.userId from the session cookie, or responds 401. */
export function requireAuth(req, res, next) {
  try {
    req.userId = jwt.verify(req.cookies?.[COOKIE], process.env.JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Please log in to continue.' });
  }
}
