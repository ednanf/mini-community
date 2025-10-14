import { z } from 'zod';
import { userLoginSchema, userPatchSchema, userRegisterSchema } from '../schemas/userSchemas';
import { IPost } from '../models/Post';

/*
 * Generic types
 * **/
export interface ApiResponse<T = never> {
    status: 'success' | 'error';
    data: T;
}

/*
 * Error types
 * **/
export interface ApiError {
    message: string;
}

export interface MongoDatabaseError {
    code: number;
    message: string;
}

/**
 * User authentication types
 * */
// Use zod schema to infer the type (more consistent)
export type UserRegisterBody = z.infer<typeof userRegisterSchema>;

export type UserLoginBody = z.infer<typeof userLoginSchema>;

export interface UserBase {
    message: string;
    nickname: string;
    email: string;
}

export interface UserRegisterSuccess extends UserBase {
    token: string;
}

export interface UserLoginSuccess extends UserBase {
    token: string;
}

export interface UserLogoutSuccess {
    message: string;
}

export interface UserMeSuccess extends UserBase {
    id: string;
}

/*
 * User types
 * **/
export type UserPatchBody = z.infer<typeof userPatchSchema>;

export interface UserGetByIdSuccess extends UserBase {
    id: string;
    avatarUrl?: string;
    bio?: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
}

export interface UserPatchSuccess extends UserBase {
    avatarUrl?: string;
    bio?: string;
}

export interface UserDeleteSuccess {
    message: string;
    email: string;
}

export interface UserPublic {
    id: string;
    email: string;
    avatarUrl?: string;
    bio?: string;
}

export interface UserGetFollowingSuccess {
    message: string;
    followers: UserPublic[];
}

export interface UserGetFollowersSuccess {
    message: string;
    followers: UserPublic[];
}

export interface UserFollowSuccess {
    message: string;
    followedUser: string;
}

export interface UserUnfollowSuccess {
    message: string;
    unfollowedUser: string;
}

/*
 * Post types
 * **/

export interface PostBase {
    message: string;
    content: IPost[];
    nextCursor: string | null; // null if there are no more posts to fetch
}

export type PostRetrieveSuccess = PostBase;
