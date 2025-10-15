import express from 'express';
import authenticate from '../middlewares/authenticate';
import { getComments, createComment, deleteComment } from '../controllers/commentController';
import validateObjectId from '../middlewares/validateObjectId';

const router = express.Router({ mergeParams: true }); // mergeParams to access parent route (posts) params

// TODO: Add sanitization

router.route('/').get(getComments).post(authenticate, createComment);

router.delete('/:id', authenticate, validateObjectId('id'), deleteComment);

export default router;
