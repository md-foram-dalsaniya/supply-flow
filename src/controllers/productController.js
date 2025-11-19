const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

exports.getProducts = async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            stockStatus, // comma-separated: "inStock,lowStock,outOfStock"
            sortBy, // "newest", "price-low-to-high", "price-high-to-low", "best-selling"
            page = 1,
            limit = 20,
        } = req.query;

        const query = {
            supplier: req.user.id,
            isActive: true,
        };

        if (category && category !== 'All') {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                query.price.$gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                query.price.$lte = parseFloat(maxPrice);
            }
        }

        if (stockStatus) {
            const statuses = stockStatus.split(',').map((s) => s.trim());
            const stockConditions = [];

            if (statuses.includes('inStock')) {
                stockConditions.push({
                    $expr: { $gt: ['$stock', '$lowStockThreshold'] },
                });
            }

            if (statuses.includes('lowStock')) {
                stockConditions.push({
                    $and: [
                        { stock: { $gt: 0 } },
                        { $expr: { $lte: ['$stock', '$lowStockThreshold'] } },
                    ],
                });
            }

            if (statuses.includes('outOfStock')) {
                stockConditions.push({ stock: 0 });
            }

            if (stockConditions.length > 0) {
                query.$or = stockConditions;
            }
        }

        if (search) {
            query.$text = { $search: search };
        }

        let sortObject = {};
        switch (sortBy) {
            case 'newest':
                sortObject = { createdAt: -1 };
                break;
            case 'price-low-to-high':
                sortObject = { price: 1 };
                break;
            case 'price-high-to-low':
                sortObject = { price: -1 };
                break;
            case 'best-selling':
                sortObject = { soldQuantity: -1, createdAt: -1 };
                break;
            default:
                sortObject = { createdAt: -1 };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        let products;
        let total;

        if (search) {
            products = await Product.find(query, { score: { $meta: 'textScore' } })
                .sort(sortBy === 'newest' && search
                    ? { score: { $meta: 'textScore' }, createdAt: -1 }
                    : sortBy === 'newest'
                        ? { createdAt: -1 }
                        : sortObject)
                .skip(skip)
                .limit(parseInt(limit));

            total = await Product.countDocuments(query);
        } else {
            products = await Product.find(query)
                .sort(sortObject)
                .skip(skip)
                .limit(parseInt(limit));

            total = await Product.countDocuments(query);
        }

        const productsWithStatus = products.map((product) => {
            const productObj = product.toObject();
            if (product.stock === 0) {
                productObj.stockStatus = 'outOfStock';
            } else if (product.stock <= product.lowStockThreshold) {
                productObj.stockStatus = 'lowStock';
            } else {
                productObj.stockStatus = 'inStock';
            }
            return productObj;
        });

        res.status(200).json({
            success: true,
            count: productsWithStatus.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            products: productsWithStatus,
        });
    } catch (error) {
        console.error('❌ Get products error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products. Please try again.',
        });
    }
};

exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Add stock status indicator
        const productObj = product.toObject();
        if (product.stock === 0) {
            productObj.stockStatus = 'outOfStock';
        } else if (product.stock <= product.lowStockThreshold) {
            productObj.stockStatus = 'lowStock';
        } else {
            productObj.stockStatus = 'inStock';
        }

        res.status(200).json({
            success: true,
            product: productObj,
        });
    } catch (error) {
        console.error('❌ Get product error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product. Please try again.',
        });
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private
exports.createProduct = async (req, res) => {
    try {
        const { name, category, description, price, stock, lowStockThreshold, discount, unit, specifications, deliveryOptions } = req.body;

        // Validation - Required fields (marked with * in form)
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide product name (Full Name is required)',
            });
        }

        if (!category || !category.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please provide product category (Category is required)',
            });
        }

        // Validate category enum
        const validCategories = ['Building Materials', 'Tools', 'Electrical', 'Plumbing', 'Hardware', 'Other'];
        if (!validCategories.includes(category)) {
            return res.status(400).json({
                success: false,
                message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
            });
        }

        if (price === undefined || price === null || price === '') {
            return res.status(400).json({
                success: false,
                message: 'Please provide product price (Price is required)',
            });
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a valid number greater than or equal to 0',
            });
        }

        if (stock === undefined || stock === null || stock === '') {
            return res.status(400).json({
                success: false,
                message: 'Please provide stock quantity (Stock Quantity is required)',
            });
        }

        const stockNum = parseInt(stock);
        if (isNaN(stockNum) || stockNum < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock quantity must be a valid number greater than or equal to 0',
            });
        }

        // Validate discount (0-100)
        let discountNum = 0;
        if (discount !== undefined && discount !== null && discount !== '') {
            discountNum = parseFloat(discount);
            if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount must be a number between 0 and 100',
                });
            }
        }

        // Validate specifications format
        if (specifications && !Array.isArray(specifications)) {
            return res.status(400).json({
                success: false,
                message: 'Specifications must be an array of objects with name and value',
            });
        }

        // Validate delivery options format
        if (deliveryOptions && typeof deliveryOptions !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Delivery options must be an object',
            });
        }

        // Create product
        const product = await Product.create({
            name: name.trim(),
            category,
            description: description ? description.trim() : '',
            price: priceNum,
            stock: stockNum,
            lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 10,
            discount: discountNum,
            unit: unit ? unit.trim() : 'Unit',
            specifications: specifications || [],
            deliveryOptions: deliveryOptions || {
                availableForDelivery: true,
                availableForPickup: true,
            },
            images: [],
            imagePublicIds: [],
            supplier: req.user.id,
        });

        console.log(`✅ Product created: ${product.name} (ID: ${product._id})`);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product,
        });
    } catch (error) {
        console.error('❌ Create product error:', error.message);

        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create product. Please check your information and try again.',
        });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, category, description, price, stock, lowStockThreshold, isActive, discount, unit, specifications, deliveryOptions } = req.body;

        // Find product
        let product = await Product.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Update fields with validation
        if (name !== undefined) {
            if (!name || !name.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Product name (Full Name) is required and cannot be empty',
                });
            }
            product.name = name.trim();
        }

        if (category !== undefined) {
            const validCategories = ['Building Materials', 'Tools', 'Electrical', 'Plumbing', 'Hardware', 'Other'];
            if (!validCategories.includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Must be one of: ${validCategories.join(', ')}`,
                });
            }
            product.category = category;
        }

        if (description !== undefined) {
            product.description = description ? description.trim() : '';
        }

        if (price !== undefined) {
            const priceNum = parseFloat(price);
            if (isNaN(priceNum) || priceNum < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Price must be a valid number greater than or equal to 0',
                });
            }
            product.price = priceNum;
        }

        if (stock !== undefined) {
            const stockNum = parseInt(stock);
            if (isNaN(stockNum) || stockNum < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock quantity must be a valid number greater than or equal to 0',
                });
            }
            product.stock = stockNum;
        }

        if (lowStockThreshold !== undefined) {
            product.lowStockThreshold = parseInt(lowStockThreshold);
        }

        if (isActive !== undefined) {
            // Handle both boolean and string values
            if (typeof isActive === 'string') {
                product.isActive = isActive.toLowerCase() === 'true' || isActive === '1';
            } else {
                product.isActive = Boolean(isActive);
            }
        }

        if (discount !== undefined) {
            const discountNum = parseFloat(discount);
            if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Discount must be a number between 0 and 100',
                });
            }
            product.discount = discountNum;
        }

        if (unit !== undefined) {
            product.unit = unit ? unit.trim() : 'Unit';
        }

        if (specifications !== undefined) {
            if (!Array.isArray(specifications)) {
                return res.status(400).json({
                    success: false,
                    message: 'Specifications must be an array of objects with name and value',
                });
            }
            product.specifications = specifications;
        }

        if (deliveryOptions !== undefined) {
            if (typeof deliveryOptions !== 'object' || Array.isArray(deliveryOptions)) {
                return res.status(400).json({
                    success: false,
                    message: 'Delivery options must be an object',
                });
            }
            product.deliveryOptions = {
                availableForDelivery: deliveryOptions.availableForDelivery !== undefined
                    ? Boolean(deliveryOptions.availableForDelivery)
                    : product.deliveryOptions?.availableForDelivery ?? true,
                availableForPickup: deliveryOptions.availableForPickup !== undefined
                    ? Boolean(deliveryOptions.availableForPickup)
                    : product.deliveryOptions?.availableForPickup ?? true,
            };
        }

        await product.save();

        console.log(`✅ Product updated: ${product.name} (ID: ${product._id})`);

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            product,
        });
    } catch (error) {
        console.error('❌ Update product error:', error.message);

        // Handle validation errors from Mongoose
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', '),
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update product. Please check your information and try again.',
        });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Delete associated images from Cloudinary
        if (product.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(product.imagePublicId);
            } catch (error) {
                console.error('❌ Error deleting main image from Cloudinary:', error.message);
            }
        } else if (product.image) {
            try {
                const urlParts = product.image.split('/');
                const uploadIndex = urlParts.findIndex((part) => part === 'upload');
                if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
                    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
                    const fallbackPublicId = pathAfterUpload.split('.')[0];
                    await cloudinary.uploader.destroy(fallbackPublicId);
                }
            } catch (error) {
                console.error('❌ Error deleting main image (fallback) from Cloudinary:', error.message);
            }
        }

        if (product.imagePublicIds && product.imagePublicIds.length > 0) {
            for (const publicId of product.imagePublicIds) {
                if (!publicId) continue;
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (error) {
                    console.error('❌ Error deleting gallery image from Cloudinary:', error.message);
                }
            }
        } else if (product.images && product.images.length > 0) {
            for (const imageUrl of product.images) {
                if (!imageUrl) continue;
                try {
                    const urlParts = imageUrl.split('/');
                    const uploadIndex = urlParts.findIndex((part) => part === 'upload');
                    if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
                        const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
                        const fallbackPublicId = pathAfterUpload.split('.')[0];
                        await cloudinary.uploader.destroy(fallbackPublicId);
                    }
                } catch (error) {
                    console.error('❌ Error deleting gallery image (fallback) from Cloudinary:', error.message);
                }
            }
        }

        // Hard delete - actually remove from database
        await Product.findByIdAndDelete(req.params.id);

        console.log(`✅ Product deleted: ${product.name} (ID: ${req.params.id})`);
        res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error('❌ Delete product error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product. Please try again.',
        });
    }
};

exports.uploadProductImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an image file',
            });
        }

        // Find product
        const product = await Product.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Delete old image from Cloudinary if exists
        if (product.imagePublicId) {
            try {
                await cloudinary.uploader.destroy(product.imagePublicId);
            } catch (error) {
                console.error('❌ Error deleting old main image from Cloudinary:', error.message);
            }
        } else if (product.image) {
            try {
                const urlParts = product.image.split('/');
                const uploadIndex = urlParts.findIndex((part) => part === 'upload');
                if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
                    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
                    const fallbackPublicId = pathAfterUpload.split('.')[0];
                    await cloudinary.uploader.destroy(fallbackPublicId);
                }
            } catch (error) {
                console.error('❌ Error deleting old image (fallback) from Cloudinary:', error.message);
            }
        }

        // Upload new image
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'instasupply/products',
                resource_type: 'image',
                transformation: [
                    { width: 800, height: 800, crop: 'limit' },
                    { quality: 'auto' },
                ],
            },
            async (error, result) => {
                if (error) {
                    console.error('❌ Cloudinary upload error:', error.message);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to upload image. Please try again.',
                    });
                }

                try {
                    // Update product image
                    product.image = result.secure_url;
                    product.imagePublicId = result.public_id;
                    await product.save();

                    console.log(`✅ Product image uploaded: ${result.secure_url}`);
                    res.status(200).json({
                        success: true,
                        message: 'Product image uploaded successfully',
                        imageUrl: result.secure_url,
                        product,
                    });
                } catch (updateError) {
                    console.error('❌ Database update error:', updateError.message);
                    res.status(500).json({
                        success: false,
                        message: 'Failed to update product. Please try again.',
                    });
                }
            }
        );

        // Pipe the buffer to the stream
        const bufferStream = new Readable();
        bufferStream.push(req.file.buffer);
        bufferStream.push(null);
        bufferStream.pipe(stream);
    } catch (error) {
        console.error('❌ Upload product image error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image. Please try again.',
        });
    }
};

exports.uploadProductImages = async (req, res) => {
    try {
        console.log(`📤 Uploading images for product: ${req.params.id}`);
        console.log(`📁 Files received: ${req.files ? req.files.length : 0}`);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one image file. Make sure the field name is "images" in Postman (form-data).',
            });
        }

        // Find product
        const product = await Product.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Check if adding these images would exceed 6
        const currentImageCount = product.images ? product.images.length : 0;
        if (currentImageCount + req.files.length > 6) {
            return res.status(400).json({
                success: false,
                message: 'Maximum 6 images allowed. Please remove some images first.',
            });
        }

        console.log(`📤 Uploading ${req.files.length} image(s) to Cloudinary...`);

        // Upload images to Cloudinary
        const uploadPromises = req.files.map((file, index) => {
            return new Promise((resolve, reject) => {
                if (!file.buffer) {
                    console.error(`❌ File ${index + 1} has no buffer data`);
                    reject(new Error(`File ${index + 1} has no buffer data`));
                    return;
                }

                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'instasupply/products',
                        resource_type: 'image',
                        transformation: [
                            { width: 800, height: 800, crop: 'limit' },
                            { quality: 'auto' },
                        ],
                    },
                    (error, result) => {
                        if (error) {
                            console.error(`❌ Cloudinary upload error for file ${index + 1}:`, error.message);
                            reject(error);
                        } else {
                            console.log(`✅ Image ${index + 1} uploaded: ${result.secure_url}`);
                            resolve({
                                url: result.secure_url,
                                publicId: result.public_id,
                            });
                        }
                    }
                );

                const bufferStream = new Readable();
                bufferStream.push(file.buffer);
                bufferStream.push(null);
                bufferStream.pipe(stream);
            });
        });

        const uploadedImages = await Promise.all(uploadPromises);
        const imageUrls = uploadedImages.map((img) => img.url);
        const imagePublicIds = uploadedImages.map((img) => img.publicId);
        console.log(`✅ All ${imageUrls.length} images uploaded successfully`);

        // Update product with new images
        if (!product.images) {
            product.images = [];
        }
        if (!product.imagePublicIds) {
            product.imagePublicIds = [];
        }
        product.images = [...product.images, ...imageUrls];
        product.imagePublicIds = [...product.imagePublicIds, ...imagePublicIds];

        // Set first image as featured image if not set
        if (!product.image && imageUrls.length > 0) {
            product.image = imageUrls[0];
            product.imagePublicId = imagePublicIds[0] || null;
        }

        await product.save();
        console.log(`✅ Product updated with ${product.images.length} total images`);

        res.status(200).json({
            success: true,
            message: 'Images uploaded successfully',
            images: imageUrls,
            product,
        });
    } catch (error) {
        console.error('❌ Upload product images error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to upload image. Please try again.',
        });
    }
};

exports.deleteProductImage = async (req, res) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            supplier: req.user.id,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const imageIndex = parseInt(req.params.imageIndex);

        if (isNaN(imageIndex)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid image index. Must be a number.',
            });
        }

        if (!product.images || product.images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Product has no images to delete',
            });
        }

        if (imageIndex < 0 || imageIndex >= product.images.length) {
            return res.status(400).json({
                success: false,
                message: `Invalid image index. Product has ${product.images.length} image(s). Use index 0 to ${product.images.length - 1}.`,
            });
        }

        // Get the image URL before deleting
        const imageUrl = product.images[imageIndex];
        const imagePublicId = product.imagePublicIds ? product.imagePublicIds[imageIndex] : null;
        console.log(`🗑️ Deleting image at index ${imageIndex}: ${imageUrl}`);

        // Delete from Cloudinary
        if (imagePublicId) {
            try {
                console.log(`🗑️ Deleting from Cloudinary: ${imagePublicId}`);
                const result = await cloudinary.uploader.destroy(imagePublicId);
                if (result.result === 'ok') {
                    console.log(`✅ Image deleted from Cloudinary`);
                } else {
                    console.log(`⚠️ Cloudinary deletion result: ${result.result}`);
                }
            } catch (error) {
                console.error('❌ Error deleting image from Cloudinary:', error.message);
                // Continue with database deletion even if Cloudinary deletion fails
            }
        } else if (imageUrl) {
            try {
                const urlParts = imageUrl.split('/');
                const uploadIndex = urlParts.findIndex((part) => part === 'upload');
                if (uploadIndex !== -1 && uploadIndex < urlParts.length - 1) {
                    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
                    const fallbackPublicId = pathAfterUpload.split('.')[0];
                    console.log(`🗑️ Deleting from Cloudinary (fallback): ${fallbackPublicId}`);
                    await cloudinary.uploader.destroy(fallbackPublicId);
                }
            } catch (error) {
                console.error('❌ Error deleting image from Cloudinary (fallback):', error.message);
            }
        }

        // Remove from array
        product.images.splice(imageIndex, 1);
        if (product.imagePublicIds && product.imagePublicIds.length > imageIndex) {
            product.imagePublicIds.splice(imageIndex, 1);
        }

        // Update featured image if it was deleted
        if (product.image === imageUrl) {
            if (product.images.length > 0) {
                product.image = product.images[0];
                product.imagePublicId = product.imagePublicIds ? product.imagePublicIds[0] : null;
                console.log(`🖼️ Updated featured image to first remaining image`);
            } else {
                product.image = null;
                product.imagePublicId = null;
                console.log(`🖼️ Removed featured image (no images remaining)`);
            }
        }

        await product.save();
        console.log(`✅ Product updated. Remaining images: ${product.images.length}`);

        res.status(200).json({
            success: true,
            message: 'Image deleted successfully',
            product,
        });
    } catch (error) {
        console.error('❌ Delete product image error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to delete image. Please try again.',
        });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category', {
            supplier: req.user.id,
            isActive: true,
        });

        res.status(200).json({
            success: true,
            categories: ['All', ...categories],
        });
    } catch (error) {
        console.error('❌ Get categories error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories. Please try again.',
        });
    }
};

