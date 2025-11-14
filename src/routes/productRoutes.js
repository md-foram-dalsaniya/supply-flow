const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  uploadProductImages,
  deleteProductImage,
  getCategories,
} = require('../controllers/productController');

// All product routes are protected
router.use(protect);

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Private
router.get('/categories', getCategories);

// @route   GET /api/products
// @desc    Get all products
// @access  Private
router.get('/', getProducts);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Private
router.get('/:id', getProduct);

// @route   POST /api/products
// @desc    Create new product
// @access  Private
router.post('/', createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private
router.put('/:id', updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private
router.delete('/:id', deleteProduct);

// @route   POST /api/products/:id/upload-image
// @desc    Upload single product image
// @access  Private
router.post('/:id/upload-image', upload.single('image'), uploadProductImage);

// @route   POST /api/products/:id/upload-images
// @desc    Upload multiple product images (up to 6)
// @access  Private
router.post('/:id/upload-images', upload.array('images', 6), uploadProductImages);

// @route   DELETE /api/products/:id/images/:imageIndex
// @desc    Delete product image
// @access  Private
router.delete('/:id/images/:imageIndex', deleteProductImage);

module.exports = router;

