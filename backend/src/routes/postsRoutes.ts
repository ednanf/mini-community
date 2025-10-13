import express from 'express';
import authenticate from '../middlewares/authenticate';
import { getPosts, createPost, getPostById, deletePost } from '../controllers/postsController';

const router = express.Router();

router.get('/', getPosts);
router.post('/', authenticate, createPost);
router.get('/:id', getPostById);
router.delete('/:id', authenticate, deletePost);

export default router;
