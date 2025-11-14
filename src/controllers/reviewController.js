const Review = require('../models/Review');
const StoreSettings = require('../models/StoreSettings');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Private
exports.getReviews = async (req, res) => {
    try {
        const { rating, sortBy = 'recent', page = 1, limit = 20 } = req.query;

        // Build query
        const query = {
            supplier: req.user.id,
            isVisible: true,
        };

        // Filter by rating
        if (rating && rating !== 'all') {
            query.rating = parseInt(rating);
        }

        // Build sort object
        let sortObject = {};
        switch (sortBy) {
            case 'recent':
                sortObject = { createdAt: -1 };
                break;
            case 'oldest':
                sortObject = { createdAt: 1 };
                break;
            case 'highest':
                sortObject = { rating: -1, createdAt: -1 };
                break;
            case 'lowest':
                sortObject = { rating: 1, createdAt: -1 };
                break;
            default:
                sortObject = { createdAt: -1 };
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query
        const reviews = await Review.find(query)
            .sort(sortObject)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await Review.countDocuments(query);

        // Get rating distribution
        const ratingDistribution = await Review.aggregate([
            { $match: { supplier: req.user.id, isVisible: true } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
        ]);

        // Calculate rating percentages
        const totalReviews = await Review.countDocuments({ supplier: req.user.id, isVisible: true });
        const distribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0,
        };

        ratingDistribution.forEach((item) => {
            distribution[item._id] = totalReviews > 0
                ? Math.round((item.count / totalReviews) * 100)
                : 0;
        });

        res.status(200).json({
            success: true,
            count: reviews.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            ratingDistribution: distribution,
            reviews,
        });
    } catch (error) {
        console.error('❌ Get reviews error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while fetching reviews',
        });
    }
};

// @desc    Get review summary
// @route   GET /api/reviews/summary
// @access  Private
exports.getReviewSummary = async (req, res) => {
    try {
        const reviews = await Review.find({
            supplier: req.user.id,
            isVisible: true,
        });

        const totalReviews = reviews.length;

        if (totalReviews === 0) {
            return res.status(200).json({
                success: true,
                summary: {
                    averageRating: 0,
                    totalReviews: 0,
                    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
                },
            });
        }

        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / totalReviews;

        // Calculate rating distribution
        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach((review) => {
            distribution[review.rating]++;
        });

        // Convert to percentages
        const ratingDistribution = {};
        Object.keys(distribution).forEach((rating) => {
            ratingDistribution[rating] = Math.round((distribution[rating] / totalReviews) * 100);
        });

        res.status(200).json({
            success: true,
            summary: {
                averageRating: averageRating.toFixed(1),
                totalReviews,
                ratingDistribution,
            },
        });
    } catch (error) {
        console.error('❌ Get review summary error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while fetching review summary',
        });
    }
};

// @desc    Create review (supplier-based, not product-based)
// @route   POST /api/reviews
// @access  Public (customers can review suppliers)
exports.createReview = async (req, res) => {
    try {
        // Extract fields from req.body (works for both JSON and form-data)
        // For form-data, multer puts text fields in req.body and files in req.files
        const supplierId = req.body.supplierId;
        const customerName = req.body.customerName;
        const customerEmail = req.body.customerEmail;
        const rating = req.body.rating ? parseInt(req.body.rating) : null;
        // Accept multiple field names for the review comment text
        const comment = req.body.comment || req.body.reviewText || req.body.replyText || '';

        // Debug logging (can be removed in production)
        console.log('📥 Review creation request received');
        console.log('📋 Request body keys:', Object.keys(req.body));
        console.log('📋 supplierId:', supplierId);
        console.log('📋 customerName:', customerName);
        console.log('📋 rating:', rating);
        console.log('📋 comment/reviewText:', comment);
        console.log('📁 Files received:', req.files ? req.files.length : 0);

        // Validation
        if (!supplierId || !rating || !customerName) {
            return res.status(400).json({
                success: false,
                message: 'Please provide supplierId, rating, and customerName',
            });
        }

        if (isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be a number between 1 and 5',
            });
        }

        // Check if supplier exists
        const User = require('../models/User');
        const supplier = await User.findById(supplierId);
        if (!supplier) {
            return res.status(404).json({
                success: false,
                message: 'Supplier not found',
            });
        }

        // Upload images if provided
        // Filter only image files (in case other files are uploaded)
        let imageUrls = [];
        const imageFiles = req.files ? req.files.filter(file => {
            const allowedTypes = /jpeg|jpg|png|gif|webp/;
            return allowedTypes.test(file.mimetype);
        }) : [];

        if (imageFiles.length > 0) {
            // Limit to 5 images
            const filesToUpload = imageFiles.slice(0, 5);
            console.log(`📤 Uploading ${filesToUpload.length} image(s) for review...`);

            const uploadPromises = filesToUpload.map((file) => {
                return new Promise((resolve, reject) => {
                    if (!file.buffer) {
                        reject(new Error('File has no buffer data'));
                        return;
                    }

                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'instasupply/reviews',
                            resource_type: 'image',
                            transformation: [
                                { width: 800, height: 800, crop: 'limit' },
                                { quality: 'auto' },
                            ],
                        },
                        (error, result) => {
                            if (error) {
                                console.error('❌ Cloudinary upload error:', error.message);
                                reject(error);
                            } else {
                                resolve(result.secure_url);
                            }
                        }
                    );

                    const bufferStream = new Readable();
                    bufferStream.push(file.buffer);
                    bufferStream.push(null);
                    bufferStream.pipe(stream);
                });
            });

            try {
                imageUrls = await Promise.all(uploadPromises);
                console.log(`✅ ${imageUrls.length} image(s) uploaded successfully`);
            } catch (uploadError) {
                console.error('❌ Error uploading images:', uploadError.message);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to upload images. Please try again.',
                });
            }
        }

        // Create review
        const review = await Review.create({
            supplier: supplierId,
            customerName,
            customerEmail: customerEmail || '',
            rating: parseInt(rating),
            reviewText: comment || '', // Using 'comment' as the field name in API
            images: imageUrls,
        });

        // Update store rating
        let storeSettings = await StoreSettings.findOne({ supplier: supplierId });
        if (storeSettings) {
            const newTotalRatings = storeSettings.totalRatings + rating;
            const newRatingCount = storeSettings.ratingCount + 1;
            storeSettings.rating = newTotalRatings / newRatingCount;
            storeSettings.totalRatings = newTotalRatings;
            storeSettings.ratingCount = newRatingCount;
            await storeSettings.save();
        } else {
            // Create store settings if doesn't exist
            await StoreSettings.create({
                supplier: supplierId,
                rating: rating,
                totalRatings: rating,
                ratingCount: 1,
            });
        }

        console.log(`✅ Review created for supplier: ${supplier.name}`);

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            review,
        });
    } catch (error) {
        console.error('❌ Create review error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to create review. Please check your information and try again.',
        });
    }
};

// @desc    Add reply to review
// @route   POST /api/reviews/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
    try {
        // Accept both 'replyText' and 'message' for flexibility
        const replyText = req.body.replyText || req.body.message;
        const companyName = req.body.companyName;

        // Validation
        if (!replyText) {
            return res.status(400).json({
                success: false,
                message: 'Please provide reply text (use "replyText" or "message" field)',
            });
        }

        // Find review
        const review = await Review.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Add reply
        review.reply = {
            companyName: companyName || req.user.name,
            replyText,
        };
        await review.save();

        res.status(200).json({
            success: true,
            message: 'Reply added successfully',
            review,
        });
    } catch (error) {
        console.error('❌ Add reply error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while adding reply',
        });
    }
};

// @desc    Upload review images
// @route   POST /api/reviews/:id/upload-images
// @access  Private (or Public)
exports.uploadReviewImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one image file',
            });
        }

        // Find review
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Upload images to Cloudinary
        const uploadPromises = req.files.map((file) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'instasupply/reviews',
                        resource_type: 'image',
                        transformation: [
                            { width: 800, height: 800, crop: 'limit' },
                            { quality: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result.secure_url);
                    }
                );

                const bufferStream = new Readable();
                bufferStream.push(file.buffer);
                bufferStream.push(null);
                bufferStream.pipe(stream);
            });
        });

        const imageUrls = await Promise.all(uploadPromises);

        // Update review with images
        review.images = [...review.images, ...imageUrls];
        await review.save();

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            images: imageUrls,
            review,
        });
    } catch (error) {
        console.error('❌ Upload review images error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to during image upload',
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Soft delete
        review.isVisible = false;
        await review.save();

        res.status(200).json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        console.error('❌ Delete review error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to while deleting review',
        });
    }
};

