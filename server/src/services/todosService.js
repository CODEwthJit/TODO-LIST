import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from '../repositories/todosRepository.js';

export function getTodos(userId, filters) {
  return listTodos(userId, filters);
}

export function addTodo(userId, title) {
  return createTodo(userId, title);
}

export function setTodoCompleted(todoId, completed, userId) {
  return updateTodo(todoId, completed, userId);
}

export function removeTodo(todoId, userId) {
  return deleteTodo(todoId, userId);
}
