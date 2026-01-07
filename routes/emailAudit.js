const express = require('express');
const router = express.Router();
const emailAuditController = require('../controllers/emailAudit');
const auth = require('../middleware/auth');

router.get('/log', auth, emailAuditController.getEmailAuditLog);

router.get('/stats', auth, emailAuditController.getEmailAuditStats);

router.get('/:id', auth, emailAuditController.getEmailAuditDetail);

router.get('/order/:orderId', auth, emailAuditController.getEmailsByOrder);

router.get('/recipient/:email', auth, emailAuditController.getEmailsByRecipient);

router.post('/:id/resend', auth, emailAuditController.resendEmail);

router.delete('/:id', auth, emailAuditController.deleteEmailAudit);

router.get('/export/data', auth, emailAuditController.exportEmailAudit);

module.exports = router;
