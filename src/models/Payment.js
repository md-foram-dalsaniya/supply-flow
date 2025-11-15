const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    razorpayOrderId: {
        type: String,
        required: true,
        trim: true,
    },
    razorpayPaymentId: {
        type: String,
        trim: true,
    },
    razorpaySignature: {
        type: String,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        enum: ['INR', 'USD'],
        default: 'INR',
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        trim: true,
    },
    paymentDetails: {
        method: String,
        cardId: String,
        bank: String,
        wallet: String,
        vpa: String,
        contact: String,
        email: String,
        card: {
            last4: String,
            network: String,
            type: String,
            issuer: String,
        },
    },
    notes: {
        type: String,
        trim: true,
    },
    failureReason: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

paymentSchema.index({ order: 1 });
paymentSchema.index({ supplier: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

