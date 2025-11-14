const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
    },
    isOpen: {
        type: Boolean,
        default: true,
    },
    openingTime: {
        type: String,
        default: '09:00',
    },
    closingTime: {
        type: String,
        default: '21:00',
    },
    rating: {
        type: Number,
        default: 0,
        min: [0, 'Rating cannot be negative'],
        max: [5, 'Rating cannot exceed 5'],
    },
    totalRatings: {
        type: Number,
        default: 0,
    },
    ratingCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Index
storeSettingsSchema.index({ supplier: 1 });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);

