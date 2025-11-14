const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a product name'],
        trim: true,
    },
    category: {
        type: String,
        required: [true, 'Please provide a product category'],
        trim: true,
        enum: [
            'Building Materials',
            'Tools',
            'Electrical',
            'Plumbing',
            'Hardware',
            'Other',
        ],
    },
    description: {
        type: String,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Please provide a product price'],
        min: [0, 'Price cannot be negative'],
    },
    stock: {
        type: Number,
        required: [true, 'Please provide stock quantity'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
    },
    lowStockThreshold: {
        type: Number,
        default: 10,
        min: [0, 'Low stock threshold cannot be negative'],
    },
    soldQuantity: {
        type: Number,
        default: 0,
        min: [0, 'Sold quantity cannot be negative'],
    },
    image: {
        type: String,
        default: null,
    },
    imagePublicId: {
        type: String,
        default: null,
    },
    images: [{
        type: String, // Cloudinary URLs - up to 6 images
    }],
    imagePublicIds: [{
        type: String,
    }],
    discount: {
        type: Number,
        default: 0,
        min: [0, 'Discount cannot be negative'],
        max: [100, 'Discount cannot exceed 100%'],
    },
    unit: {
        type: String,
        default: 'Unit',
        trim: true,
    },
    specifications: [{
        name: {
            type: String,
            trim: true,
        },
        value: {
            type: String,
            trim: true,
        },
    }],
    deliveryOptions: {
        availableForDelivery: {
            type: Boolean,
            default: true,
        },
        availableForPickup: {
            type: Boolean,
            default: true,
        },
    },
    ranking: {
        position: {
            type: Number,
            default: null,
        },
        category: {
            type: String,
            default: null,
        },
        tags: [{
            type: String, // "Top Rated", "Best Seller", "Popular", "Promoted"
        }],
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});

// Index for search functionality
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ price: 1 });
productSchema.index({ soldQuantity: -1 });

// Virtual to check if stock is low
productSchema.virtual('isLowStock').get(function () {
    return this.stock <= this.lowStockThreshold;
});

module.exports = mongoose.model('Product', productSchema);

