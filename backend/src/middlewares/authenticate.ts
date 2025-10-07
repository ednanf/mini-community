// This middleware authenticates requests using JWTs.
// It checks for the presence of a Bearer token in the Authorization header,
// verifies the token, and extracts the user ID from the payload.

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError, InternalServerError } from '../errors/index.js';

interface UserPayload extends JwtPayload {
    userId: string;
}

/**
 * Type guard to check if a given payload is a valid `UserPayload` object.
 *
 * This function verifies that the input is a non-null object and contains a `userId` property of type `string`.
 *
 * @param payload - The value to check.
 * @returns `true` if the payload is a `UserPayload`, otherwise `false`.
 */
const isUserPayload = (payload: unknown): payload is UserPayload =>
    typeof payload === 'object' &&
    payload !== null &&
    'userId' in payload &&
    typeof (payload as Record<string, unknown>).userId === 'string';

/**
 * Express middleware to authenticate requests using a JWT Bearer token.
 *
 * This middleware checks for the presence of an `Authorization` header with the format `Bearer <token>`.
 * It verifies the JWT using the secret defined in the `JWT_SECRET` environment variable.
 * If the token is valid and contains the required user information, the user's ID is attached to `req.user`.
 * Otherwise, it forwards an appropriate error to the next middleware.
 *
 * @param req - Express request object, expected to have an `Authorization` header.
 * @param _res - Express response object (unused).
 * @param next - Express next middleware function.
 *
 * @throws {UnauthorizedError} If the authorization header is missing, malformed, or the token is invalid.
 * @throws {InternalServerError} If the JWT secret is not configured.
 *
 * @example
 * import express from 'express';
 * import { authenticate } from './middlewares/authenticate';
 *
 * const app = express();
 *
 * // Protect all routes under /api
 * app.use('/api', authenticate);
 *
 * app.get('/api/profile', (req, res) => {
 *   // Access user ID from req.user
 *   res.json({ userId: req.user.userId });
 * });
 */
const authenticate = (req: Request, _res: Response, next: NextFunction) => {
    const authHeader: string | undefined = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next(
            new UnauthorizedError(
                "Authorization header missing or malformed. Expected format: Bearer 'token'.",
            ),
        );
        return;
    }

    const token: string = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        console.error('JWT_SECRET is not defined in environment variables');
        next(
            new InternalServerError(
                'Server misconfiguration: JWT_SECRET environment variable is not set.',
            ),
        );
        return;
    }

    try {
        const payload = jwt.verify(token, secret) as JwtPayload;
        if (!isUserPayload(payload)) {
            next(
                new UnauthorizedError(
                    'JWT payload missing required userId. Token structure invalid.',
                ),
            );
            return;
        }

        // Extract userId from the verified JWT payload and attach it to req.user.
        // This is the ONLY way downstream code should access user identity!
        req.user = { userId: payload.userId };
        next();
    } catch (error) {
        console.error('Error verifying JWT token:', error);
        next(
            new UnauthorizedError(
                'JWT verification failed: token is invalid, expired, or tampered with.',
            ),
        );
    }
};

export default authenticate;
