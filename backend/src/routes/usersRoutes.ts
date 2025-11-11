import express, { RequestHandler } from 'express';
import {
    patchUser,
    deleteUser,
    getUserById,
    getUserFollowers,
    getUserFollowing,
    followUser,
    unfollowUser,
    isFollowing,
} from '../controllers/usersControllers.js';
import { xss } from 'express-xss-sanitizer';
import authenticate from '../middlewares/authenticate.js';
import authenticateOrContinue from '../middlewares/authenticateOrContinue.js';
import validateWithZod from '../middlewares/validateWithZod.js';
import { userPatchSchema } from '../schemas/userSchemas.js';

const router = express.Router();

router.get('/:id', authenticateOrContinue as RequestHandler, getUserById);
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
router.get('/:id/is-following', authenticate, isFollowing as RequestHandler);

export default router;
