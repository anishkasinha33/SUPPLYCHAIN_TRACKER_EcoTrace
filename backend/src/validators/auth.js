import { z } from 'zod';
import { phoneDigitCount } from '../utils/phone.js';

const name = z.string().trim().min(2, 'Enter your full name.').max(80, 'That name is too long.');
const businessName = z.string().trim().min(2, 'Enter your business name.').max(120, 'That name is too long.');
const email = z.string().trim().toLowerCase().max(254, 'That email is too long.').email('Enter a valid email address, like name@example.com.');
const phone = z.string().trim().max(30, 'That phone number is too long.').refine((v) => {
  const digits = phoneDigitCount(v);
  return digits >= 8 && digits <= 15;
}, 'Enter a phone number with 8 to 15 digits.');
// bcrypt only uses the first 72 bytes, so longer passwords are refused rather than silently truncated.
const password = z.string().min(8, 'Use at least 8 characters.').refine((v) => Buffer.byteLength(v) <= 72, 'Use at most 72 bytes.');

export const signupSchema = z.object({ name, businessName, email, phone, password });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your email or phone number.').max(254),
  password: z.string().min(1, 'Enter your password.').max(200),
});

// Only these fields can ever be changed through the profile endpoint (no role, no password, no ids).
export const profileSchema = z.object({
  name: name.optional(),
  email: email.optional(),
  phone: phone.optional(),
  businessName: businessName.optional(),
  industry: z.string().trim().max(120).optional(),
  location: z.string().trim().max(200).optional(),
}).refine((o) => Object.keys(o).length > 0, 'There is nothing to update.');
