// This middleware validates incoming requests against Zod schemas.
// It ensures that the request body matches the expected structure defined in the schemas.
// If validation fails, it throws a BadRequestError with a detailed message.
// If validation passes, it sanitizes the request body by stripping out any properties not defined in the schema.
import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { BadRequestError } from '../errors/index.js';

// Needed to silence TypeScript annoying the hell out of me with ZodIssue being deprecated despite not being true.
type ZIssue = z.ZodError<unknown>['issues'][number];

/**
 * Middleware factory for validating and sanitizing request bodies using a Zod schema.
 *
 * This middleware parses and validates `req.body` against the provided Zod schema.
 * If validation succeeds, `req.body` is replaced with the sanitized data.
 * If validation fails, a formatted 400 Bad Request error is passed to the next middleware.
 *
 * @param schema - The Zod schema to validate the request body against.
 * @returns An Express middleware function for request body validation.
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 * import express from "express";
 * import zodValidate from "./middlewares/zodValidate";
 *
 * const userSchema = z.object({
 *   name: z.string(),
 *   email: z.string().email(),
 * });
 *
 * const app = express();
 * app.use(express.json());
 *
 * app.post("/users", zodValidate(userSchema), (req, res) => {
 *   // req.body is now typed and sanitized
 *   res.json(req.body);
 * });
 * ```
 */
const zodValidate =
    (schema: z.Schema) => async (req: Request, _res: Response, next: NextFunction) => {
        try {
            // Zod's .parse method validates and throws an error if it fails.
            // It also strips out any properties not defined in the schema.
            // Therefore, req.body is replaced with the sanitized, validated data.
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // If it's a Zod error, we format it nicely and send a 400 response.
                const errorMessages = error.issues.map((issue: ZIssue) => issue.message).join('. ');
                next(new BadRequestError(errorMessages));
            } else {
                // For any other kind of error, pass it down the chain.
                next(error);
            }
        }
    };

export default zodValidate;
