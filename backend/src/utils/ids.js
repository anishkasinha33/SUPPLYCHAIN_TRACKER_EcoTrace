import { randomBytes, randomInt } from 'node:crypto';

/** Prefixed random id, e.g. "pr-3fa9c1d2b7e4". Matches the string ids the frontend already uses. */
export const newId = (prefix) => `${prefix}-${randomBytes(6).toString('hex')}`;

export const TRACE_ID_PATTERN = /^ECO-[A-Z0-9]{4}-\d{4}$/;
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Public traceability id in the same shape as the frontend's, e.g. "ECO-7K4M-2610". */
export function generateTraceId() {
  const code = Array.from({ length: 4 }, () => LETTERS[randomInt(LETTERS.length)]).join('');
  const year = String(new Date().getFullYear()).slice(2);
  return `ECO-${code}-${year}${randomInt(10, 100)}`;
}
