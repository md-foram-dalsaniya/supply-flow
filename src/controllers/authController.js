const User = require('../models/User');
const generateOTP = require('../utils/generateOTP');
const sendOTPEmail = require('../utils/sendEmail');
const generateToken = require('../utils/generateToken');

// OTP expiration time: 1 minute (60 seconds * 1000 milliseconds)
const OTP_EXPIRE_TIME = 60 * 1000; // 1 minute in milliseconds

exports.register = async (req, res) => {
  try {
    const { businessName, email, password } = req.body;
    const imageFile = req.file;

    if (!businessName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide business name, email, and password',
      });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long',
      });
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordStrengthRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists. Please use a different email or login instead.',
      });
    }

    let profileImageUrl = null;
    if (imageFile) {
      try {
        const cloudinary = require('../config/cloudinary');
        const { Readable } = require('stream');

        const uploadPromise = new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'instasupply/profiles',
              resource_type: 'image',
              transformation: [
                { width: 500, height: 500, crop: 'limit' },
                { quality: 'auto' },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );

          const bufferStream = new Readable();
          bufferStream.push(imageFile.buffer);
          bufferStream.push(null);
          bufferStream.pipe(stream);
        });

        profileImageUrl = await uploadPromise;
        console.log(`✅ Profile image uploaded: ${profileImageUrl}`);
      } catch (imageError) {
        console.error('❌ Error uploading profile image:', imageError.message);
      }
    }

    const otp = generateOTP();
    const otpExpireTime = new Date(Date.now() + OTP_EXPIRE_TIME);

    const user = await User.create({
      name: businessName,
      email: email.toLowerCase(),
      password,
      profileImage: profileImageUrl,
      otp,
      otpExpireTime,
      isVerified: false,
    });

    console.log(`📧 Sending OTP to ${user.email}...`);
    const emailSent = await sendOTPEmail(user.email, otp);

    if (!emailSent) {
      console.error('❌ Failed to send OTP email to:', user.email);
    } else {
      console.log(`✅ OTP sent successfully to ${user.email}`);
    }

    res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to email for verification.',
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);

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

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (!user.otpExpireTime || new Date() > user.otpExpireTime) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new OTP.',
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpireTime = null;
    await user.save();

    console.log(`✅ User ${user.email} verified successfully`);

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now login.',
    });
  } catch (error) {
    console.error('❌ OTP verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email with OTP before logging in. Check your email for the OTP code.',
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);
    console.log(`✅ User ${user.email} logged in successfully`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to login. Please try again.',
    });
  }
};

exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    const otp = generateOTP();
    const otpExpireTime = new Date(Date.now() + OTP_EXPIRE_TIME);

    user.otp = otp;
    user.otpExpireTime = otpExpireTime;
    await user.save();

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

exports.changeEmailDuringVerification = async (req, res) => {
  try {
    const { oldEmail, newEmail } = req.body;

    if (!oldEmail || !newEmail) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both old email and new email',
      });
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address',
      });
    }

    const user = await User.findOne({ email: oldEmail.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email. Please register first.',
      });
    }

    if (!user.otp) {
      return res.status(400).json({
        success: false,
        message: 'Email cannot be changed. Account is already verified.',
      });
    }

    const existingUser = await User.findOne({ email: newEmail.toLowerCase() });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'New email is already registered. Please use a different email.',
      });
    }

    user.email = newEmail.toLowerCase();

    const otp = generateOTP();
    const otpExpireTime = new Date(Date.now() + OTP_EXPIRE_TIME);
    user.otp = otp;
    user.otpExpireTime = otpExpireTime;

    await user.save();

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
        const existingUser = await User.findOne({ email: testUser.email.toLowerCase() });

        if (existingUser) {
          errors.push({
            email: testUser.email,
            message: 'User already exists',
          });
          continue;
        }

        const otp = generateOTP();
        const otpExpireTime = new Date(Date.now() + OTP_EXPIRE_TIME);

        const user = await User.create({
          name: testUser.name,
          email: testUser.email.toLowerCase(),
          password: testUser.password,
          phone: testUser.phone,
          otp,
          otpExpireTime,
        });

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
          otp: otp,
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
