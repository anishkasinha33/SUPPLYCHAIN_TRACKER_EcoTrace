import { AppError } from '../utils/errors.js';

/** Validates and cleans req.body with a zod schema. Only fields the schema declares survive. */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      if (!(key in fields)) fields[key] = issue.message;
    }
    const first = Object.values(fields)[0];
    throw new AppError(400, `Some details are not valid. ${first}`, fields);
  }
  req.body = result.data;
  next();
};
