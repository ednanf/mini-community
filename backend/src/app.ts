import express from 'express';
import morgan from 'morgan';

import userRoutes from './routes/userRoutes';

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('tiny'));

// Routes
app.use('/api/v1/user', userRoutes);

export default app;
