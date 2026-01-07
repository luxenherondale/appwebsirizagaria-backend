const express = require('express');
const router = express.Router();
const purchaseOrderController = require('../controllers/purchaseOrder');
const auth = require('../middleware/auth');

router.get('/', purchaseOrderController.getAllPurchaseOrders);

router.get('/:id', purchaseOrderController.getPurchaseOrderById);

router.post('/', auth, purchaseOrderController.createPurchaseOrder);

router.put('/:id', auth, purchaseOrderController.updatePurchaseOrder);

router.post('/:id/receive', auth, purchaseOrderController.receivePurchaseOrder);

router.post('/:id/cancel', auth, purchaseOrderController.cancelPurchaseOrder);

module.exports = router;
