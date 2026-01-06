const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const paymentController = require('../controllers/payment');
const auth = require('../middleware/auth');

// Configure multer for invoice uploads
const invoiceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'invoices'));
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    cb(null, `invoice_${timestamp}_${random}.pdf`);
  }
});

const invoiceUpload = multer({
  storage: invoiceStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Create a new payment transaction
router.post('/create', paymentController.createTransaction);

// Transbank return URL (handles both POST and GET)
router.post('/return', paymentController.confirmTransaction);
router.get('/return', paymentController.confirmTransaction);

// Get transaction/order status
router.get('/status/:order_id', paymentController.getTransactionStatus);

// Refund a transaction (admin only)
router.post('/refund/:order_id', auth, paymentController.refundTransaction);

// Retry a failed/cancelled payment
router.post('/retry/:order_id', paymentController.retryPayment);

// Get all orders (admin only)
router.get('/orders', auth, paymentController.getOrders);

// Confirm bank transfer payment (admin only)
router.post('/confirm-transfer/:order_id', auth, paymentController.confirmTransferPayment);

// Update order status (admin only)
router.put('/status/:order_id', auth, paymentController.updateOrderStatus);

// Send confirmation email (admin only)
router.post('/send-confirmation/:order_id', auth, paymentController.sendConfirmationEmail);

// Upload invoice (admin only)
router.post('/invoice/:buyOrder', auth, invoiceUpload.single('invoice'), paymentController.uploadInvoice);

// Download invoice (admin only)
router.get('/invoice/:buyOrder', auth, paymentController.downloadInvoice);

module.exports = router;
