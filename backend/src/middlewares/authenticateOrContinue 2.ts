/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * This middleware attempts to authenticate the user via JWT.
 * If a valid token is provided, it attaches the user info to req.user.
 * If no token or an invalid token is provided, it simply calls next()
 * without attaching any user info, allowing the request to proceed
 * as an unauthenticated request.
 *
 * Reasoning: Some routes may allow both authenticated and unauthenticated access.
 * For example, a public posts feed where logged-in users can see personalized
 * content but guests can still view general content. This middleware enables
 * that flexibility by not enforcing authentication strictly.
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types/express';

const authenticateOrContinue = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {
                userId: string;
            };
            // If token is valid, attach user to the request
            req.user = { userId: payload.userId };
        } catch (error) {
            // Errors are not thrown, allowing the request to proceed unauthenticated.
        }
    }
    // Proceed to the next middleware/controller, with or without req.user
    next();
};

export default authenticateOrContinue;
