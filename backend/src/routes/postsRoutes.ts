import express, { RequestHandler } from 'express';
import { xss } from 'express-xss-sanitizer';
import authenticate from '../middlewares/authenticate';
import { getPosts, createPost, getPostById, deletePost } from '../controllers/postsController';
import commentsRouter from '../routes/commentsRoutes'; // Needed for nested routes
import validateObjectId from '../middlewares/validateObjectId';
import validateWithZod from '../middlewares/validateWithZod';
import postCreateSchema from '../schemas/postSchemas';

const router = express.Router();

router
    .route('/')
    .get(getPosts)
    .post(authenticate, xss(), validateWithZod(postCreateSchema), createPost as RequestHandler);

router
    .route('/:id')
    .get(validateObjectId('id'), getPostById)
    .delete(authenticate, validateObjectId('id'), deletePost as RequestHandler);

// Nested comments routes
router.use('/:postId/comments', validateObjectId('postId'), commentsRouter);

export default router;
