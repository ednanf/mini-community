/* eslint-disable */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import type { ApiError, ApiResponse, MongoDatabaseError } from '../types/api.js';
import { HttpError } from '../errors/index.js';
import { isMongoDuplicateError } from '../errors/MongoDuplicateError.js';

/**
 * Logs detailed information about an error, including a timestamp and a unique error ID.
 *
 * If the error is an object with a `message` property, it logs the message and, if available, the stack trace.
 * Otherwise, it logs the error as an unknown error.
 *
 * @param error - The error to log. Can be of any type.
 * @param errorId - A unique identifier for the error instance, useful for tracing and debugging.
 *
 * @example
 * try {
 *   // Some code that may throw
 * } catch (err) {
 *   const errorId = crypto.randomUUID();
 *   logError(err, errorId);
 * }
 */
const logError = (error: unknown, errorId: string) => {
    const timestamp = new Date().toISOString();
    if (typeof error === 'object' && error !== null && 'message' in error) {
        console.error(`[${timestamp}] [ErrorID: ${errorId}] Error: ${(error as any).message}`);
        if ('stack' in error) {
            console.error((error as any).stack);
        }
    } else {
        console.error(`[${timestamp}] [ErrorID: ${errorId}] Unknown error:`, error);
    }
};

/**
 * Express error-handling middleware that standardizes API error responses.
 *
 * Handles custom `HttpError` instances, MongoDB duplicate key errors, and unknown errors.
 * For known errors, it returns a structured JSON response with appropriate HTTP status codes.
 * For unknown errors, it logs the error with a unique ID and returns a generic error response.
 *
 * @param err - The error object thrown in the request pipeline.
 * @param _req - The Express request object (unused).
 * @param res - The Express response object.
 * @param _next - The next middleware function (unused).
 *
 * @example
 * // Usage in an Express app:
 * import express from 'express';
 * import { errorHandler } from './middlewares/errorHandler';
 *
 * const app = express();
 *
 * // ... your routes here ...
 *
 * // Register the error handler as the last middleware
 * app.use(errorHandler);
 */
const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    // Custom HttpError
    if (err instanceof HttpError) {
        const response: ApiResponse<ApiError> = {
            status: 'error',
            data: {
                message: err.message,
            },
        };
        res.status(err.statusCode).json(response);
        return;
    }

    // MongoDB duplicate key error
    if (isMongoDuplicateError(err)) {
        const keyName = Object.keys((err as any).cause?.keyValue || {}).join(', ');
        const capitalizedKeyName = keyName.charAt(0).toUpperCase() + keyName.slice(1);
        const response: ApiResponse<MongoDatabaseError> = {
            status: 'error',
            data: {
                code: (err as any).cause?.code || StatusCodes.INTERNAL_SERVER_ERROR,
                message: `${capitalizedKeyName} already exists.`,
            },
        };
        res.status(StatusCodes.CONFLICT).json(response);
        return;
    }

    // Fallback for unknown errors
    const errorId = crypto.randomUUID();
    logError(err, errorId);

    const message =
        typeof err === 'object' && err !== null && 'message' in err
            ? String((err as any).message)
            : 'Internal Server Error';

    const response: ApiResponse<ApiError & { errorId: string }> = {
        status: 'error',
        data: {
            message,
            errorId,
        },
    };

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(response);
};

export default errorHandler;
