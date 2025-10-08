import express from 'express';
import morgan from 'morgan';

import authRoutes from './routes/authRoutes';
import usersRoutes from './routes/usersRoutes';
import errorHandler from './middlewares/errorHandler';

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('tiny'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);

// Errors
app.use(errorHandler);
// TODO: add 404 handler

export default app;
