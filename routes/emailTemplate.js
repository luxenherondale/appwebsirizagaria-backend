const express = require('express');
const router = express.Router();
const emailTemplateController = require('../controllers/emailTemplate');
const auth = require('../middleware/auth');

router.get('/', emailTemplateController.getAllTemplates);

router.get('/:id', emailTemplateController.getTemplateById);

router.post('/', auth, emailTemplateController.createTemplate);

router.put('/:id', auth, emailTemplateController.updateTemplate);

router.delete('/:id', auth, emailTemplateController.deleteTemplate);

router.get('/name/:name', emailTemplateController.getTemplateByName);

router.post('/:id/preview', auth, emailTemplateController.previewTemplate);

router.post('/:id/duplicate', auth, emailTemplateController.duplicateTemplate);

module.exports = router;
