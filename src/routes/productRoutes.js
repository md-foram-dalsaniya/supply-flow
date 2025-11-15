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

router.use(protect);

router.get('/categories', getCategories);
router.post('/:id/upload-image', upload.single('image'), uploadProductImage);
router.post('/:id/upload-images', upload.array('images', 6), uploadProductImages);
router.delete('/:id/images/:imageIndex', deleteProductImage);

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;

