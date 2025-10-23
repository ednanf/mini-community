import express, { RequestHandler } from 'express';
import { xss } from 'express-xss-sanitizer';
import authenticate from '../middlewares/authenticate';
import {
    getPosts,
    createPost,
    getMyPosts,
    getFollowedUsersPosts,
    getPostById,
    deletePost,
    getPostsByUserId,
} from '../controllers/postsController';
import commentsRouter from '../routes/commentsRoutes'; // Needed for nested routes
import validateObjectId from '../middlewares/validateObjectId';
import validateWithZod from '../middlewares/validateWithZod';
import postCreateSchema from '../schemas/postSchemas';

const router = express.Router();

// Unauthenticated route for global feed
router.route('/').get(getPosts);

// Authenticated route for user's own posts
router.route('/my-posts').get(authenticate, getMyPosts as RequestHandler);

// Authenticated route for user's personalized feed (followed users)
router
    .route('/feed')
    .get(authenticate, getFollowedUsersPosts as RequestHandler);

// Route for getting all posts from a specific user
router
    .route('/user/:id')
    .get(validateObjectId('id'), getPostsByUserId as RequestHandler);

// Authenticated route for creating a new post
router
    .route('/')
    .post(
        authenticate,
        xss(),
        validateWithZod(postCreateSchema),
        createPost as RequestHandler,
    );

// Routes for specific post by ID
router
    .route('/:id')
    .get(validateObjectId('id'), getPostById)
    .delete(authenticate, validateObjectId('id'), deletePost as RequestHandler);

// Nested comments routes
router.use('/:postId/comments', validateObjectId('postId'), commentsRouter);

export default router;
