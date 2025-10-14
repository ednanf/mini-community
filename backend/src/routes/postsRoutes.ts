import express, { RequestHandler } from 'express';
import authenticate from '../middlewares/authenticate';
import { getPosts, createPost, getPostById, deletePost } from '../controllers/postsController';
import validateObjectId from '../middlewares/validateObjectId';

const router = express.Router();

router.get('/', getPosts);
router.post('/', authenticate, createPost as RequestHandler);
router
    .route('/:id')
    .get(validateObjectId('id'), getPostById)
    .delete(authenticate, validateObjectId('id'), deletePost as RequestHandler);

export default router;
