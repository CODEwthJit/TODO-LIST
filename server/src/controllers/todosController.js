import {
  addTodo,
  getTodos,
  removeTodo,
  setTodoCompleted,
} from '../services/todosService.js';
import { AppError } from '../errors/AppError.js';

export async function listTodos(req, res) {
  const result = await getTodos(req.user.id, req.validated.query);
  return res.status(200).json(result);
}

export async function createTodo(req, res) {
  const todo = await addTodo(req.user.id, req.validated.body.title);
  return res.status(201).json(todo);
}

export async function updateTodo(req, res) {
  const { id } = req.validated.params;
  const { completed } = req.validated.body;
  const todo = await setTodoCompleted(id, completed, req.user.id);

  if (!todo) {
    throw new AppError(404, 'todo not found');
  }

  return res.status(200).json(todo);
}

export async function deleteTodo(req, res) {
  const wasDeleted = await removeTodo(req.validated.params.id, req.user.id);

  if (!wasDeleted) {
    throw new AppError(404, 'todo not found');
  }

  return res.status(204).end();
}
