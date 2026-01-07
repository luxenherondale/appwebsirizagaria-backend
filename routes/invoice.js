const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice');
const auth = require('../middleware/auth');

router.get('/', invoiceController.getAllInvoices);

router.get('/stats', invoiceController.getInvoiceStats);

router.get('/:id', invoiceController.getInvoiceById);

router.post('/', auth, invoiceController.createInvoice);

router.put('/:id', auth, invoiceController.updateInvoice);

router.post('/:id/payment', auth, invoiceController.recordPayment);

module.exports = router;
