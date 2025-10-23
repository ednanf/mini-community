import { AuthenticatedRequest } from '../types/express';
import { NextFunction, Response, Request } from 'express';
import {
    ApiResponse,
    UserDeleteSuccess,
    UserGetByIdSuccess,
    UserGetFollowingSuccess,
    UserGetFollowersSuccess,
    UserPatchBody,
    UserPatchSuccess,
    UserPublic,
    UserFollowSuccess,
    UserUnfollowSuccess,
    UserIsFollowingSuccess,
} from '../types/api';
import { BadRequestError, NotFoundError } from '../errors';
import User, { IUser } from '../models/User';
import { StatusCodes } from 'http-status-codes';
import { Types } from 'mongoose';
import Post from '../models/Post';
import Comment from '../models/Comment';

const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: profileUserId } = req.params;
        const currentUserId = (req as AuthenticatedRequest).user?.userId;
        const user = await User.findById(profileUserId).select(
            'nickname email bio avatarUrl followers following',
        );
        if (!user) {
            next(new NotFoundError('User was not found.'));
            return;
        }

        let isFollowing = false;
        if (currentUserId) {
            // Use the correct type for the followerId parameter
            isFollowing = user.followers.some(
                (followerId: Types.ObjectId) =>
                    followerId.toString() === currentUserId,
            );
        }

        const response: ApiResponse<UserGetByIdSuccess> = {
            status: 'success',
            data: {
                message: 'User fetched successfully.',
                id: user._id.toString(),
                nickname: user.nickname,
                email: user.email,
                bio: user.bio,
                avatarUrl: user.avatarUrl,
                followersCount: user.followers.length,
                followingCount: user.following.length,
                isFollowing: isFollowing,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const patchUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.user;
        const updatePayload: UserPatchBody = req.body;
        if (Object.keys(updatePayload).length === 0) {
            next(new BadRequestError('No valid update data provided.'));
            return;
        }

        const patchedUser = await User.findByIdAndUpdate(
            { _id: userId },
            updatePayload,
            {
                new: true,
                runValidators: true,
            },
        );
        if (!patchedUser) {
            new NotFoundError('User was not found.');
        }

        const response: ApiResponse<UserPatchSuccess> = {
            status: 'success',
            data: {
                message: 'User updated successfully.',
                nickname: patchedUser.nickname,
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

const deleteUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.user;

        const userToBeDeleted = await User.findById(userId);
        if (!userToBeDeleted) {
            new NotFoundError('User was not found.');
            return;
        }

        // Delete user's posts and comments, remove them from 'followers' and 'following' lists
        await Promise.all([
            Post.deleteMany({ createdBy: userId }),
            Comment.deleteMany({ createdBy: userId }),
            User.updateMany(
                { _id: { $in: userToBeDeleted.following } },
                { $pull: { followers: userId } },
            ),
            User.updateMany(
                { _id: { $in: userToBeDeleted.followers } },
                { $pull: { following: userId } },
            ),
            User.findByIdAndDelete(userId),
        ]);

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
};

const getUserFollowers = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.params;

        const user = await User.findById(userId)
            .select('followers')
            .populate('followers');
        if (!user) {
            next(new NotFoundError('User was not found.'));
            return;
        }

        const followersData: UserPublic[] = user.followers.map(
            (follower: IUser) => ({
                id: follower._id.toString(),
                email: follower.email,
                avatarUrl: follower.avatarUrl,
                bio: follower.bio,
            }),
        );

        const response: ApiResponse<UserGetFollowingSuccess> = {
            status: 'success',
            data: {
                message: "User's followers fetched successfully.",
                followers: followersData,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const getUserFollowing = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.params;

        const user = await User.findById(userId)
            .select('following')
            .populate('following');
        if (!user) {
            next(new NotFoundError('User was not found.'));
            return;
        }

        const followingData: UserPublic[] = user.following.map(
            (follower: IUser) => ({
                id: follower._id.toString(),
                email: follower.email,
                avatarUrl: follower.avatarUrl,
                bio: follower.bio,
            }),
        );

        const response: ApiResponse<UserGetFollowersSuccess> = {
            status: 'success',
            data: {
                message: "User's following list fetched successfully.",
                followers: followingData,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const followUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId: followerId } = req.user;
        const { id: followeeId } = req.params;

        if (followerId === followeeId) {
            next(new BadRequestError('You cannot follow yourself.'));
            return;
        }

        // Promise.all runs both updates concurrently for better performance.
        const [follower, followee] = await Promise.all([
            User.findByIdAndUpdate(
                followerId,
                { $addToSet: { following: followeeId } }, // $addToSet prevents duplicates
                { new: true },
            ),
            User.findByIdAndUpdate(
                followeeId,
                { $addToSet: { followers: followerId } },
                { new: true },
            ),
        ]);

        if (!follower || !followee) {
            next(
                new NotFoundError(
                    'Could not follow user. One or both users not found.',
                ),
            );
            return;
        }

        const response: ApiResponse<UserFollowSuccess> = {
            status: 'success',
            data: {
                message: 'User followed successfully.',
                followedUser: followee._id.toString(),
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const unfollowUser = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId: followerId } = req.user;
        const { id: followeeId } = req.params;

        if (followerId === followeeId) {
            next(new BadRequestError('You cannot unfollow yourself.'));
            return;
        }

        const [follower, followee] = await Promise.all([
            User.findByIdAndUpdate(
                followerId,
                { $pull: { following: followeeId } },
                { new: true },
            ),
            User.findByIdAndUpdate(
                followeeId,
                { $pull: { followers: followerId } },
                { new: true },
            ),
        ]);
        if (!follower || !followee) {
            next(
                new NotFoundError(
                    'Could not unfollow user. One or both users not found.',
                ),
            );
            return;
        }

        const response: ApiResponse<UserUnfollowSuccess> = {
            status: 'success',
            data: {
                message: 'User unfollowed successfully.',
                unfollowedUser: followee._id.toString(),
            },
        };
        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const isFollowing = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId: currentUserId } = req.user;
        const { id: otherUserId } = req.params;

        const otherUser = await User.findById(otherUserId).select('followers');

        if (!otherUser) {
            next(new NotFoundError('User was not found.'));
            return;
        }

        const isFollowing = otherUser.followers.some(
            (followerId: string) => followerId.toString() === currentUserId,
        );

        const response: ApiResponse<UserIsFollowingSuccess> = {
            status: 'success',
            data: {
                message:
                    'Successfully checked if user is following another user.',
                isFollowing,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

export {
    getUserById,
    patchUser,
    deleteUser,
    getUserFollowers,
    getUserFollowing,
    followUser,
    unfollowUser,
    isFollowing,
};
