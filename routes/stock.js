const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock');
const auth = require('../middleware/auth');

router.get('/', stockController.getAllStock);

router.get('/:id', stockController.getStockById);

router.post('/', auth, stockController.createStock);

router.put('/:id', auth, stockController.updateStock);

router.post('/:id/reserve', auth, stockController.reserveStock);

router.post('/:id/release', auth, stockController.releaseStock);

router.get('/customer/:customerId', stockController.getCustomerStock);

module.exports = router;
