import express from 'express';
import { rateLimit } from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import corsOptions from './configs/corsOptions';
import rateLimitOptions from './configs/rateLimitOptions';

import authRoutes from './routes/authRoutes';
import usersRoutes from './routes/usersRoutes';
import postsRoutes from './routes/postsRoutes';
import commentsRoutes from './routes/commentsRoutes';
import notFound from './middlewares/notFound';
import errorHandler from './middlewares/errorHandler';

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
