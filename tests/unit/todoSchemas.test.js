import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createTodoBodySchema,
  todoListQuerySchema,
  todoIdParamsSchema,
} from '../../server/src/validation/todoSchemas.js';

test('todo list query uses defaults and trims search text', () => {
  const result = todoListQuerySchema.safeParse({ q: '  read  ' });

  assert.deepEqual(result, {
    success: true,
    data: {
      q: 'read',
      status: 'all',
      sortBy: 'id',
      order: 'asc',
      page: 1,
      pageSize: 10,
    },
  });
});

test('todo list query accepts supported filters and page values', () => {
  const result = todoListQuerySchema.safeParse({
    q: 'book',
    status: 'completed',
    sortBy: 'title',
    order: 'desc',
    page: '3',
    pageSize: '20',
  });

  assert.equal(result.success, true);
  assert.deepEqual(result.data, {
    q: 'book', status: 'completed', sortBy: 'title', order: 'desc', page: 3, pageSize: 20,
  });
});

for (const [field, value] of [
  ['status', 'done'],
  ['sortBy', 'created_at'],
  ['order', 'sideways'],
  ['page', '0'],
  ['pageSize', '51'],
  ['q', 'a'.repeat(101)],
]) {
  test(`todo list query rejects invalid ${field}`, () => {
    assert.equal(todoListQuerySchema.safeParse({ [field]: value }).success, false);
  });
}

test('create todo validation rejects a blank title', () => {
  assert.equal(createTodoBodySchema.safeParse({ title: '   ' }).success, false);
});

test('todo ID validation rejects non-positive and unsafe IDs', () => {
  assert.equal(todoIdParamsSchema.safeParse({ id: '0' }).success, false);
  assert.equal(todoIdParamsSchema.safeParse({ id: '99999999999999999999' }).success, false);
});
