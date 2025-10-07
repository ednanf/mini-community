// This file is used to extend the Express Request interface
// to include a user property that holds the authenticated user's ID.
import { Request } from 'express';

export {};

declare global {
    namespace Express {
        interface Request {
            user?: { userId: string };
        }
    }
}

export interface AuthenticatedRequest extends Request {
    user: { userId: string };
}
