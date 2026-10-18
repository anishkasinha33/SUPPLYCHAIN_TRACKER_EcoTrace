import { Router } from 'express';
import { endSession, loadSessionUser, requireAuth, startSession } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { Product } from '../models/Product.js';
import { toPublicUser, User } from '../models/User.js';
import { hashPassword, spendPasswordTime, verifyPassword } from '../services/passwords.js';
import { cloneSamplesForUser } from '../services/sampleService.js';
import { loginSchema, profileSchema, signupSchema } from '../validators/auth.js';
import { AppError, isDuplicateKey } from '../utils/errors.js';
import { phoneDigitCount, phoneKey } from '../utils/phone.js';

const duplicateMessage = (err) => (err.keyPattern?.phoneKey
  ? 'An account with this phone number already exists. Log in instead.'
  : 'An account with this email already exists. Log in instead.');

export function authRoutes({ loginLimiter, signupLimiter }) {
  const r = Router();

  r.post('/signup', signupLimiter, validate(signupSchema), async (req, res) => {
    const { name, businessName, email, phone, password } = req.body;
    const passwordHash = await hashPassword(password);

    let user;
    try {
      user = await User.create({ name, businessName, email, phone, phoneKey: phoneKey(phone), passwordHash });
    } catch (err) {
      if (isDuplicateKey(err)) throw new AppError(409, duplicateMessage(err));
      throw err;
    }

    try {
      await cloneSamplesForUser(user._id); // every new account starts with its own copy of the sample products
    } catch (err) {
      await Product.deleteMany({ ownerId: user._id });
      await User.deleteOne({ _id: user._id });
      throw err;
    }

    await startSession(res, user._id, req.get('user-agent'));
    res.status(201).json({ data: { user: toPublicUser(user) } });
  });

  r.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
    const { identifier, password } = req.body;
    let query = null;
    if (identifier.includes('@')) query = { email: identifier.toLowerCase() };
    else if (phoneDigitCount(identifier) >= 8) query = { phoneKey: phoneKey(identifier) };

    const user = query ? await User.findOne(query).select('+passwordHash') : null;
    let ok = false;
    if (user) ok = await verifyPassword(password, user.passwordHash);
    else await spendPasswordTime(password);
    // One message for "no such account" and "wrong password", so the form cannot be used to find accounts.
    if (!ok) throw new AppError(401, 'Incorrect email, phone number or password.');

    await startSession(res, user._id, req.get('user-agent'));
    res.json({ data: { user: toPublicUser(user) } });
  });

  r.post('/logout', async (req, res) => {
    await endSession(req, res);
    res.json({ data: { ok: true } });
  });

  // Anonymous visitors get { user: null } (not an error), so the app can start without console noise.
  r.get('/me', async (req, res) => {
    const user = await loadSessionUser(req);
    res.json({ data: { user: user ? toPublicUser(user) : null } });
  });

  r.patch('/profile', requireAuth, validate(profileSchema), async (req, res) => {
    const patch = { ...req.body };
    if (patch.phone) patch.phoneKey = phoneKey(patch.phone);
    try {
      const user = await User.findByIdAndUpdate(req.user._id, { $set: patch }, { new: true, runValidators: true });
      res.json({ data: { user: toPublicUser(user) } });
    } catch (err) {
      if (isDuplicateKey(err)) throw new AppError(409, duplicateMessage(err).replace(' Log in instead.', ''));
      throw err;
    }
  });

  return r;
}
