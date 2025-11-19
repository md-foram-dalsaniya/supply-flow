const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const {
    getReviews,
    getReviewSummary,
    createReview,
    addReply,
    uploadReviewImages,
    deleteReview,
} = require('../controllers/reviewController');

router.get('/summary', protect, getReviewSummary);
router.post('/:id/upload-images', upload.array('images', 5), handleMulterError, uploadReviewImages);
router.post('/:id/reply', protect, addReply);
router.delete('/:id', protect, deleteReview);
router.get('/', protect, getReviews);
router.post('/', upload.any(), handleMulterError, createReview);

module.exports = router;

