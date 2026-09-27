import { Router } from 'express';
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodo,
} from '../controllers/todosController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { requireAuthenticatedUser } from '../middleware/requireAuthenticatedUser.js';
import {
  createTodoBodySchema,
  todoIdParamsSchema,
  todoListQuerySchema,
  updateTodoBodySchema,
} from '../validation/todoSchemas.js';

const router = Router();

router.use(requireAuthenticatedUser);
router.get('/', validateRequest(todoListQuerySchema, 'query'), listTodos);
router.post('/', validateRequest(createTodoBodySchema), createTodo);
router.patch(
  '/:id',
  validateRequest(todoIdParamsSchema, 'params'),
  validateRequest(updateTodoBodySchema),
  updateTodo,
);
router.delete('/:id', validateRequest(todoIdParamsSchema, 'params'), deleteTodo);

export default router;
