/**
 * AUTH_CONTROLLER.JS - Authentication Functions
 * 
 * This file handles user registration, login, and logout.
 * It manages OTP codes and JWT tokens.
 */

const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const sendOTPEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');

/**
 * REGISTER - Create a new user account
 * 
 * What it does:
 * 1. Takes user info (name, email, password) from request
 * 2. Checks if email already exists
 * 3. Creates a 4-digit OTP code
 * 4. Saves user to database (password is automatically hashed)
 * 5. Sends OTP to user's email
 * 6. Returns success message
 * 
 * URL: POST /api/auth/register
 * Access: Public (anyone can register)
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Generate 4-digit OTP
    const otp = generateOTP();
    const otpExpireTime = new Date(Date.now() + 60 * 1000); // 1 minute from now

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save hook
      phone: phone || '',
      otp,
      otpExpireTime,
    });

    // Send OTP to email
    console.log(`📧 Sending OTP to ${user.email}...`);
    const emailSent = await sendOTPEmail(user.email, otp);

    if (!emailSent) {
      // If email fails, still return success but log the error
      console.error('❌ Failed to send OTP email to:', user.email);
    } else {
      console.log(`✅ OTP sent successfully to ${user.email}`);
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent to email.',
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);

    // Return clean error message without stack trace
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists. Please use a different email.',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to register. Please check your information and try again.',
    });
  }
};

/**
 * VERIFY_OTP - Verify OTP code and log user in
 * 
 * What it does:
 * 1. Takes email and OTP code from request
 * 2. Finds user in database
 * 3. Checks if OTP matches and hasn't expired
 * 4. Clears OTP from database (can't reuse it)
 * 5. Creates a JWT token (like an ID card)
 * 6. Returns token and user info
 * 
 * URL: POST /api/auth/verify-otp
 * Access: Public
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validation
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    // Check if OTP matches
    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check if OTP has expired
    if (!user.otpExpireTime || new Date() > user.otpExpireTime) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    // Clear OTP and expiry time
    user.otp = null;
    user.otpExpireTime = null;
    await user.save();

    // Generate JWT token
    const token = generateToken(user._id);
    console.log(`✅ User ${user.email} logged in successfully`);

    // Return token and user details
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error('❌ OTP verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
    });
  }
};

/**
 * REQUEST_OTP - Send a new OTP code to user's email
 * 
 * What it does:
 * 1. Takes email from request
 * 2. Finds user in database
 * 3. Generates a new 4-digit OTP code
 * 4. Saves OTP to database (expires in 1 minute)
 * 5. Sends OTP to user's email
 * 6. Returns success message
 * 
 * URL: POST /api/auth/request-otp
 * Access: Public
 * 
 * Note: Used when user wants to login but doesn't have an OTP yet
 */
exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    // Generate new 4-digit OTP
    const otp = generateOTP();
    const otpExpireTime = new Date(Date.now() + 60 * 1000); // 1 minute from now

    // Update user with new OTP
    user.otp = otp;
    user.otpExpireTime = otpExpireTime;
    await user.save();

    // Send OTP to email
    const emailSent = await sendOTPEmail(user.email, otp);

    if (!emailSent) {
      console.error('❌ Failed to send OTP email to:', user.email);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check your email settings.',
      });
    }

    console.log(`✅ OTP sent successfully to ${user.email}`);
    res.status(200).json({
      success: true,
      message: 'OTP sent to email.',
    });
  } catch (error) {
    console.error('❌ Request OTP error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
    });
  }
};

/**
 * LOGOUT - Log user out
 * 
 * What it does:
 * 1. Simply returns a success message
 * 2. Client should delete the token from storage
 * 
 * URL: POST /api/auth/logout
 * Access: Private (requires login)
 * 
 * Note: In JWT systems, logout is usually handled by deleting the token
 * on the client side. The server doesn't store tokens, so there's nothing
 * to delete on the server. But we provide this endpoint for consistency.
 */
exports.logout = async (req, res) => {
  try {
    console.log(`👋 User ${req.user.email} logged out`);
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('❌ Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to logout. Please try again.',
    });
  }
};

/**
 * CHANGE_EMAIL_DURING_VERIFICATION - Change email address before OTP verification
 * 
 * What it does:
 * 1. Takes old email and new email from request
 * 2. Finds user with old email (must be unverified/pending)
 * 3. Checks if new email is already taken
 * 4. Updates email address
 * 5. Generates new OTP and sends to new email
 * 6. Returns success message
 * 
 * URL: POST /api/auth/change-email
 * Access: Public
 */
exports.changeEmailDuringVerification = async (req, res) => {
  try {
    const { oldEmail, newEmail } = req.body;

    // Validation
    if (!oldEmail || !newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both old email and new email',
      });
    }

    // Email format validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    // Find user by old email
    const user = await User.findOne({ email: oldEmail.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email. Please register first.',
      });
    }

    // Check if user is already verified (has no OTP)
    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: 'Email cannot be changed. Account is already verified.',
      });
    }

    // Check if new email is already taken
    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'New email is already registered. Please use a different email.',
      });
    }

    // Update email
    user.email = newEmail.toLowerCase();

    // Generate new OTP for new email
    const otp = generateOTP();
    const otpExpireTime = new Date(Date.now() + 60 * 1000); // 1 minute from now
    user.otp = otp;
    user.otpExpireTime = otpExpireTime;

    await user.save();

    // Send OTP to new email
    console.log(`📧 Sending OTP to new email: ${user.email}...`);
    const emailSent = await sendOTPEmail(user.email, otp);

    if (!emailSent) {
      console.error('❌ Failed to send OTP email to:', user.email);
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP to new email. Please check your email settings.',
      });
    }

    console.log(`✅ Email changed and OTP sent to ${user.email}`);
    res.status(200).json({
      success: true,
      message: 'Email changed successfully. OTP sent to new email.',
      newEmail: user.email,
    });
  } catch (error) {
    console.error('❌ Change email error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'New email is already registered. Please use a different email.',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to change email. Please try again.',
    });
  }
};

/**
 * CREATE_TEST_USERS - Create multiple test supplier accounts for testing
 * 
 * What it does:
 * 1. Creates 5 different test supplier accounts
 * 2. Each account has different business names, emails, and passwords
 * 3. Generates OTPs for each account
 * 4. Returns all created test users (without passwords)
 * 
 * URL: POST /api/auth/create-test-users
 * Access: Public (for testing only)
 */
exports.createTestUsers = async (req, res) => {
  try {
    const testUsers = [
      {
        name: 'Urban Supply Co.',
        email: 'urban.supply@test.com',
        password: 'Test123!',
        phone: '+1-555-0101',
      },
      {
        name: 'Builders Depot',
        email: 'builders.depot@test.com',
        password: 'Test123!',
        phone: '+1-555-0102',
      },
      {
        name: 'Hardware Plus',
        email: 'hardware.plus@test.com',
        password: 'Test123!',
        phone: '+1-555-0103',
      },
      {
        name: 'Contractor Supply',
        email: 'contractor.supply@test.com',
        password: 'Test123!',
        phone: '+1-555-0104',
      },
      {
        name: 'Pro Tools & Materials',
        email: 'pro.tools@test.com',
        password: 'Test123!',
        phone: '+1-555-0105',
      },
    ];

    const createdUsers = [];
    const errors = [];

    for (const testUser of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: testUser.email.toLowerCase() });

        if (existingUser) {
          errors.push({
            email: testUser.email,
            message: 'User already exists',
          });
          continue;
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpireTime = new Date(Date.now() + 60 * 1000); // 1 minute from now

        // Create user
        const user = await User.create({
          name: testUser.name,
          email: testUser.email.toLowerCase(),
          password: testUser.password,
          phone: testUser.phone,
          otp,
          otpExpireTime,
        });

        // Send OTP to email
        const emailSent = await sendOTPEmail(user.email, otp);

        if (!emailSent) {
          console.error(`❌ Failed to send OTP email to: ${user.email}`);
        } else {
          console.log(`✅ Test user created and OTP sent to: ${user.email}`);
        }

        createdUsers.push({
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          otp: otp, // Include OTP for testing purposes
          message: emailSent ? 'OTP sent to email' : 'User created but OTP email failed',
        });
      } catch (error) {
        console.error(`❌ Error creating test user ${testUser.email}:`, error.message);
        errors.push({
          email: testUser.email,
          message: error.code === 11000 ? 'Email already exists' : error.message,
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `Created ${createdUsers.length} test user(s)`,
      users: createdUsers,
      errors: errors.length > 0 ? errors : undefined,
      note: 'All test users have password: Test123!',
    });
  } catch (error) {
    console.error('❌ Create test users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create test users. Please try again.',
    });
  }
};

