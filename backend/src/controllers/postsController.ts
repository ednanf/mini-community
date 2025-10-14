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
import { BadRequestError, NotFoundError, UnauthenticatedError } from '../errors';

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
        const posts: (IPost & { _id: mongoose.Types.ObjectId })[] = await Post.find(query)
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();

        // 4. Check if there is a next page
        const hasNextPage = posts.length > limit;
        if (hasNextPage) {
            posts.pop(); // Remove the extra item used to check for next page
        }

        // 5. Determine the next cursor
        // It's the _id of the *last* item in the current list, if there isn't a next page, it's null
        const nextCursor = hasNextPage ? posts[posts.length - 1]._id.toString() : null;

        const response: ApiResponse<PostsGetSuccess> = {
            status: 'success',
            data: {
                message: 'Posts retrieved successfully',
                content: posts,
                nextCursor,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            next(new UnauthenticatedError('User not authenticated.'));
            return;
        }

        const { content } = req.body;
        if (!content) {
            next(new BadRequestError('You cannot make an empty post.'));
            return;
        }

        const newPost: IPost = await Post.create({ createdBy: userId, content });

        const response: ApiResponse<PostCreateSuccess> = {
            status: 'success',
            data: {
                message: 'Post created successfully',
                content: newPost,
            },
        };

        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        next(error);
    }
};

const getPostById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params; // Validated by middleware

        const post = await Post.findOne({ _id: id });
        if (!post) {
            next(new NotFoundError('Post not found.'));
            return;
        }

        const response: ApiResponse<PostGetByIdSuccess> = {
            status: 'success',
            data: {
                message: 'Post retrieved successfully',
                content: post,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const deletePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const { id: postId } = req.params;
        const { userId } = req.user;

        const postToDelete = await Post.findOneAndDelete({ _id: postId, createdBy: userId });
        if (!postToDelete) {
            next(new NotFoundError('Post not found or you do not have permission to delete it.'));
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

export { getPosts, createPost, getPostById, deletePost };
