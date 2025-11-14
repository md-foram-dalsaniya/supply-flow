const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    getReviews,
    getReviewSummary,
    createReview,
    addReply,
    uploadReviewImages,
    deleteReview,
} = require('../controllers/reviewController');

// @route   GET /api/reviews/summary
// @desc    Get review summary
// @access  Private
router.get('/summary', protect, getReviewSummary);

// @route   GET /api/reviews
// @desc    Get all reviews
// @access  Private
router.get('/', protect, getReviews);

// @route   POST /api/reviews
// @desc    Create review (supplier-based, supports image uploads)
// @access  Public (customers can review suppliers)
// Use upload.any() to handle both text fields and image files in form-data
router.post('/', upload.any(), createReview);

// @route   POST /api/reviews/:id/reply
// @desc    Add reply to review
// @access  Private
router.post('/:id/reply', protect, addReply);

// @route   POST /api/reviews/:id/upload-images
// @desc    Upload review images
// @access  Private (or Public)
router.post('/:id/upload-images', upload.array('images', 5), uploadReviewImages);

// @route   DELETE /api/reviews/:id
// @desc    Delete review
// @access  Private
router.delete('/:id', protect, deleteReview);

module.exports = router;

