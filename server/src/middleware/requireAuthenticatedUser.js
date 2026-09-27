import { AppError } from '../errors/AppError.js';

export function requireAuthenticatedUser(req, _res, next) {
  if (!req.session.user) {
    return next(new AppError(401, 'login required'));
  }

  req.user = req.session.user;
  return next();
}
