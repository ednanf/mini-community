import { Request, Response, NextFunction, RequestHandler } from 'express';
import mongoose from 'mongoose';
import { BadRequestError } from '../errors/index.js';

/**
 * Middleware to validate if a request parameter is a valid MongoDB ObjectId.
 *
 * This middleware dynamically validates a specific parameter in the request
 * (e.g., `id`) to ensure it is a valid MongoDB ObjectId. If the parameter is
 * missing or invalid, it throws a `BadRequestError`. Otherwise, it allows the
 * request to proceed to the next middleware or route handler.
 *
 * @param {string} paramName - The name of the parameter in the request to validate.
 * @returns {Function} - An Express middleware function.
 *
 * Usage:
 * - Attach this middleware to routes where you need to validate a MongoDB ObjectId.
 * - Example: `router.get('/posts/:id', validateObjectId('id'), getPostById);`
 *
 * Error Handling:
 * - If the parameter is missing, it calls `next` with a `BadRequestError` stating "Missing {paramName}".
 * - If the parameter is not a valid ObjectId, it calls `next` with a `BadRequestError` stating "Invalid {paramName} format".
 */
const validateObjectId =
    (paramName: string): RequestHandler =>
    (req: Request, _res: Response, next: NextFunction): void => {
        const id = req.params[paramName];

        // Check if the parameter is missing
        if (!id) {
            next(new BadRequestError(`Missing ${paramName}`));
            return;
        }

        // Check if the parameter is not a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            next(new BadRequestError(`Invalid ${paramName} format`));
            return;
        }

        // If valid, proceed to the next middleware or route handler
        next();
    };

export default validateObjectId;
