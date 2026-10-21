export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: `No API route for ${req.method} ${req.originalUrl}` });
}

// Express 5 forwards rejected promises from async handlers here.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    const msgs = err.errors ? Object.values(err.errors).map((e) => e.message) : [err.message];
    return res.status(400).json({ error: msgs.join(' ') });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: `That ${Object.keys(err.keyValue || {})[0] || 'value'} is already in use.` });
  }
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
}
