import { z } from 'zod';

const userBaseSchema = z.object({
    avatarUrl: z.string().max(2048, { message: 'URL must contain a maximum of 2048 characters.' }),
    bio: z.string().max(280, { message: 'Bio must contain a maximum of 280 characters.' }),
    email: z.email(),
    password: z.string().min(6),
    nickname: z.string().min(3).max(10),
});

const userRegisterSchema = userBaseSchema
    .pick({
        nickname: true,
        email: true,
        password: true,
    })
    .extend({
        avatarUrl: userBaseSchema.shape.avatarUrl.optional(),
        bio: userBaseSchema.shape.bio.optional(),
    });

const userLoginSchema = userBaseSchema.pick({
    email: true,
    password: true,
});

const userPatchSchema = userBaseSchema.partial();

export { userRegisterSchema, userLoginSchema, userPatchSchema };
