import { EnvVarsMissingError } from '../errors/index.js';

/**
 * Checks for required environment variables and throws a custom error if any are missing.
 * Fails fast, fails loud—just how you want it.
 */
const checkEnvVars = (requiredVars: string[]): void => {
    const missingVars = requiredVars.filter((key) => !process.env[key]);
    if (missingVars.length) {
        throw new EnvVarsMissingError(
            `[system] missing environment variables: ${missingVars.join(', ')}`,
        );
    }
};

export default checkEnvVars;
