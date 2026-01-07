const express = require('express');
const router = express.Router();
const contabilidadController = require('../controllers/contabilidad');
const auth = require('../middleware/auth');

router.get('/', auth, contabilidadController.getAllTransactions);

router.get('/summary', auth, contabilidadController.getFinancialSummary);

router.get('/:id', auth, contabilidadController.getTransactionById);

router.post('/', auth, contabilidadController.createTransaction);

router.put('/:id', auth, contabilidadController.updateTransaction);

router.post('/:id/verify', auth, contabilidadController.verifyTransaction);

router.post('/:id/reconcile', auth, contabilidadController.reconcileTransaction);

router.get('/customer/:customerId/summary', auth, contabilidadController.getCustomerFinancialSummary);

module.exports = router;
