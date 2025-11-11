import express from 'express';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import corsOptions from './configs/corsOptions.js';
import rateLimitOptions from './configs/rateLimitOptions.js';

import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import postsRoutes from './routes/postsRoutes.js';
import commentsRoutes from './routes/commentsRoutes.js';
import notFound from './middlewares/notFound.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// Middleware
app.use(express.json());
app.use(rateLimit(rateLimitOptions));
app.use(cors(corsOptions));
app.use(helmet());
app.use(morgan('tiny'));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/posts', postsRoutes);
app.use('/api/v1/comments', commentsRoutes);

// Errors
app.use(notFound);
app.use(errorHandler);

export default app;
