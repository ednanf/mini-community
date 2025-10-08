import express, { RequestHandler } from 'express';
import { xss } from 'express-xss-sanitizer';
import authenticate from '../middlewares/authenticate';
import validateWithZod from '../middlewares/validateWithZod';
import { registerUser, loginUser, logoutUser, me } from '../controllers/authController';
import { userRegisterSchema, userLoginSchema } from '../schemas/userSchemas';

const router = express.Router();

router.post('/register', xss(), validateWithZod(userRegisterSchema), registerUser);
router.post('/login', xss(), validateWithZod(userLoginSchema), loginUser);

router.post('/logout', logoutUser);
router.get('/me', authenticate, me as RequestHandler);

export default router;
