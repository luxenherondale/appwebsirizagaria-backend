const express = require('express');
const router = express.Router();
const smtpConfigController = require('../controllers/smtpConfig');
const auth = require('../middleware/auth');

router.get('/config', smtpConfigController.getSmtpConfig);

router.put('/config', auth, smtpConfigController.updateSmtpConfig);

router.post('/verify', auth, smtpConfigController.verifySmtpConnection);

router.post('/test', auth, smtpConfigController.testSmtpEmail);

router.post('/reset', auth, smtpConfigController.resetSmtpConfig);

router.get('/status', smtpConfigController.getSmtpStatus);

module.exports = router;
