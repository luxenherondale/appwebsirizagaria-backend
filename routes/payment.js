const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment');

// Create a new payment transaction
router.post('/create', paymentController.createTransaction);

// Transbank return URL (handles both POST and GET)
router.post('/return', paymentController.confirmTransaction);
router.get('/return', paymentController.confirmTransaction);

// Get transaction/order status
router.get('/status/:order_id', paymentController.getTransactionStatus);

// Refund a transaction (admin only)
router.post('/refund/:order_id', paymentController.refundTransaction);

// Retry a failed/cancelled payment
router.post('/retry/:order_id', paymentController.retryPayment);

// Get all orders (admin only)
router.get('/orders', paymentController.getOrders);

// Confirm bank transfer payment (admin only)
router.post('/confirm-transfer/:order_id', paymentController.confirmTransferPayment);

// Update order status (admin only)
router.put('/status/:order_id', paymentController.updateOrderStatus);

module.exports = router;
