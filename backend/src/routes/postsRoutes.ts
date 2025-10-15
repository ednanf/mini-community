import express, { RequestHandler } from 'express';
import authenticate from '../middlewares/authenticate';
import { getPosts, createPost, getPostById, deletePost } from '../controllers/postsController';
import commentsRouter from '../routes/commentsRoutes'; // Needed for nested routes
import validateObjectId from '../middlewares/validateObjectId';

const router = express.Router();

// TODO: Add sanitization

router.get('/', getPosts);
router.post('/', authenticate, createPost as RequestHandler);
router
    .route('/:id')
    .get(validateObjectId('id'), getPostById)
    .delete(authenticate, validateObjectId('id'), deletePost as RequestHandler);

// Nested comments routes
router.use('/:postId/comments', validateObjectId('postId'), commentsRouter);

export default router;
