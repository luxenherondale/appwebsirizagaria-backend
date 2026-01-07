const EmailTemplate = require('../models/emailTemplate');

exports.getAllTemplates = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const filter = {};

    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const templates = await EmailTemplate.find(filter)
      .select('-htmlContent -textContent')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching email templates:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching email template:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { name, displayName, description, subject, htmlContent, textContent, type, placeholders, isActive } = req.body;

    if (!name || !displayName || !subject || !htmlContent || !type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, displayName, subject, htmlContent, type'
      });
    }

    const existingTemplate = await EmailTemplate.findOne({ name });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        error: `Template with name "${name}" already exists`
      });
    }

    const template = new EmailTemplate({
      name,
      displayName,
      description,
      subject,
      htmlContent,
      textContent,
      type,
      placeholders: placeholders || [],
      isActive: isActive !== false,
      createdBy: req.user?.id || 'system',
      updatedBy: req.user?.id || 'system'
    });

    await template.save();

    res.status(201).json({
      success: true,
      message: 'Email template created successfully',
      data: template
    });
  } catch (error) {
    console.error('Error creating email template:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, subject, htmlContent, textContent, placeholders, isActive } = req.body;

    const template = await EmailTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    if (displayName) template.displayName = displayName;
    if (description !== undefined) template.description = description;
    if (subject) template.subject = subject;
    if (htmlContent) template.htmlContent = htmlContent;
    if (textContent !== undefined) template.textContent = textContent;
    if (placeholders) template.placeholders = placeholders;
    if (isActive !== undefined) template.isActive = isActive;

    template.version = (template.version || 1) + 1;
    template.updatedBy = req.user?.id || 'system';

    await template.save();

    res.json({
      success: true,
      message: 'Email template updated successfully',
      data: template
    });
  } catch (error) {
    console.error('Error updating email template:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await EmailTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    if (template.isDefault) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete default email templates'
      });
    }

    await EmailTemplate.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Email template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting email template:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getTemplateByName = async (req, res) => {
  try {
    const { name } = req.params;

    const template = await EmailTemplate.findOne({ name });

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error fetching email template:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.previewTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    const template = await EmailTemplate.findById(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    const emailService = require('../utils/emailService');
    const previewData = data || {};
    
    const renderedHtml = emailService.renderTemplate(template.name, previewData);

    res.json({
      success: true,
      data: {
        subject: template.subject,
        htmlContent: renderedHtml,
        textContent: template.textContent
      }
    });
  } catch (error) {
    console.error('Error previewing email template:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.duplicateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName } = req.body;

    if (!newName) {
      return res.status(400).json({
        success: false,
        error: 'newName is required'
      });
    }

    const originalTemplate = await EmailTemplate.findById(id);

    if (!originalTemplate) {
      return res.status(404).json({
        success: false,
        error: 'Email template not found'
      });
    }

    const existingTemplate = await EmailTemplate.findOne({ name: newName });
    if (existingTemplate) {
      return res.status(400).json({
        success: false,
        error: `Template with name "${newName}" already exists`
      });
    }

    const newTemplate = new EmailTemplate({
      name: newName,
      displayName: `${originalTemplate.displayName} (Copy)`,
      description: originalTemplate.description,
      subject: originalTemplate.subject,
      htmlContent: originalTemplate.htmlContent,
      textContent: originalTemplate.textContent,
      type: originalTemplate.type,
      placeholders: originalTemplate.placeholders,
      isActive: true,
      isDefault: false,
      version: 1,
      createdBy: req.user?.id || 'system',
      updatedBy: req.user?.id || 'system'
    });

    await newTemplate.save();

    res.status(201).json({
      success: true,
      message: 'Email template duplicated successfully',
      data: newTemplate
    });
  } catch (error) {
    console.error('Error duplicating email template:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
