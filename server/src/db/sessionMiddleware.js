import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import { sessionCookieName, sessionCookieOptions } from '../config/session.js';
import { pool } from './pool.js';

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRET is required. Add a random secret to .env.');
}

const PostgreSQLSessionStore = connectPgSimple(session);

export const sessionMiddleware = session({
  name: sessionCookieName,
  store: new PostgreSQLSessionStore({ pool, tableName: 'session' }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: sessionCookieOptions,
});
