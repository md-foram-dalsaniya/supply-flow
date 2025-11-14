/**
 * GENERATE_OTP.JS - OTP Code Generator
 * 
 * This file creates a 4-digit code (OTP) for login.
 * OTP = One-Time Password (like a temporary code sent to your email)
 * Example: 1234, 5678, etc.
 */

// Generate 4-digit numeric OTP
// Creates a random number between 1000 and 9999
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = generateOTP;

