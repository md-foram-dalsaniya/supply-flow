const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for user authentication
 * Token expires in 7 days (can be overridden with JWT_EXPIRE env variable)
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d', // Default: 7 days
    }
  );
};

module.exports = generateToken;
