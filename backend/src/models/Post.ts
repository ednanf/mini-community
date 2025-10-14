import mongoose, { Schema } from 'mongoose';

export interface IPost {
    createdBy: Schema.Types.ObjectId;
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
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
