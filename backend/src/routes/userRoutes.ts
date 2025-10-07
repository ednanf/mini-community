import express from 'express';
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

// TODO: Add xss sanitization (dependency)
// TODO: Add authentication middleware (custom)

router.post('/register', validateWithZod(userRegisterSchema), registerUser);
router.post('/login', validateWithZod(userLoginSchema), loginUser);
router.patch('/patch', validateWithZod(userPatchSchema), patchUser);
router.post('/logout', logoutUser);
router.delete('/delete', deleteUser);

export default router;
