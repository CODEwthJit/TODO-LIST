import { AppError } from '../errors/AppError.js';
import { sessionCookieName, sessionCookieOptions } from '../config/session.js';
import { authenticateUser, registerUser } from '../services/authService.js';

function establishSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => {
      if (error) return reject(error);

      req.session.user = user;
      req.session.save((saveError) => {
        if (saveError) return reject(saveError);
        return resolve();
      });
    });
  });
}

export async function register(req, res) {
  const user = await registerUser(req.validated.body);
  await establishSession(req, user);
  return res.status(201).json({ user });
}

export async function login(req, res) {
  const user = await authenticateUser(req.validated.body);
  await establishSession(req, user);
  return res.status(200).json({ user });
}

export function currentUser(req, res) {
  if (!req.session.user) {
    throw new AppError(401, 'login required');
  }

  return res.status(200).json({ user: req.session.user });
}

export function logout(req, res, next) {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie(sessionCookieName, sessionCookieOptions);
    return res.status(204).end();
  });
}
