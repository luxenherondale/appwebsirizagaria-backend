const express = require('express');
const router = express.Router();
const dteController = require('../controllers/dte');
const auth = require('../middleware/auth');

router.get('/', dteController.getAllDocuments);

router.get('/stats', dteController.getDocumentStats);

router.get('/pending/:uuid', dteController.getPendingDocumentStatus);

router.get('/:rutEmisor/:tipoDTE/:folio', dteController.getDocumentByFolio);

router.get('/uuid/:uuid', dteController.getDocumentByUUID);

router.post('/', auth, dteController.createDocument);

router.post('/factura/create', auth, dteController.createFacturaElectronica);

router.post('/boleta/create', auth, dteController.createBoletaElectronica);

router.post('/guia/create', auth, dteController.createGuiaDespacho);

router.post('/nota-credito/create', auth, dteController.createNotaCredito);

router.post('/nota-debito/create', auth, dteController.createNotaDebito);

router.post('/from-invoice', auth, dteController.createFromInvoice);

router.post('/from-shipping', auth, dteController.createFromShipping);

router.put('/:id/status', auth, dteController.updateDocumentStatus);

module.exports = router;
