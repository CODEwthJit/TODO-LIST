import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import todosRouter from './routes/todos.js';
import { AppError } from './errors/AppError.js';
import { errorHandler } from './middleware/errorHandler.js';
import { sessionMiddleware } from './db/sessionMiddleware.js';

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(sessionMiddleware);
app.use('/api/auth', authRouter);
app.use('/api/todos', todosRouter);
app.use((_req, _res, next) => next(new AppError(404, 'route not found')));
app.use(errorHandler);

export default app;
