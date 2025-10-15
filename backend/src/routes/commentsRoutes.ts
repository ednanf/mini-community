import express, { RequestHandler } from 'express';
import { xss } from 'express-xss-sanitizer';
import authenticate from '../middlewares/authenticate';
import { getComments, createComment, deleteComment } from '../controllers/commentController';
import validateWithZod from '../middlewares/validateWithZod';
import commentCreateSchema from '../schemas/commentSchemas';
import validateObjectId from '../middlewares/validateObjectId';

const router = express.Router({ mergeParams: true }); // mergeParams to access parent route (posts) params

router
    .route('/')
    .get(getComments)
    .post(
        authenticate,
        xss(),
        validateWithZod(commentCreateSchema),
        createComment as RequestHandler,
    );

router.delete('/:id', authenticate, validateObjectId('id'), deleteComment as RequestHandler);

export default router;
