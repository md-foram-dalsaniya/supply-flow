const StoreSettings = require('../models/StoreSettings');

// @desc    Get store settings
// @route   GET /api/store/settings
// @access  Private
exports.getStoreSettings = async (req, res) => {
  try {
    let storeSettings = await StoreSettings.findOne({ supplier: req.user.id });

    if (!storeSettings) {
      // Create default store settings
      storeSettings = await StoreSettings.create({
        supplier: req.user.id,
        isOpen: true,
        openingTime: '09:00',
        closingTime: '21:00',
        rating: 0,
        totalRatings: 0,
        ratingCount: 0,
      });
    }

    res.status(200).json({
      success: true,
      storeSettings,
    });
  } catch (error) {
    console.error('❌ Get store settings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store settings. Please try again.',
    });
  }
};

// @desc    Update store settings
// @route   PUT /api/store/settings
// @access  Private
exports.updateStoreSettings = async (req, res) => {
  try {
    const { isOpen, openingTime, closingTime } = req.body;

    let storeSettings = await StoreSettings.findOne({ supplier: req.user.id });

    if (!storeSettings) {
      storeSettings = await StoreSettings.create({
        supplier: req.user.id,
        isOpen: isOpen !== undefined ? isOpen : true,
        openingTime: openingTime || '09:00',
        closingTime: closingTime || '21:00',
      });
    } else {
      if (isOpen !== undefined) storeSettings.isOpen = isOpen;
      if (openingTime) storeSettings.openingTime = openingTime;
      if (closingTime) storeSettings.closingTime = closingTime;
      await storeSettings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Store settings updated successfully',
      storeSettings,
    });
  } catch (error) {
    console.error('❌ Update store settings error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update store settings. Please try again.',
    });
  }
};

// @desc    Update store rating (for future use when customers can rate)
// @route   POST /api/store/rating
// @access  Private (or Public for customers)
exports.updateRating = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5',
      });
    }

    let storeSettings = await StoreSettings.findOne({ supplier: req.user.id });

    if (!storeSettings) {
      storeSettings = await StoreSettings.create({
        supplier: req.user.id,
        rating: rating,
        totalRatings: rating,
        ratingCount: 1,
      });
    } else {
      // Calculate new average rating
      const newTotalRatings = storeSettings.totalRatings + rating;
      const newRatingCount = storeSettings.ratingCount + 1;
      const newAverageRating = newTotalRatings / newRatingCount;

      storeSettings.rating = newAverageRating;
      storeSettings.totalRatings = newTotalRatings;
      storeSettings.ratingCount = newRatingCount;
      await storeSettings.save();
    }

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      storeSettings: {
        rating: storeSettings.rating.toFixed(1),
        ratingCount: storeSettings.ratingCount,
      },
    });
  } catch (error) {
    console.error('❌ Update rating error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to update rating. Please try again.',
    });
  }
};

