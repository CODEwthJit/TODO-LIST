import { Router } from 'express';
import { currentUser, login, logout, register } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { loginBodySchema, registerBodySchema } from '../validation/authSchemas.js';

const router = Router();

router.get('/me', currentUser);
router.post('/register', validateRequest(registerBodySchema), register);
router.post('/login', validateRequest(loginBodySchema), login);
router.post('/logout', logout);

export default router;
