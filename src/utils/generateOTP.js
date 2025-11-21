/**
 * Generate a random 4-digit OTP (One-Time Password)
 * OTP expires after 1 minute (configured in authController)
 * @returns {string} 4-digit OTP string (e.g., "1234")
 */
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

module.exports = generateOTP;
