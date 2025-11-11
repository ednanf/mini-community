import bcrypt from 'bcryptjs';

/**
 * Asynchronously hashes a given password using bcrypt.
 *
 * @param {string} password - The plain text password to be hashed.
 * @returns {Promise<string>} A promise that resolves to the hashed password.
 *
 * @example
 * const hashedPassword = await hashPassword('mySecurePassword');
 * console.log(hashedPassword); // Logs the hashed password string
 *
 * @remarks
 * - The function uses a fixed salt round value of 10 for hashing.
 * - bcrypt is a widely used library for securely hashing passwords.
 * - Always store hashed passwords instead of plain text passwords for security.
 */
const hashPassword = async (password: string): Promise<string> => {
    const saltRounds = 10; // Number of salt rounds to strengthen the hash
    return bcrypt.hash(password, saltRounds); // Hash the password with the specified salt rounds
};

export default hashPassword;
