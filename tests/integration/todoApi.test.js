import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';

let app;
let pool;
let server;
let baseUrl;
const accountEmails = [];

before(async () => {
  if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
    throw new Error('Copy .env.test.example to .env.test and configure its values first.');
  }

  ({ default: app } = await import('../../server/src/app.js'));
  ({ pool } = await import('../../server/src/db/pool.js'));
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (accountEmails.length > 0 && pool) {
    await pool.query(
      `DELETE FROM "session"
       WHERE (sess->'user'->>'id')::integer IN (
         SELECT id FROM users WHERE email = ANY($1::text[])
       )`,
      [accountEmails],
    );
    await pool.query('DELETE FROM users WHERE email = ANY($1::text[])', [accountEmails]);
  }
  if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  if (pool) await pool.end();
});

async function register(email) {
  accountEmails.push(email);
  const response = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'test-password-123' }),
  });
  assert.equal(response.status, 201);
  const cookie = response.headers.get('set-cookie')?.split(';')[0];
  assert.ok(cookie, 'registration should establish a session cookie');
  return { cookie, user: (await response.json()).user };
}

async function request(path, cookie, options = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...options.headers,
    },
  });
}

test('authenticated Todo API supports CRUD, list queries, and user isolation', async () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const firstEmail = `first-${suffix}@example.test`;
  const secondEmail = `second-${suffix}@example.test`;
  const firstUser = await register(firstEmail);
  const secondUser = await register(secondEmail);

  const login = await request('/api/auth/login', null, {
    method: 'POST',
    body: JSON.stringify({ email: firstEmail, password: 'test-password-123' }),
  });
  assert.equal(login.status, 200);
  const loginCookie = login.headers.get('set-cookie')?.split(';')[0];
  assert.ok(loginCookie, 'login should establish a session cookie');
  assert.equal((await request('/api/auth/me', loginCookie)).status, 200);

  const unauthenticated = await request('/api/todos');
  assert.equal(unauthenticated.status, 401);

  const firstCreate = await request('/api/todos', firstUser.cookie, {
    method: 'POST', body: JSON.stringify({ title: 'Read a book' }),
  });
  assert.equal(firstCreate.status, 201);
  const firstTodo = await firstCreate.json();

  const secondCreate = await request('/api/todos', firstUser.cookie, {
    method: 'POST', body: JSON.stringify({ title: 'Write notes' }),
  });
  const secondTodo = await secondCreate.json();

  const invalidQuery = await request('/api/todos?sortBy=secret', firstUser.cookie);
  assert.equal(invalidQuery.status, 400);

  const filtered = await request('/api/todos?q=book&status=active&page=1&pageSize=1', firstUser.cookie);
  assert.equal(filtered.status, 200);
  assert.deepEqual(await filtered.json(), {
    items: [{ ...firstTodo, completed: false }],
    total: 1,
    page: 1,
    pageSize: 1,
    totalPages: 1,
  });

  const clampedPage = await request('/api/todos?page=999&pageSize=1', firstUser.cookie);
  const lastPage = await clampedPage.json();
  assert.equal(lastPage.page, 2);
  assert.equal(lastPage.totalPages, 2);

  const update = await request(`/api/todos/${firstTodo.id}`, firstUser.cookie, {
    method: 'PATCH', body: JSON.stringify({ completed: true }),
  });
  assert.equal(update.status, 200);
  assert.equal((await update.json()).completed, true);

  const foreignList = await request('/api/todos', secondUser.cookie);
  assert.equal((await foreignList.json()).total, 0);
  const foreignUpdate = await request(`/api/todos/${firstTodo.id}`, secondUser.cookie, {
    method: 'PATCH', body: JSON.stringify({ completed: false }),
  });
  assert.equal(foreignUpdate.status, 404);

  const deletion = await request(`/api/todos/${secondTodo.id}`, firstUser.cookie, { method: 'DELETE' });
  assert.equal(deletion.status, 204);

  const logout = await request('/api/auth/logout', loginCookie, { method: 'POST' });
  assert.equal(logout.status, 204);
  assert.equal((await request('/api/auth/me', loginCookie)).status, 401);
});
