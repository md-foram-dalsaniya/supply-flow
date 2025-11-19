const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

const formatSupplyPartnerSince = (date) => {
    if (!date) return null;
    const joinDate = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[joinDate.getMonth()];
    const year = joinDate.getFullYear();
    return `${month} ${year}`;
};

const formatEstablishedYear = (date) => {
    if (!date) return null;
    const establishedDate = new Date(date);
    return establishedDate.getFullYear().toString();
};

const formatUserForProfile = (user) => {
    const userObj = user.toObject ? user.toObject() : user;
    
    const businessInfo = userObj.businessInfo || {};
    const formattedBusinessInfo = {
        ...businessInfo,
        establishedYear: formatEstablishedYear(businessInfo.establishedDate),
    };
    
    return {
        id: userObj._id || userObj.id,
        name: userObj.name || '',
        email: userObj.email || '',
        phone: userObj.phone || '',
        profileImage: userObj.profileImage || null,
        supplyPartnerSince: formatSupplyPartnerSince(userObj.metrics?.joinDate || userObj.createdAt),
        performanceMetrics: {
            rating: userObj.metrics?.rating || 0,
            onTimePercentage: userObj.metrics?.onTimePercentage || 0,
            totalSupplied: userObj.metrics?.totalSupplied || 0,
        },
        paymentMethodsCount: userObj.paymentMethods ? userObj.paymentMethods.length : 0,
        bankAccountsCount: userObj.bankAccounts ? userObj.bankAccounts.length : 0,
        businessInfo: formattedBusinessInfo,
        address: userObj.address || {},
        businessHours: userObj.businessHours || {},
        deliverySettings: userObj.deliverySettings || {},
        paymentMethods: userObj.paymentMethods || [],
        bankAccounts: userObj.bankAccounts || [],
        website: userObj.website || '',
        aboutUs: userObj.aboutUs || '',
        specialties: userObj.specialties || [],
        verification: userObj.verification || { isVerified: false },
        badges: userObj.badges || [],
        metrics: userObj.metrics || {},
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt,
    };
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpireTime');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const formattedUser = formatUserForProfile(user);

    res.status(200).json({
      success: true,
      user: formattedUser,
    });
  } catch (error) {
    console.error('❌ Get me error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user information. Please try again.',
    });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file',
      });
    }

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
          
          const formattedUser = formatUserForProfile(user);
          
          res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            imageUrl: result.secure_url,
            user: formattedUser,
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

    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : '';
    
    if (businessInfo !== undefined) {
      const existingBusinessInfo = currentUser.businessInfo || {};
      updateData.businessInfo = {
        ...existingBusinessInfo,
        ...(businessInfo.fullBusinessName !== undefined && { fullBusinessName: businessInfo.fullBusinessName.trim() }),
        ...(businessInfo.businessType !== undefined && { businessType: businessInfo.businessType.trim() }),
        ...(businessInfo.registrationNumber !== undefined && { registrationNumber: businessInfo.registrationNumber.trim() }),
        ...(businessInfo.taxId !== undefined && { taxId: businessInfo.taxId.trim() }),
        ...(businessInfo.establishedDate !== undefined && { establishedDate: businessInfo.establishedDate ? new Date(businessInfo.establishedDate) : null }),
      };
    }
    
    if (address !== undefined) {
      const existingAddress = currentUser.address || {};
      updateData.address = {
        ...existingAddress,
        ...(address.street !== undefined && { street: address.street.trim() }),
        ...(address.city !== undefined && { city: address.city.trim() }),
        ...(address.state !== undefined && { state: address.state.trim() }),
        ...(address.zipCode !== undefined && { zipCode: address.zipCode.trim() }),
        ...(address.country !== undefined && { country: address.country.trim() }),
      };
    }
    
    if (businessHours !== undefined) {
      const existingBusinessHours = currentUser.businessHours || {};
      updateData.businessHours = {
        ...existingBusinessHours,
        ...businessHours,
      };
    }
    
    if (deliverySettings !== undefined) {
      const existingDeliverySettings = currentUser.deliverySettings || {};
      updateData.deliverySettings = {
        ...existingDeliverySettings,
        ...deliverySettings,
      };
    }
    
    if (paymentMethods !== undefined) updateData.paymentMethods = paymentMethods;
    if (bankAccounts !== undefined) updateData.bankAccounts = bankAccounts;
    if (website !== undefined) updateData.website = website ? website.trim() : '';
    if (aboutUs !== undefined) updateData.aboutUs = aboutUs ? aboutUs.trim() : '';
    if (specialties !== undefined) updateData.specialties = Array.isArray(specialties) ? specialties : [];

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

    const formattedUser = formatUserForProfile(user);

    console.log(`✅ Profile updated: ${user.name} (ID: ${user._id})`);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: formattedUser,
    });
  } catch (error) {
    console.error('❌ Update profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile. Please check your information and try again.',
    });
  }
};

exports.getProfileInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -otp -otpExpireTime');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const formattedUser = formatUserForProfile(user);

    res.status(200).json({
      success: true,
      profile: {
        name: formattedUser.name,
        profileImage: formattedUser.profileImage,
        supplyPartnerSince: formattedUser.supplyPartnerSince,
        businessInfo: {
          fullBusinessName: formattedUser.businessInfo?.fullBusinessName || '',
          businessType: formattedUser.businessInfo?.businessType || '',
          registrationNumber: formattedUser.businessInfo?.registrationNumber || '',
          taxId: formattedUser.businessInfo?.taxId || '',
          establishedDate: formattedUser.businessInfo?.establishedDate || null,
          establishedYear: formattedUser.businessInfo?.establishedYear || null,
        },
        businessType: formattedUser.businessInfo?.businessType || '',
        contactInfo: {
          email: formattedUser.email,
          phone: formattedUser.phone,
          website: formattedUser.website,
        },
        address: {
          street: formattedUser.address?.street || '',
          city: formattedUser.address?.city || '',
          state: formattedUser.address?.state || '',
          zipCode: formattedUser.address?.zipCode || '',
          country: formattedUser.address?.country || '',
        },
        businessHours: formattedUser.businessHours,
        deliverySettings: formattedUser.deliverySettings,
        aboutUs: formattedUser.aboutUs,
        specialties: formattedUser.specialties,
        verification: formattedUser.verification,
        badges: formattedUser.badges,
        metrics: formattedUser.metrics,
        performanceMetrics: formattedUser.performanceMetrics,
        paymentMethods: formattedUser.paymentMethods,
        paymentMethodsCount: formattedUser.paymentMethodsCount,
        bankAccounts: formattedUser.bankAccounts,
        bankAccountsCount: formattedUser.bankAccountsCount,
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
