import mongoose, { Schema, HydratedDocument, model } from 'mongoose';
import validator from 'validator';
import hashPassword from '../utils/hashPassword';
import createJWT from '../utils/createJWT';
import comparePasswords from '../utils/comparePasswords';
import module from 'node:module';
import ObjectId = module;

// TypeScript interface (when just passing user data around)
export interface IUser {
    _id: ObjectId;
    nickname: string;
    email: string;
    password: string;
    avatarUrl?: string;
    bio?: string;
    followers: ObjectId[];
    following: ObjectId[];
    createdAt?: Date;
    updatedAt?: Date;
}

// Mongoose document interface (when using the document's methods)
export interface IUserDocument extends IUser, HydratedDocument<IUser> {
    comparePassword(candidatePassword: string): Promise<boolean>;
    createJWT(payload?: Record<string, unknown>): Promise<string>;
}

const userSchema = new Schema<IUserDocument>(
    {
        nickname: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, 'Nickname must be at least 3 characters long.'],
            maxlength: [30, 'Nickname must be at most 30 characters long.'],
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            minlength: [5, 'Email must be at least 5 characters long.'],
            validate: {
                validator(email: string) {
                    return validator.isEmail(email);
                },
                message: 'Please provide a valid email address.',
            },
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minlength: [6, 'Password must be at least 6 characters long.'],
        },
        avatarUrl: {
            type: String,
            required: false,
            trim: true,
            maxlength: [2048, 'URL must contain 2048 characters or less.'],
            validate: {
                validator(url: string) {
                    return validator.isURL(url);
                },
            },
        },
        bio: {
            type: String,
            required: false,
            trim: true,
            maxlength: [280, 'Bio must contain 280 characters or less.'],
        },
        followers: {
            type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            default: [],
        },
        following: {
            type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            default: [],
        },
    },
    { timestamps: true },
);

// Hash password only if it was modified
userSchema.pre('save', async function hashPasswordBeforeSave() {
    if (this.isModified('password')) {
        this.password = await hashPassword(this.password);
    }
});

// User schema methods
userSchema.methods.createJWT = async function createUserJWT(payload: Record<string, unknown> = {}) {
    // Package the user's MongoDB _id as userId into the JWT payload.
    // This is  where the userId is embedded into the token.
    return createJWT({ userId: this._id, ...payload });
};

userSchema.methods.comparePassword = async function compareUserPassword(
    candidatePassword: string,
): Promise<boolean> {
    return comparePasswords(candidatePassword, this.password);
};

/**
 * Defense against "Cannot overwrite model" errors in development.
 *
 * This pattern prevents Mongoose from trying to recompile the same model
 * multiple times during hot reloads, test runs, or when files are re-imported.
 * Without this guard, runtime errors in development environments
 * that re-execute this module (nodemon, ts-node, Jest, etc.) may happen.
 *
 * models.User checks if the model already exists before creating a new one.
 */
const User = mongoose.models.User || model<IUserDocument>('User', userSchema);

export default User;
