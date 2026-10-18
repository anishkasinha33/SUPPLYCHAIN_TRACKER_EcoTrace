import { Router } from 'express';
import { getPassport, getSampleGraph } from '../services/passportService.js';
import { AppError } from '../utils/errors.js';
import { TRACE_ID_PATTERN } from '../utils/ids.js';

const r = Router();
const cacheBriefly = (res) => res.set('Cache-Control', 'public, max-age=60');

// Product passport for customers (no login). Returns only what the public passport page shows.
r.get('/passports/:traceId', async (req, res) => {
  const traceId = String(req.params.traceId).toUpperCase();
  if (!TRACE_ID_PATTERN.test(traceId)) throw new AppError(404, 'We could not find that product passport.');
  const data = await getPassport(traceId);
  if (!data) throw new AppError(404, 'We could not find that product passport.');
  cacheBriefly(res);
  res.json({ data });
});

// The sample product shown on the landing page to visitors who are not logged in.
r.get('/sample', async (_req, res) => {
  cacheBriefly(res);
  res.json({ data: await getSampleGraph() });
});

export default r;
