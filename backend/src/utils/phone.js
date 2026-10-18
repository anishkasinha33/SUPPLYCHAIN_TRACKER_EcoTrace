/** Phone numbers are matched on their last 10 digits, like the frontend's login does. */
export const phoneKey = (value) => String(value ?? '').replace(/\D/g, '').slice(-10);
export const phoneDigitCount = (value) => String(value ?? '').replace(/\D/g, '').length;
