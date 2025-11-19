const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a business name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email address'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address',
        ],
    },
    phone: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false, // Don't return password by default
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpireTime: {
        type: Date,
        default: null,
    },
    profileImage: {
        type: String,
        default: null,
    },
    businessInfo: {
        registrationNumber: String,
        taxId: String,
        businessType: String,
        establishedDate: Date,
        fullBusinessName: String, // e.g., "Urban Supply Co. Ltd."
    },
    website: {
        type: String,
        trim: true,
    },
    aboutUs: {
        type: String,
        trim: true,
    },
    specialties: [{
        type: String, // e.g., "Building Materials", "Power Tools", "Plumbing"
    }],
    verification: {
        isVerified: {
            type: Boolean,
            default: false,
        },
        verifiedDate: Date,
    },
    badges: [{
        type: String, // e.g., "Top Rated", "Verified"
    }],
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
    },
    businessHours: {
        monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
        sunday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    },
    deliverySettings: {
        deliveryRadius: Number, // in km
        deliveryFee: Number,
        freeDeliveryThreshold: Number,
        deliveryTime: String, // e.g., "2-3 days"
    },
    paymentMethods: [{
        type: { type: String }, // 'card', 'bank'
        last4: String,
        brand: String,
        isDefault: { type: Boolean, default: false },
    }],
    bankAccounts: [{
        bankName: String,
        accountNumber: String,
        routingNumber: String,
        accountHolderName: String,
        isDefault: { type: Boolean, default: false },
    }],
    metrics: {
        rating: { type: Number, default: 0 },
        onTimePercentage: { type: Number, default: 0 },
        totalSupplied: { type: Number, default: 0 },
        joinDate: { type: Date, default: Date.now },
    },
}, {
    timestamps: true,
});

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

