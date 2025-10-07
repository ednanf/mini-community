import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import User, { IUserDocument } from '../models/User';
import comparePasswords from '../utils/comparePasswords';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors';
import {
    ApiResponse,
    UserRegisterSuccess,
    UserLoginBody,
    UserRegisterBody,
    UserLoginSuccess,
    UserPatchBody,
    UserPatchSuccess,
    UserLogoutSuccess,
} from '../types/api';
import { AuthenticatedRequest } from '../types/express';

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: UserRegisterBody = req.body;
    try {
        const newUser: IUserDocument = await User.create({ email, password });
        const token = await newUser.createJWT();
        const response: ApiResponse<UserRegisterSuccess> = {
            status: 'success',
            data: {
                message: 'User registered successfully.',
                email: newUser.email,
                token,
            },
        };
        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        next(error);
    }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password }: UserLoginBody = req.body;
    if (!email || !password) {
        next(new BadRequestError('Email and password are required'));
        return;
    }
    try {
        // .select('+password') includes password field for verification
        const candidateUser = await User.findOne<IUserDocument>({ email }).select('+password');
        if (!candidateUser) {
            next(new UnauthorizedError('There is an issue with your email or password'));
            return;
        }
        const isPasswordValid = await comparePasswords(password, candidateUser.password);
        if (!isPasswordValid) {
            next(new UnauthorizedError('There is an issue with your email or password.'));
            return;
        }
        const token = await candidateUser.createJWT();
        const response: ApiResponse<UserLoginSuccess> = {
            status: 'success',
            data: {
                message: 'Log in successful. Welcome back!',
                email: candidateUser.email,
                token,
            },
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const patchUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    const updatePayload: UserPatchBody = req.body;
    if (Object.keys(updatePayload).length === 0) {
        next(new BadRequestError('No valid update data provided.'));
        return;
    }
    try {
        const patchedUser = await User.findByIdAndUpdate({ _id: userId }, updatePayload, {
            new: true,
            runValidators: true,
        });
        if (!patchedUser) {
            new NotFoundError('User was not found.');
        }
        const response: ApiResponse<UserPatchSuccess> = {
            status: 'success',
            data: {
                message: 'User updated successfully.',
                email: patchedUser.email,
                bio: patchedUser.bio,
                avatarUrl: patchedUser.avatarUrl,
            },
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const logoutUser = (_req: Request, res: Response) => {
    const response: ApiResponse<UserLogoutSuccess> = {
        status: 'success',
        data: {
            message: 'Good bye!',
        },
    };
    res.status(StatusCodes.OK).json(response);
};

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json({ msg: 'delete user hit' });
};

export { registerUser, loginUser, patchUser, logoutUser, deleteUser };
