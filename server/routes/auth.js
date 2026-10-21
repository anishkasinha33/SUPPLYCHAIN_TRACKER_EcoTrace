import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User, publicUser } from '../models/index.js';
import { HttpError } from '../middleware/errors.js';
import { requireAuth, setSessionCookie, clearSessionCookie } from '../middleware/auth.js';

const router = Router();
const str = (v) => (typeof v === 'string' ? v.trim() : '');
const digits = (v) => str(v).replace(/\D/g, '');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PROFILE_FIELDS = ['name', 'email', 'phone', 'businessName', 'industry', 'location'];

router.post('/signup', async (req, res) => {
  const name = str(req.body.name), email = str(req.body.email).toLowerCase(), password = req.body.password;
  if (name.length < 2) throw new HttpError(400, 'Enter your name.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.');
  if (typeof password !== 'string' || password.length < 8) throw new HttpError(400, 'Use a password of at least 8 characters.');
  if (await User.exists({ email })) throw new HttpError(409, 'An account with this email already exists. Log in instead.');

  const user = await User.create({
    _id: `u-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name, email,
    phone: str(req.body.phone),
    phoneDigits: digits(req.body.phone),
    businessName: str(req.body.businessName),
    passwordHash: await bcrypt.hash(password, 12),
  });
  setSessionCookie(res, user._id);
  res.status(201).json({ user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const identifier = str(req.body.identifier), password = req.body.password;
  if (!identifier || typeof password !== 'string') throw new HttpError(400, 'Enter your email or phone and password.');
  const phone = digits(identifier);
  const user = await User.findOne(
    phone.length >= 8 && !identifier.includes('@')
      ? { phoneDigits: { $regex: `${escapeRe(phone.slice(-10))}$` } }
      : { email: identifier.toLowerCase() },
  ).select('+passwordHash');
  if (!user) throw new HttpError(401, 'We could not find an account with that email or phone number.');
  if (!(await bcrypt.compare(password, user.passwordHash))) throw new HttpError(401, 'That password is not correct. Try again, or use the demo credentials.');
  setSessionCookie(res, user._id);
  res.json({ user: publicUser(user) });
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) { clearSessionCookie(res); throw new HttpError(401, 'Please log in to continue.'); }
  res.json({ user: publicUser(user) });
});

router.patch('/me', requireAuth, async (req, res) => {
  const patch = {};
  for (const k of PROFILE_FIELDS) if (k in req.body) patch[k] = str(req.body[k]);
  if ('email' in patch) patch.email = patch.email.toLowerCase();
  if ('phone' in patch) patch.phoneDigits = digits(patch.phone);
  const user = await User.findByIdAndUpdate(req.userId, { $set: patch }, { returnDocument: 'after', runValidators: true });
  if (!user) throw new HttpError(401, 'Please log in to continue.');
  res.json({ user: publicUser(user) });
});

export default router;
