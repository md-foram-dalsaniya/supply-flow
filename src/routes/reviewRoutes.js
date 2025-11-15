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

router.get('/summary', protect, getReviewSummary);
router.post('/:id/upload-images', upload.array('images', 5), uploadReviewImages);
router.post('/:id/reply', protect, addReply);
router.delete('/:id', protect, deleteReview);
router.get('/', protect, getReviews);
router.post('/', upload.any(), createReview);

module.exports = router;

