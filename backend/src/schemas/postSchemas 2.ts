import { z } from 'zod';

const postBaseSchema = z.object({
    content: z
        .string()
        .min(1, { message: 'You cannot create an empty post.' })
        .max(140, { message: 'Your post must be at most 140 characters long.' }),
});

const postCreateSchema = postBaseSchema.pick({
    content: true,
});

export default postCreateSchema;
