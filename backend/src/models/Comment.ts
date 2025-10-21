import mongoose, { Schema } from 'mongoose';

export interface IComment {
    createdBy: Schema.Types.ObjectId;
    parentPost: Schema.Types.ObjectId;
    commentContent: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
    {
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        parentPost: {
            type: Schema.Types.ObjectId,
            ref: 'Post',
            required: true,
        },
        commentContent: {
            type: String,
            trim: true,
            required: true,
            minlength: [1, 'Comment cannot be empty.'],
            maxlength: [140, 'Comment must be at most 140 characters long.'],
        },
    },
    { timestamps: true },
);

commentSchema.index({ parentPost: 1, createdBy: 1 });

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
