import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import User, { IUserDocument } from '../models/User';
import comparePasswords from '../utils/comparePasswords';
import { BadRequestError, UnauthenticatedError, UnauthorizedError } from '../errors';
import {
    ApiResponse,
    UserRegisterSuccess,
    UserLoginBody,
    UserRegisterBody,
    UserLoginSuccess,
    UserLogoutSuccess,
    UserMeSuccess,
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

const logoutUser = (_req: Request, res: Response) => {
    const response: ApiResponse<UserLogoutSuccess> = {
        status: 'success',
        data: {
            message: 'Good bye!',
        },
    };
    res.status(StatusCodes.OK).json(response);
};

const me = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    try {
        const user: IUserDocument | null = await User.findById(userId);
        if (!user) {
            next(new UnauthenticatedError('User is not authenticated.'));
            return;
        }
        const response: ApiResponse<UserMeSuccess> = {
            status: 'success',
            data: {
                message: 'User retrieved successfuly',
                email: user?.email,
            },
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

export { registerUser, loginUser, logoutUser, me };
