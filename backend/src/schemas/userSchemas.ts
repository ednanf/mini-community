import { z } from 'zod';

const registerUserSchema = z.object({
  email: z.email({ message: 'Email must contain only valid characters.' }),
  password: z
    .string({ message: 'Password must contain only valid characters.' })
    .min(6, { message: 'Password must contain at least 6 characters.' }),
});

const loginUserSchema = registerUserSchema;

export { registerUserSchema, loginUserSchema };
