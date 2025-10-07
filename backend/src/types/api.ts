import { z } from 'zod';
import { userLoginSchema, userPatchSchema, userRegisterSchema } from '../schemas/userSchemas';

/*
 * Generic types
 * **/
export interface ApiResponse<T = never> {
    status: 'success' | 'error';
    data: T;
}

/*
 * Error-related types
 * **/
export interface ApiError {
    message: string;
}

export interface MongoDatabaseError {
    code: number;
    message: string;
}

/*
 * User-related types
 * **/
// Use zod schema to infer the type (more consistent)
export type UserRegisterBody = z.infer<typeof userRegisterSchema>;

export type UserLoginBody = z.infer<typeof userLoginSchema>;

export type UserPatchBody = z.infer<typeof userPatchSchema>;

export interface UserBase {
    message: string;
    email: string;
}

export interface UserRegisterSuccess extends UserBase {
    token: string;
}

export interface UserLoginSuccess extends UserBase {
    token: string;
}

export interface UserPatchSuccess extends UserBase {
    avatarUrl?: string;
    bio?: string;
}
