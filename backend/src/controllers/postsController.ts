import { Request, Response, NextFunction } from 'express';
import Post, { IPost } from '../models/Post';
import mongoose from 'mongoose';
import { ApiResponse, PostCreateSuccess, PostRetrieveSuccess } from '../types/api';
import { StatusCodes } from 'http-status-codes';
import { AuthenticatedRequest } from '../types/express';
import { BadRequestError, UnauthenticatedError } from '../errors';

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

        const response: ApiResponse<PostRetrieveSuccess> = {
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
    res.status(201).json({ message: 'Create a new post' });
};

const getPostById = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    res.status(200).json({ message: `Get post with ID: ${id}` });
};

const deletePost = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    res.status(200).json({ message: `Delete post with ID: ${id}` });
};

export { getPosts, createPost, getPostById, deletePost };
