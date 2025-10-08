import { AuthenticatedRequest } from '../types/express';
import { NextFunction, Request, Response } from 'express';
import { ApiResponse, UserPatchBody, UserPatchSuccess } from '../types/api';
import { BadRequestError, NotFoundError } from '../errors';
import User from '../models/User';
import { StatusCodes } from 'http-status-codes';

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

const deleteUser = (req: Request, res: Response, next: NextFunction) => {
    res.status(StatusCodes.OK).json({ msg: 'delete user hit' });
};
