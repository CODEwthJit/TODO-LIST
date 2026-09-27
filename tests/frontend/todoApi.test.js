import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getTodos } from '../../src/api/todos.js';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test('getTodos encodes filters and sends the session cookie', async () => {
  let requestUrl;
  let requestOptions;
  globalThis.fetch = async (url, options) => {
    requestUrl = url;
    requestOptions = options;
    return new Response(JSON.stringify({ items: [], total: 0 }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  const result = await getTodos({ q: 'read book', status: 'active', page: 2 });

  const url = new URL(requestUrl);
  assert.equal(url.origin, 'http://localhost:3000');
  assert.equal(url.pathname, '/api/todos');
  assert.equal(url.searchParams.get('q'), 'read book');
  assert.equal(url.searchParams.get('status'), 'active');
  assert.equal(url.searchParams.get('page'), '2');
  assert.equal(requestOptions.credentials, 'include');
  assert.deepEqual(result, { items: [], total: 0 });
});

test('getTodos surfaces a JSON API error message', async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ error: 'login required' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });

  await assert.rejects(getTodos({}), { message: 'login required' });
});
