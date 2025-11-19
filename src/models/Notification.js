const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        enum: ['Order', 'Product', 'Campaign', 'Review', 'Payment', 'System'],
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    message: {
        type: String,
        required: true,
        trim: true,
    },
    icon: {
        type: String,
        enum: ['order', 'alert', 'campaign', 'review', 'payment', 'system'],
        default: 'system',
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null, // Can reference Order, Product, Campaign, etc.
    },
    relatedType: {
        type: String,
        default: null, // 'Order', 'Product', 'Campaign', etc.
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
}, {
    timestamps: true,
});

notificationSchema.index({ supplier: 1, createdAt: -1 });
notificationSchema.index({ supplier: 1, isRead: 1 });
notificationSchema.index({ supplier: 1, type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

