import { AppError } from '../errors/AppError.js';

export function errorHandler(error, _req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const isInvalidJson = error.type === 'entity.parse.failed';
  const statusCode = error instanceof AppError ? error.statusCode : isInvalidJson ? 400 : 500;
  const message = error instanceof AppError
    ? error.message
    : isInvalidJson
      ? 'request body must contain valid JSON'
      : 'internal server error';

  if (statusCode === 500) {
    console.error(error);
  }

  return res.status(statusCode).json({ error: message });
}
