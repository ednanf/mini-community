import mongoose from 'mongoose';
import { DatabaseError } from '../errors/index.js';

// Connects to MongoDB using Mongoose.
// Throws DatabaseError if connection fails or MONGODB_URI is not set.
// Returns a promise that resolves when the connection is successful.
const databaseConnect = async (uri: string | undefined): Promise<void> => {
    if (!uri) {
        throw new DatabaseError(
            '[system] MONGODB_URI is missing. Please set it in your environment variables.',
        );
    }

    try {
        await mongoose.connect(uri);
        console.log('[system] successfully connected to MongoDB...');
    } catch (error) {
        throw new DatabaseError(
            `[system] failed to connect to MongoDB: ${error instanceof Error ? error.message : 'Unknown errors'}`,
        );
    }
};

export default databaseConnect;
