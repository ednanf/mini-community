import { AuthenticatedRequest } from '../types/express';
import { NextFunction, Response } from 'express';
import { ApiResponse, UserDeleteSuccess, UserPatchBody, UserPatchSuccess } from '../types/api';
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

const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { userId } = req.user;
    try {
        // TODO: Also delete all posts, comments, likes, followers, following, etc. as exemplified below
        // await Category.deleteMany({ createdBy: userId });
        // await Transaction.deleteMany({ createdBy: userId });
        const userToBeDeleted = await User.findByIdAndDelete(userId);
        if (!userToBeDeleted) {
            new NotFoundError('User was not found.');
            return;
        }
        const response: ApiResponse<UserDeleteSuccess> = {
            status: 'success',
            data: {
                message: 'User deleted successfully.',
                email: userToBeDeleted.email,
            },
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
    res.status(StatusCodes.OK).json({ msg: 'delete user hit' });
};

export { patchUser, deleteUser };
