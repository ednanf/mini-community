import mongoose, { Schema } from 'mongoose';

export interface IPost {
    author: string;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
    {
        author: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: [140, 'Post content must be at most 140 characters long.'],
        },
    },
    { timestamps: true },
);

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
