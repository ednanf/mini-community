import CustomError from './CustomError.js';

// This error is thrown when there is a configuration issue with JWT (JSON Web Token).
class JWTConfigurationError extends CustomError {}

export default JWTConfigurationError;
