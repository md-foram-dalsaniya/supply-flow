const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getOrders,
  getRecentOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
} = require('../controllers/orderController');

// All order routes are protected
router.use(protect);

// @route   GET /api/orders/recent
// @desc    Get recent orders
// @access  Private
router.get('/recent', getRecentOrders);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private
router.get('/', getOrders);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', getOrder);

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', createOrder);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', updateOrderStatus);

// @route   PUT /api/orders/:id
// @desc    Update order
// @access  Private
router.put('/:id', updateOrder);

// @route   DELETE /api/orders/:id
// @desc    Delete order
// @access  Private
router.delete('/:id', deleteOrder);

module.exports = router;

