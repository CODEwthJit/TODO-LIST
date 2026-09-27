import { pool } from '../db/pool.js';

export async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT id, email, password_hash AS "passwordHash" FROM users WHERE email = $1',
    [email],
  );

  return result.rows[0] ?? null;
}

export async function createUser(email, passwordHash) {
  const result = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
    [email, passwordHash],
  );

  return result.rows[0];
}
