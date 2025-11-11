import mongoose, { Schema } from 'mongoose';

export interface IPost {
    createdBy: Schema.Types.ObjectId;
    postContent: string;
    postComments: Schema.Types.ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        postContent: {
            type: String,
            required: true,
            trim: true,
            minLength: [1, 'You cannot create an empty post.'],
            maxlength: [140, 'Post must be at most 140 characters long.'],
        },
        postComments: {
            type: [Schema.Types.ObjectId],
            ref: 'Comment',
        },
    },
    { timestamps: true },
);

postSchema.index({ createdAt: -1 });

const Post = mongoose.model<IPost>('Post', postSchema);

export default Post;
