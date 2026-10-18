import mongoose from 'mongoose';
import { AppError } from '../utils/errors.js';

export function notFoundHandler(_req, res) {
  res.status(404).json({ error: { message: 'Route not found.' } });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, next) {
  if (res.headersSent) return next(err);

  if (err instanceof AppError) {
    return res.status(err.status).json({ error: { message: err.message, ...(err.fields ? { fields: err.fields } : {}) } });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: { message: 'That request is too large.' } });
  }
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) {
    return res.status(400).json({ error: { message: 'The request body is not valid JSON.' } });
  }
  if (err instanceof mongoose.Error.ValidationError || err instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: { message: 'Some details are not valid.' } });
  }

  // Never send internals to the client, and never log request bodies (they can hold passwords).
  console.error('Unhandled error:', err?.stack || err);
  res.status(500).json({ error: { message: 'Something went wrong on our side. Please try again.' } });
}
