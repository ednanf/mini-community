import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';
import { JWTConfigurationError } from '../errors/index.js';

interface JwtUserPayload {
    userId: string;
}

/**
 * Creates a JSON Web Token (JWT) using the provided payload and environment variables.
 *
 * @param {JwtUserPayload} payload - The payload to include in the JWT, typically containing user-specific data.
 * @returns {string} The signed JWT as a string.
 *
 * @throws {JWTConfigurationError} If the `JWT_SECRET` or `JWT_LIFETIME` environment variables are not defined.
 * @throws {JWTConfigurationError} If the `JWT_LIFETIME` format is invalid. Expected formats include '30d', '1h', '15m', etc.
 *
 * @remarks
 * - The function retrieves the `JWT_SECRET` and `JWT_LIFETIME` from environment variables.
 * - It validates the `JWT_LIFETIME` format using a regular expression to ensure it matches expected patterns.
 * - The token is signed using the HMAC SHA-256 algorithm (`HS256`).
 * - The `expiresIn` option determines the token's lifetime, which is parsed from the `JWT_LIFETIME` variable.
 *
 * @example
 * const token = createJWT({ userId: '12345' });
 * console.log(token); // Logs the generated JWT
 */
const createJWT = (payload: JwtUserPayload): string => {
    const { JWT_SECRET: jwtSecret, JWT_LIFETIME: jwtLifetime } = process.env;

    if (!jwtSecret) {
        throw new JWTConfigurationError(
            'JWT_SECRET is not defined in environment variables.',
        );
    }

    if (!jwtLifetime) {
        throw new JWTConfigurationError(
            'JWT_LIFETIME is not defined in environment variables.',
        );
    }

    // Validate the JWT_LIFETIME format
    if (!/^\d+[smhdwy]$/.test(jwtLifetime)) {
        throw new JWTConfigurationError(
            `JWT_LIFETIME format invalid: ${jwtLifetime}. Expected format like '30d', '1h', '15m'.`,
        );
    }

    const options: SignOptions = {
        algorithm: 'HS256', // HMAC SHA-256 for signing
        expiresIn: jwtLifetime as StringValue, // Lifetime of the token, e.g., '1h', '2d'
    };

    return jwt.sign(payload, jwtSecret as Secret, options);
};

export default createJWT;
