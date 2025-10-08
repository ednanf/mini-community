import express, { RequestHandler } from 'express';
import { patchUser, deleteUser } from '../controllers/usersControllers';
import { xss } from 'express-xss-sanitizer';
import authenticate from '../middlewares/authenticate';
import validateWithZod from '../middlewares/validateWithZod';
import { userPatchSchema } from '../schemas/userSchemas';

const router = express.Router();

router.patch(
    '/me',
    xss(),
    authenticate,
    validateWithZod(userPatchSchema),
    patchUser as RequestHandler,
);
router.delete('/me', authenticate, deleteUser as RequestHandler);

export default router;
