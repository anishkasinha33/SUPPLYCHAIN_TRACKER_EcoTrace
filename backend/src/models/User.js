import mongoose from 'mongoose';
import { newId } from '../utils/ids.js';

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => newId('u') },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, unique: true },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    phoneKey: { type: String, required: true, unique: true }, // last 10 digits, used to log in by phone
    businessName: { type: String, required: true, trim: true, maxlength: 120 },
    industry: { type: String, trim: true, maxlength: 120, default: '' },
    location: { type: String, trim: true, maxlength: 200, default: '' },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true, versionKey: false },
);

export const User = mongoose.model('User', userSchema);

/** The only shape of a user that ever leaves the server. */
export const toPublicUser = (u) => ({
  id: String(u._id),
  name: u.name,
  email: u.email,
  phone: u.phone,
  businessName: u.businessName,
  industry: u.industry || '',
  location: u.location || '',
});
