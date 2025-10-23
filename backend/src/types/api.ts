import { z } from 'zod';
import {
    userLoginSchema,
    userPatchSchema,
    userRegisterSchema,
} from '../schemas/userSchemas';
import { IPost } from '../models/Post';
import { IComment } from '../models/Comment';

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
    id: string;
    token: string;
}

export interface UserLoginSuccess extends UserBase {
    id: string;
    token: string;
}

export interface UserLogoutSuccess {
    message: string;
}

export interface UserMeSuccess extends Partial<UserBase> {
    id: string;
    bio?: string | null;
    avatarUrl?: string | null;
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

export interface UserIsFollowingSuccess {
    message: string;
    isFollowing: boolean;
}

/*
 * Post types
 * **/

export interface PostBase {
    message: string;
}

export interface PostsGetSuccess extends PostBase {
    posts: IPost[];
    nextCursor: string | null; // null if there are no more posts to fetch
}

export interface PostCreateSuccess {
    message: string;
    postContent: IPost;
}

export interface PostGetByIdSuccess extends PostBase {
    postContent: IPost;
}

export interface PostDeleteSuccess extends PostBase {
    deletedPostId: string;
}

/*
 * Comment types
 * **/

export interface CommentBase {
    message: string;
}

export interface CommentGetSuccess extends CommentBase {
    comments: IComment[];
    nextCursor: string | null; // null if there are no more comments to fetch
}

export interface CommentCreateSuccess extends CommentBase {
    commentContent: IComment;
}

export interface CommentDeleteSuccess extends CommentBase {
    deletedCommentId: string;
}
