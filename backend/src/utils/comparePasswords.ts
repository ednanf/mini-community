import bcrypt from 'bcryptjs';

/**
 * Compares a candidate password with a hashed password to determine if they match.
 *
 * @param {string} candidatePassword - The plain text password provided by the user.
 * @param {string} hashedPassword - The hashed password stored in the database.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the passwords match, otherwise `false`.
 *
 * @example
 * const isMatch = await comparePasswords('userInputPassword', 'storedHashedPassword');
 * console.log(isMatch); // Logs `true` if the passwords match, otherwise `false`.
 *
 * @remarks
 * - This function uses bcrypt's `compare` method to securely compare the passwords.
 * - Always ensure that the hashed password is securely stored and retrieved from a trusted source.
 * - This function is asynchronous and must be awaited to get the result.
 */
const comparePasswords = async (
    candidatePassword: string,
    hashedPassword: string,
): Promise<boolean> => bcrypt.compare(candidatePassword, hashedPassword);

export default comparePasswords;
