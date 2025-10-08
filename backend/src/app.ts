import express from 'express';
import morgan from 'morgan';

import userRoutes from './routes/authRoutes';
import errorHandler from './middlewares/errorHandler';

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('tiny'));

// Routes
app.use('/api/v1/auth', userRoutes);

// Errors
app.use(errorHandler);
// TODO: add 404 handler

export default app;
