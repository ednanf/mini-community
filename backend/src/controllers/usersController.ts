import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import User, { IUserDocument } from '../models/User';
import {
    ApiResponse,
    UserRegisterSuccess,
    UserLoginBody,
    UserRegisterBody,
    UserLoginSuccess,
} from '../types/api';
import { BadRequestError, UnauthorizedError } from '../errors';
import comparePasswords from '../utils/comparePasswords';

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

const patchUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json({ msg: 'patch user hit' });
};

const logoutUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json({ msg: 'logout user hit' });
};

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json({ msg: 'delete user hit' });
};

export { registerUser, loginUser, patchUser, logoutUser, deleteUser };
