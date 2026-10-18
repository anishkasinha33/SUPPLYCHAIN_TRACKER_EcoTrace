import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

const ROUNDS = env.isTest ? 4 : 12; // tests use the cheapest setting so they run fast

export const hashPassword = (password) => bcrypt.hash(password, ROUNDS);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

// Compared against when the account does not exist, so "no such user" takes as long as "wrong password".
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', ROUNDS);
export const spendPasswordTime = (password) => bcrypt.compare(password, DUMMY_HASH);
