const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
    },
    replyText: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const reviewSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    customerName: {
        type: String,
        required: true,
        trim: true,
    },
    customerEmail: {
        type: String,
        trim: true,
    },
    rating: {
        type: Number,
        required: true,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
    },
    reviewText: {
        type: String,
        trim: true,
    },
    images: [{
        type: String, // Cloudinary URLs
    }],
    reply: replySchema,
    isVisible: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Indexes
reviewSchema.index({ supplier: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ supplier: 1, rating: 1 });

module.exports = mongoose.model('Review', reviewSchema);

