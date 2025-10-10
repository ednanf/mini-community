import express, { RequestHandler } from 'express';
import {
    patchUser,
    deleteUser,
    getUserById,
    getUserFollowers,
    getUserFollowing,
    followUser,
    unfollowUser,
} from '../controllers/usersControllers';
import { xss } from 'express-xss-sanitizer';
import authenticate from '../middlewares/authenticate';
import authenticateOrContinue from '../middlewares/authenticateOrContinue';
import validateWithZod from '../middlewares/validateWithZod';
import { userPatchSchema } from '../schemas/userSchemas';

const router = express.Router();

router.get('/:id', authenticateOrContinue, getUserById);
router.patch(
    '/me',
    xss(),
    authenticate,
    validateWithZod(userPatchSchema),
    patchUser as RequestHandler,
);
router.delete('/me', authenticate, deleteUser as RequestHandler);
router.get('/:id/followers', authenticate, getUserFollowers);
router.get('/:id/following', authenticate, getUserFollowing);
router.post('/follow/:id', authenticate, followUser as RequestHandler);
router.post('/unfollow/:id', authenticate, unfollowUser as RequestHandler);

export default router;
