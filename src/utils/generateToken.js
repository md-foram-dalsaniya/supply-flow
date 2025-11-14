/**
 * GENERATE_TOKEN.JS - JWT Token Generator
 * 
 * This file creates a special code (token) when user logs in.
 * This token is like a temporary ID card that proves the user is logged in.
 * The token expires after 7 days (or whatever is set in .env).
 */

const jwt = require('jsonwebtoken');

// Generate JWT token
// Takes user ID and creates a secure token
const generateToken = (id) => {
  return jwt.sign(
    { id }, // Put user ID inside the token
    process.env.JWT_SECRET, // Secret key to sign the token (from .env)
    {
      expiresIn: process.env.JWT_EXPIRE || '7d', // Token expires in 7 days
    }
  );
};

module.exports = generateToken;

