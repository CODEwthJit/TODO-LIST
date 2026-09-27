import { pool } from '../db/pool.js';

export async function listTodos(userId, filters) {
  const conditions = ['user_id = $1'];
  const parameters = [userId];

  if (filters.q) {
    parameters.push(`%${filters.q}%`);
    conditions.push(`title ILIKE $${parameters.length}`);
  }

  if (filters.status !== 'all') {
    parameters.push(filters.status === 'completed');
    conditions.push(`completed = $${parameters.length}`);
  }

  const whereClause = conditions.join(' AND ');
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM todos WHERE ${whereClause}`,
    parameters,
  );
  const total = countResult.rows[0].total;
  const totalPages = Math.ceil(total / filters.pageSize);
  const page = totalPages === 0 ? 1 : Math.min(filters.page, totalPages);
  const offset = (page - 1) * filters.pageSize;

  const sortColumn = filters.sortBy === 'title' ? 'title' : 'id';
  const sortDirection = filters.order === 'desc' ? 'DESC' : 'ASC';
  const orderBy = sortColumn === 'title'
    ? `title ${sortDirection}, id ASC`
    : `id ${sortDirection}`;
  const limitParameter = parameters.length + 1;
  const offsetParameter = parameters.length + 2;
  const result = await pool.query(
    `SELECT id, title, completed FROM todos WHERE ${whereClause} ORDER BY ${orderBy} LIMIT $${limitParameter} OFFSET $${offsetParameter}`,
    [...parameters, filters.pageSize, offset],
  );

  return {
    items: result.rows,
    total,
    page,
    pageSize: filters.pageSize,
    totalPages,
  };
}

export async function createTodo(userId, title) {
  const result = await pool.query(
    'INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING id, title, completed',
    [userId, title],
  );

  return result.rows[0];
}

export async function updateTodo(todoId, completed, userId) {
  const result = await pool.query(
    'UPDATE todos SET completed = $1 WHERE id = $2 AND user_id = $3 RETURNING id, title, completed',
    [completed, todoId, userId],
  );

  return result.rows[0] ?? null;
}

export async function deleteTodo(todoId, userId) {
  const result = await pool.query(
    'DELETE FROM todos WHERE id = $1 AND user_id = $2',
    [todoId, userId],
  );

  return result.rowCount > 0;
}
