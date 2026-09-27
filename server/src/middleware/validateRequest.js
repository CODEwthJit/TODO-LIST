import { AppError } from '../errors/AppError.js';

export function validateRequest(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return next(new AppError(400, result.message));
    }

    req.validated ??= {};
    req.validated[source] = result.data;
    return next();
  };
}
