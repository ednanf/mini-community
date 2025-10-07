import express, { RequestHandler } from 'express';
import { xss } from 'express-xss-sanitizer';
import authenticate from '../middlewares/authenticate';
import validateWithZod from '../middlewares/validateWithZod';
import {
    registerUser,
    loginUser,
    logoutUser,
    deleteUser,
    patchUser,
} from '../controllers/usersController';
import { userRegisterSchema, userLoginSchema, userPatchSchema } from '../schemas/userSchemas';

const router = express.Router();

router.post('/register', xss(), validateWithZod(userRegisterSchema), registerUser);
router.post('/login', xss(), validateWithZod(userLoginSchema), loginUser);
// Type assertion is needed because AuthenticatedRequest is being used instead of Request in the controller (see also express.d.ts)
router.patch(
    '/patch',
    xss(),
    authenticate,
    validateWithZod(userPatchSchema),
    patchUser as RequestHandler,
);
router.post('/logout', logoutUser);
router.delete('/delete', deleteUser);

export default router;
