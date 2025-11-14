const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a campaign name'],
        trim: true,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    dailyBudget: {
        type: Number,
        required: [true, 'Please provide a daily budget'],
        min: [0, 'Daily budget cannot be negative'],
    },
    totalBudgetSpent: {
        type: Number,
        default: 0,
        min: [0, 'Total budget spent cannot be negative'],
    },
    status: {
        type: String,
        enum: ['Active', 'Paused', 'Completed', 'Cancelled'],
        default: 'Active',
    },
    impressions: {
        type: Number,
        default: 0,
    },
    clicks: {
        type: Number,
        default: 0,
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    endDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

// Indexes
campaignSchema.index({ supplier: 1, createdAt: -1 });
campaignSchema.index({ status: 1 });

// Virtual for CTR (Click-Through Rate)
campaignSchema.virtual('ctr').get(function () {
    return this.impressions > 0 ? ((this.clicks / this.impressions) * 100).toFixed(2) : 0;
});

module.exports = mongoose.model('Campaign', campaignSchema);

