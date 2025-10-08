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
import validateWithZod from '../middlewares/validateWithZod';
import { userPatchSchema } from '../schemas/userSchemas';

const router = express.Router();

router.get('/:id', getUserById);
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
router.post('/:id/follow', authenticate, followUser as RequestHandler);
router.post('/:id/unfollow', authenticate, unfollowUser as RequestHandler);

export default router;
