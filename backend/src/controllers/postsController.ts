import { Request, Response, NextFunction } from 'express';
import Post, { IPost } from '../models/Post';
import mongoose from 'mongoose';
import {
    ApiResponse,
    PostCreateSuccess,
    PostDeleteSuccess,
    PostGetByIdSuccess,
    PostsGetSuccess,
} from '../types/api';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../types/express';
import { NotFoundError, UnauthenticatedError } from '../errors';
import User from '../models/User';

interface UserWithFollowing {
    following: mongoose.Types.ObjectId[];
}

const getPosts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Get 'limit' and 'cursor' from query parameters
        const { limit: queryLimit, cursor } = req.query;
        const limit = parseInt(queryLimit as string, 10) || 20; // Default limit to 20

        // 2. Database query, sorted by '_id' in descending order
        const query: { _id?: { $lt: mongoose.Types.ObjectId } } = {};
        if (cursor && typeof cursor === 'string') {
            // If a cursor is provided, fetch items with _id less than (older than) the cursor
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        // 3. Fetch one more item than the requested limit to check if there's a next page
        // Best approach to avoid a second DB query
        const posts: (IPost & { _id: mongoose.Types.ObjectId })[] =
            await Post.find(query)
                .sort({ _id: -1 })
                .limit(limit + 1)
                .lean()
                .populate({ path: 'createdBy', select: 'nickname' });

        // 4. Check if there is a next page
        const hasNextPage = posts.length > limit;
        if (hasNextPage) {
            posts.pop(); // Remove the extra item used to check for next page
        }

        // 5. Determine the next cursor
        // It's the _id of the *last* item in the current list, if there isn't a next page, it's null
        const nextCursor = hasNextPage
            ? posts[posts.length - 1]._id.toString()
            : null;

        const response: ApiResponse<PostsGetSuccess> = {
            status: 'success',
            data: {
                message: 'Posts retrieved successfully',
                posts: posts,
                nextCursor,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const createPost = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            next(new UnauthenticatedError('User not authenticated.'));
            return;
        }

        const { postContent } = req.body; // Validated by middleware

        const newPost: IPost = await Post.create({
            createdBy: userId,
            postContent,
        });

        const response: ApiResponse<PostCreateSuccess> = {
            status: 'success',
            data: {
                message: 'Post created successfully',
                postContent: newPost,
            },
        };

        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        next(error);
    }
};

const getMyPosts = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            next(new UnauthenticatedError('User not authenticated.'));
            return;
        }

        // 1. Get 'limit' and 'cursor' from query parameters
        const { limit: queryLimit, cursor } = req.query;
        const limit = parseInt(queryLimit as string, 10) || 20; // Default limit to 20

        // 2. Database query, sorted by '_id' in descending order
        const query: {
            createdBy: mongoose.Types.ObjectId;
            _id?: { $lt: mongoose.Types.ObjectId };
        } = {
            createdBy: new mongoose.Types.ObjectId(userId),
        };

        if (cursor && typeof cursor === 'string') {
            // If a cursor is provided, fetch items with _id less than (older than) the cursor
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        // 3. Fetch one more item than the requested limit to check if there's a next page
        const posts: (IPost & { _id: mongoose.Types.ObjectId })[] =
            await Post.find(query)
                .sort({ _id: -1 })
                .limit(limit + 1)
                .lean()
                .populate({ path: 'createdBy', select: 'nickname' });

        // 4. Check if there is a next page
        const hasNextPage = posts.length > limit;
        if (hasNextPage) {
            posts.pop(); // Remove the extra item used to check for next page
        }

        // 5. Determine the next cursor
        const nextCursor = hasNextPage
            ? posts[posts.length - 1]._id.toString()
            : null;

        const response: ApiResponse<PostsGetSuccess> = {
            status: 'success',
            data: {
                message: 'Your own posts retrieved successfully',
                posts: posts,
                nextCursor,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const getFollowedUsersPosts = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            next(new UnauthenticatedError('User not authenticated.'));
            return;
        }

        // 1. Find the current user to get their 'following' list
        const user = await User.findById(userId)
            .select('following')
            .lean<UserWithFollowing>();
        if (!user) {
            next(new NotFoundError('User not found.'));
            return;
        }

        // 2. Create a list of authors to fetch posts from.
        // This includes the authenticated user and the users they follow.
        const authorsToFetch = [
            new mongoose.Types.ObjectId(userId),
            ...(user.following || []),
        ];

        // 3. Get 'limit' and 'cursor' from query parameters
        const { limit: queryLimit, cursor } = req.query;
        const limit = parseInt(queryLimit as string, 10) || 20; // Default limit to 20

        // 4. Database query to fetch posts from the author list
        const query: {
            createdBy: { $in: mongoose.Types.ObjectId[] };
            _id?: { $lt: mongoose.Types.ObjectId };
        } = {
            createdBy: { $in: authorsToFetch },
        };

        if (cursor && typeof cursor === 'string') {
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        // 5. Fetch one more item than the requested limit
        const posts: (IPost & { _id: mongoose.Types.ObjectId })[] =
            await Post.find(query)
                .sort({ _id: -1 })
                .limit(limit + 1)
                .lean()
                .populate({ path: 'createdBy', select: 'nickname' });

        // 6. Check for next page and determine the next cursor
        const hasNextPage = posts.length > limit;
        if (hasNextPage) {
            posts.pop();
        }

        const nextCursor = hasNextPage
            ? posts[posts.length - 1]._id.toString()
            : null;

        const response: ApiResponse<PostsGetSuccess> = {
            status: 'success',
            data: {
                message: 'Your feed posts retrieved successfully',
                posts: posts,
                nextCursor,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const getPostsByUserId = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: userId } = req.params; // Get user ID from URL params

        // 1. Get 'limit' and 'cursor' from query parameters
        const { limit: queryLimit, cursor } = req.query;
        const limit = parseInt(queryLimit as string, 10) || 20; // Default limit to 20

        // 2. Database query, sorted by '_id' in descending order
        const query: {
            createdBy: mongoose.Types.ObjectId;
            _id?: { $lt: mongoose.Types.ObjectId };
        } = {
            createdBy: new mongoose.Types.ObjectId(userId),
        };

        if (cursor && typeof cursor === 'string') {
            // If a cursor is provided, fetch items with _id less than (older than) the cursor
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        // 3. Fetch one more item than the requested limit to check if there's a next page
        const posts: (IPost & { _id: mongoose.Types.ObjectId })[] =
            await Post.find(query)
                .sort({ _id: -1 })
                .limit(limit + 1)
                .lean()
                .populate({ path: 'createdBy', select: 'nickname' });

        // 4. Check if there is a next page
        const hasNextPage = posts.length > limit;
        if (hasNextPage) {
            posts.pop(); // Remove the extra item used to check for next page
        }

        // 5. Determine the next cursor
        const nextCursor = hasNextPage
            ? posts[posts.length - 1]._id.toString()
            : null;

        const response: ApiResponse<PostsGetSuccess> = {
            status: 'success',
            data: {
                message: `Posts by user ${userId} retrieved successfully`,
                posts: posts,
                nextCursor,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Validated by middleware

        const post = await Post.findOne({ _id: id }).populate({
            path: 'postComments',
            select: 'commentContent createdBy',
            populate: { path: 'createdBy', select: 'nickname' },
        });

        if (!post) {
            next(new NotFoundError('Post not found.'));
            return;
        }

        const response: ApiResponse<PostGetByIdSuccess> = {
            status: 'success',
            data: {
                message: 'Post retrieved successfully',
                postContent: post,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const deletePost = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id: postId } = req.params;
        const { userId } = req.user;

        const postToDelete = await Post.findOneAndDelete({
            _id: postId,
            createdBy: userId,
        });
        if (!postToDelete) {
            next(
                new NotFoundError(
                    'Post not found or you do not have permission to delete it.',
                ),
            );
            return;
        }

        const response: ApiResponse<PostDeleteSuccess> = {
            status: 'success',
            data: {
                message: 'Post deleted successfully',
                deletedPostId: postToDelete._id.toString(),
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

export {
    getPosts,
    createPost,
    getMyPosts,
    getFollowedUsersPosts,
    getPostsByUserId,
    getPostById,
    deletePost,
};
