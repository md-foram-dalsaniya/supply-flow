const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Quantity must be at least 1'],
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
    },
    subtotal: {
        type: Number,
        required: true,
    },
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative'],
    },
    status: {
        type: String,
        enum: [
            'Pending',
            'New Order',
            'Needs confirmation',
            'Processing',
            'Confirmed',
            'Ready',
            'Ready for pickup',
            'Out for delivery',
            'Delivered',
            'Completed',
            'Cancelled',
        ],
        default: 'New Order',
    },
    customerName: {
        type: String,
        trim: true,
    },
    customerEmail: {
        type: String,
        trim: true,
    },
    customerPhone: {
        type: String,
        trim: true,
    },
    customerType: {
        type: String,
        enum: ['Contractor', 'DIY Homeowner', 'Business', 'Other'],
        default: 'Other',
    },
    deliveryAddress: {
        name: String, // Address label/name (e.g., "John's Construction Site")
        street: String, // Street address
        city: String, // City
        state: String, // State/Province
        zipCode: String, // ZIP/Postal code
        country: String, // Country
        fullAddress: String, // Full address string for backward compatibility
    },
    notes: {
        type: String,
        trim: true,
    },
    deliveryMethod: {
        type: String,
        enum: ['Standard Delivery', 'Express Delivery', 'Pickup'],
        default: 'Standard Delivery',
    },
    deliveryTime: {
        type: String, // e.g., "Today, 2:00 PM - 4:00 PM"
        trim: true,
    },
    paymentMethod: {
        type: {
            type: String,
            enum: ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'],
        },
        last4: String, // Last 4 digits of card
        brand: String, // Card brand
    },
    orderHistory: [{
        status: {
            type: String,
            required: true,
        },
        note: {
            type: String,
            trim: true,
        },
        updatedBy: {
            type: String,
            default: 'System',
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    }],
}, {
    timestamps: true,
});

orderSchema.index({ supplier: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

orderSchema.pre('save', async function (next) {
    try {
        if (!this.orderNumber) {
            const count = await mongoose.model('Order').countDocuments();
            this.orderNumber = `INS${String(count + 1).padStart(4, '0')}`;
        }
        next();
    } catch (error) {
        console.error('❌ Error generating order number:', error.message);
        next(error);
    }
});

orderSchema.pre('save', function (next) {
    if (this.isModified('status') && !this.isNew) {
        if (!this.orderHistory) {
            this.orderHistory = [];
        }
        this.orderHistory.push({
            status: this.status,
            timestamp: new Date(),
        });
    }
    next();
});

module.exports = mongoose.model('Order', orderSchema);

