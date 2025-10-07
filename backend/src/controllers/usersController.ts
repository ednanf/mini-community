import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import User, { IUserDocument } from '../models/User';
import { ApiResponse, RegisterUserSuccess } from '../types/api';

const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
        const newUser: IUserDocument = await User.create({ email, password });
        const token = await newUser.createJWT();
        const response: ApiResponse<RegisterUserSuccess> = {
            status: 'success',
            data: {
                message: 'User registered successfully.',
                user: newUser.email,
                token,
            },
        };
        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        next(error);
    }
};

const loginUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json({ msg: 'login user hit' });
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
