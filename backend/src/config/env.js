import 'dotenv/config';

const positive = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const nodeEnv = process.env.NODE_ENV || 'development';

export const env = {
  nodeEnv,
  isProd: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: positive(process.env.PORT, 4000),
  // Tests always use their own database so real data is never touched.
  mongoUri: nodeEnv === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  sessionTtlDays: positive(process.env.SESSION_TTL_DAYS, 7),
  trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : null,
};
