const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer');
const auth = require('../middleware/auth');

router.get('/', customerController.getAllCustomers);

router.get('/:id', customerController.getCustomerById);

router.post('/', auth, customerController.createCustomer);

router.put('/:id', auth, customerController.updateCustomer);

router.delete('/:id', auth, customerController.deleteCustomer);

router.get('/rut/:rut', customerController.getCustomerByRut);

router.get('/:id/orders', customerController.getCustomerOrders);

router.get('/:id/invoices', customerController.getCustomerInvoices);

router.get('/:id/stats', customerController.getCustomerStats);

module.exports = router;
