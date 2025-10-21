import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Comment, { IComment } from '../models/Comment';
import {
    ApiResponse,
    CommentCreateSuccess,
    CommentDeleteSuccess,
    CommentGetSuccess,
} from '../types/api';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, UnauthenticatedError } from '../errors';
import { AuthenticatedRequest } from '../types/express';
import Post from '../models/Post';

const getComments = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Get postId from route parameters
        const { postId } = req.params;

        // 2. Get 'limit' and 'cursor' from query parameters
        const { limit: queryLimit, cursor } = req.query;
        const limit = parseInt(queryLimit as string, 10) || 20; // Default limit to 20

        // 3. Database query, sorted by '_id' in descending order
        const query: {
            parentPost: string;
            _id?: { $lt: mongoose.Types.ObjectId };
        } = {
            parentPost: postId,
        };
        if (cursor && typeof cursor === 'string') {
            query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
        }

        // 4. Fetch one more item than the requested limit to check if there's a next page
        const comments: (IComment & { _id: mongoose.Types.ObjectId })[] =
            await Comment.find(query)
                .sort({ _id: -1 })
                .limit(limit + 1)
                .lean()
                .populate({ path: 'createdBy', select: 'nickname' });

        // 5. Check if there is a next page
        const hasNextPage = comments.length > limit;
        if (hasNextPage) {
            comments.pop(); // Remove the extra item used to check for next page
        }

        // 6. Determine the next cursor
        const nextCursor = hasNextPage
            ? comments[comments.length - 1]._id.toString()
            : null;

        const response: ApiResponse<CommentGetSuccess> = {
            status: 'success',
            data: {
                message: 'Comments retrieved successfully',
                comments: comments,
                nextCursor,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

const createComment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.user; // Retrieved from authentication middleware
        if (!userId) {
            next(new UnauthenticatedError('User not authenticated'));
            return;
        }

        const { postId } = req.params; // Validated by middleware
        if (!postId) {
            next(new NotFoundError('Post not found'));
            return;
        }

        const { commentContent } = req.body; // Validated by middleware

        // Create the new comment to get its _id
        const newComment = await Comment.create({
            createdBy: userId,
            parentPost: postId,
            commentContent,
        });

        // Update the parent Post by pushing the new comment's _id
        await Post.findByIdAndUpdate(postId, {
            $push: { postComments: newComment._id },
        });

        const response: ApiResponse<CommentCreateSuccess> = {
            status: 'success',
            data: {
                message: 'Comment created successfully',
                commentContent: newComment,
            },
        };

        res.status(StatusCodes.CREATED).json(response);
    } catch (error) {
        next(error);
    }
};

const deleteComment = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            next(new UnauthenticatedError('User not authenticated'));
            return;
        }

        const { id: commentId } = req.params; // Validated by middleware

        const commentToDelete = await Comment.findOneAndDelete({
            _id: commentId,
            createdBy: userId,
        });

        if (!commentToDelete) {
            next(
                new NotFoundError(
                    'Comment not found or user not authorized to delete this comment.',
                ),
            );
            return;
        }

        const response: ApiResponse<CommentDeleteSuccess> = {
            status: 'success',
            data: {
                message: 'Comment deleted successfully',
                deletedCommentId: commentId,
            },
        };

        res.status(StatusCodes.OK).json(response);
    } catch (error) {
        next(error);
    }
};

export { getComments, createComment, deleteComment };
