const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shipping');
const auth = require('../middleware/auth');

router.get('/', shippingController.getAllShipments);

router.get('/:id', shippingController.getShipmentById);

router.post('/', auth, shippingController.createShipment);

router.put('/:id/status', auth, shippingController.updateShipmentStatus);

router.post('/:id/guia-electronica', auth, shippingController.generateGuiaElectronica);

router.get('/order/:orderId', shippingController.getOrderShipments);

module.exports = router;
