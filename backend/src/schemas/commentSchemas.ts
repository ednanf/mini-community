import { z } from 'zod';

const commentBaseSchema = z.object({
    commentContent: z
        .string()
        .min(1, { message: 'You cannot create an empty comment.' })
        .max(140, {
            message: 'Your comment must be at most 140 characters long.',
        }),
});

const commentCreateSchema = commentBaseSchema.pick({
    commentContent: true,
});

export default commentCreateSchema;
