const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    createRazorpayOrder,
    verifyPayment,
    getPaymentStatus,
    cancelPayment,
    storePaymentId,
} = require('../controllers/paymentController');
const {
    getPaymentHistory,
    getPaymentById,
} = require('../controllers/paymentHistoryController');

router.use(protect);

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.post('/store-payment-id', storePaymentId);
router.get('/status/:orderId', getPaymentStatus);
router.post('/cancel', cancelPayment);
router.get('/history', getPaymentHistory);
router.get('/history/:paymentId', getPaymentById);

module.exports = router;

