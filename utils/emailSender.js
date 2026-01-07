class EmailSender {
  constructor() {
    this.transporter = null;
    this.initialized = false;
  }

  /**
   * Initialize the email service with nodemailer
   * Reads SMTP configuration from environment variables
   * @param {object} customAdapter - Optional custom SMTP adapter (overrides nodemailer)
   */
  initialize(customAdapter = null) {
    try {
      // If custom adapter provided, use it
      if (customAdapter) {
        return this.setAdapter(customAdapter);
      }

      // Use nodemailer with SMTP configuration from .env
      const nodemailer = require('nodemailer');
      
      const smtpConfig = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      };

      // Validate required SMTP configuration
      if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        console.warn('⚠️  Email configuration incomplete. Email sending will be disabled.');
        console.warn('Required environment variables:');
        console.warn('  - SMTP_HOST');
        console.warn('  - SMTP_USER');
        console.warn('  - SMTP_PASSWORD');
        this.initialized = false;
        return false;
      }

      // Create nodemailer transporter
      this.transporter = nodemailer.createTransport(smtpConfig);
      this.initialized = true;

      console.log('✅ Email service initialized with nodemailer');
      console.log(`   SMTP Server: ${smtpConfig.host}:${smtpConfig.port}`);
      console.log(`   Secure: ${smtpConfig.secure}`);
      console.log(`   User: ${smtpConfig.auth.user}`);

      return true;
    } catch (error) {
      console.error('❌ Error initializing email service:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Set custom SMTP adapter
   * The adapter must implement the SMTPAdapter interface
   * @param {object} adapter - Custom SMTP adapter instance
   */
  setAdapter(adapter) {
    if (!adapter || typeof adapter.send !== 'function') {
      throw new Error('SMTP adapter must implement send(mailOptions) method');
    }
    this.transporter = adapter;
    this.initialized = true;
    console.log('✅ Custom SMTP adapter registered');
    return true;
  }

  /**
   * Verify SMTP connection
   * Useful for testing configuration
   */
  async verifyConnection() {
    if (!this.transporter) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return { success: true, message: 'SMTP connection verified' };
    } catch (error) {
      console.error('❌ SMTP verification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email via SMTP
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} html - HTML content
   * @param {object} options - Additional options (cc, bcc, replyTo, etc.)
   * @returns {object} Result with success status and message ID
   */
  async sendEmail(to, subject, html, options = {}) {
    try {
      if (!this.initialized) {
        return {
          success: false,
          error: 'Email service not initialized. Check SMTP configuration in .env'
        };
      }

      if (!this.transporter) {
        return {
          success: false,
          error: 'Email transporter not available'
        };
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@sirizagaria.com',
        to,
        subject,
        html,
        ...options
      };

      const info = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent to ${to}. Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        response: info.response
      };
    } catch (error) {
      console.error('❌ Error sending email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send email with template
   * Convenience method that combines rendering and sending
   * @param {string} to - Recipient email address
   * @param {string} subject - Email subject
   * @param {string} templateName - Name of template to render
   * @param {object} templateData - Data for template rendering
   * @param {object} options - Additional email options
   * @returns {object} Result with success status
   */
  async sendTemplateEmail(to, subject, templateName, templateData, options = {}) {
    try {
      const emailService = require('./emailService');
      
      // Render template
      const html = emailService.renderTemplate(templateName, templateData);

      // Send email
      return await this.sendEmail(to, subject, html, options);
    } catch (error) {
      console.error('Error sending template email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send order confirmation email
   * @param {object} order - Order document
   * @param {string} to - Recipient email (optional, uses order customer email if not provided)
   * @returns {object} Result with success status
   */
  async sendOrderConfirmationEmail(order, to = null) {
    try {
      const emailService = require('./emailService');
      const recipientEmail = to || order.customer.email;
      const templateData = emailService.prepareOrderConfirmationData(order);

      return await this.sendTemplateEmail(
        recipientEmail,
        'Confirmación de Orden - Siriza Agaria',
        'order-confirmation',
        templateData
      );
    } catch (error) {
      console.error('Error sending order confirmation email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send transfer confirmation email
   * @param {object} order - Order document
   * @param {string} to - Recipient email (optional, uses order customer email if not provided)
   * @returns {object} Result with success status
   */
  async sendTransferConfirmationEmail(order, to = null) {
    try {
      const emailService = require('./emailService');
      const recipientEmail = to || order.customer.email;
      const templateData = emailService.prepareTransferConfirmationData(order);

      return await this.sendTemplateEmail(
        recipientEmail,
        'Transferencia Confirmada - Siriza Agaria',
        'transfer-confirmation',
        templateData
      );
    } catch (error) {
      console.error('Error sending transfer confirmation email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send shipping notification email
   * @param {object} order - Order document
   * @param {string} to - Recipient email (optional, uses order customer email if not provided)
   * @returns {object} Result with success status
   */
  async sendShippingNotificationEmail(order, to = null) {
    try {
      const emailService = require('./emailService');
      const recipientEmail = to || order.customer.email;
      const templateData = emailService.prepareShippingNotificationData(order);

      return await this.sendTemplateEmail(
        recipientEmail,
        'Tu Orden ha sido Enviada - Siriza Agaria',
        'shipping-notification',
        templateData
      );
    } catch (error) {
      console.error('Error sending shipping notification email:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check if email service is ready
   * @returns {boolean} True if initialized and ready to send
   */
  isReady() {
    return this.initialized && this.transporter !== null;
  }
}

// Create singleton instance
const emailSender = new EmailSender();

module.exports = emailSender;
