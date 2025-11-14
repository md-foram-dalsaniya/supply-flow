const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpireTime');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('❌ Get me error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information. Please try again.',
    });
  }
};

/**
 * UPLOAD_PROFILE_IMAGE - Upload user's profile picture
 * 
 * What it does:
 * 1. Receives image file from request
 * 2. Uploads image to Cloudinary (image storage service)
 * 3. Gets back a URL from Cloudinary (direct link to image)
 * 4. Saves URL to user's profile in database
 * 5. Returns the image URL
 * 
 * URL: POST /api/users/upload-profile-image
 * Access: Private (requires login)
 * 
 * Note: Image is resized to max 500x500 pixels automatically
 */
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file',
      });
    }

    // Convert buffer to stream for Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'instasupply/profiles',
        resource_type: 'image',
        transformation: [
          { width: 500, height: 500, crop: 'limit' },
          { quality: 'auto' },
        ],
      },
      async (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error.message);
          return res.status(500).json({
            success: false,
            message: 'Failed to upload image. Please try again.',
          });
        }

        try {
          // Update user profile image
          const user = await User.findByIdAndUpdate(
            req.user.id,
            { profileImage: result.secure_url },
            { new: true, runValidators: true }
          ).select('-password -otp -otpExpireTime');

          if (!user) {
            return res.status(404).json({
              success: false,
              message: 'User not found',
            });
          }

          console.log(`✅ Profile image uploaded: ${result.secure_url}`);
          res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            imageUrl: result.secure_url,
            user,
          });
        } catch (updateError) {
          console.error('❌ Database update error:', updateError.message);
          res.status(500).json({
            success: false,
            message: 'Failed to update profile. Please try again.',
          });
        }
      }
    );

    // Pipe the buffer to the stream
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  } catch (error) {
    console.error('❌ Upload profile image error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image. Please try again.',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const {
      name,
      phone,
      businessInfo,
      address,
      businessHours,
      deliverySettings,
      paymentMethods,
      bankAccounts,
      website,
      aboutUs,
      specialties,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (businessInfo) updateData.businessInfo = businessInfo;
    if (address) updateData.address = address;
    if (businessHours) updateData.businessHours = businessHours;
    if (deliverySettings) updateData.deliverySettings = deliverySettings;
    if (paymentMethods) updateData.paymentMethods = paymentMethods;
    if (bankAccounts) updateData.bankAccounts = bankAccounts;
    if (website !== undefined) updateData.website = website;
    if (aboutUs !== undefined) updateData.aboutUs = aboutUs;
    if (specialties !== undefined) updateData.specialties = specialties;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -otp -otpExpireTime');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('❌ Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please check your information and try again.',
    });
  }
};

// @desc    Get profile information (detailed)
// @route   GET /api/users/profile-info
// @access  Private
exports.getProfileInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpireTime');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      profile: {
        name: user.name,
        profileImage: user.profileImage,
        businessInfo: user.businessInfo,
        businessType: user.businessInfo?.businessType || '',
        contactInfo: {
          email: user.email,
          phone: user.phone,
          website: user.website,
        },
        address: user.address,
        businessHours: user.businessHours,
        aboutUs: user.aboutUs,
        specialties: user.specialties || [],
        verification: user.verification,
        badges: user.badges || [],
        metrics: user.metrics,
      },
    });
  } catch (error) {
    console.error('❌ Get profile info error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile information. Please try again.',
    });
  }
};

