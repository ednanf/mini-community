import express from 'express';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import usersRoutes from './routes/usersRoutes';
import postsRoutes from './routes/postsRoutes';
import commentsRoutes from './routes/commentsRoutes';
import errorHandler from './middlewares/errorHandler';

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('tiny'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/comments', commentsRoutes);

// Errors
app.use(errorHandler);
// TODO: add 404 handler

export default app;
