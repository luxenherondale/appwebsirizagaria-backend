class EmailSender {
  constructor() {
    this.smtpAdapter = null;
    this.initialized = false;
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
    this.smtpAdapter = adapter;
    this.initialized = true;
    console.log('Custom SMTP adapter registered');
    return true;
  }

  /**
   * Initialize the email service
   * Can use either custom adapter or default nodemailer
   * @param {object} customAdapter - Optional custom SMTP adapter
   */
  initialize(customAdapter = null) {
    try {
      // If custom adapter provided, use it
      if (customAdapter) {
        return this.setAdapter(customAdapter);
      }

      // Otherwise, try to use nodemailer if available
      try {
        const nodemailer = require('nodemailer');
        
        const smtpConfig = {
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        };

        if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
          console.warn('Email configuration incomplete. Email sending will be disabled.');
          console.warn('Required: SMTP_HOST, SMTP_USER, SMTP_PASSWORD');
          this.initialized = false;
          return false;
        }

        const transporter = nodemailer.createTransport(smtpConfig);
        
        // Wrap nodemailer in adapter interface
        this.smtpAdapter = {
          send: async (mailOptions) => {
            const info = await transporter.sendMail(mailOptions);
            return {
              success: true,
              messageId: info.messageId,
              response: info.response
            };
          },
          verify: async () => {
            await transporter.verify();
            return { success: true };
          }
        };

        this.initialized = true;
        console.log('Email service initialized with nodemailer');
        return true;
      } catch (nodemailerError) {
        console.warn('Nodemailer not available. Please provide custom SMTP adapter.');
        this.initialized = false;
        return false;
      }
    } catch (error) {
      console.error('Error initializing email service:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Verify SMTP connection
   * Useful for testing configuration
   */
  async verifyConnection() {
    if (!this.smtpAdapter) {
      return { success: false, error: 'Email service not initialized' };
    }

    try {
      if (this.smtpAdapter.verify) {
        return await this.smtpAdapter.verify();
      }
      return { success: true, message: 'SMTP adapter ready' };
    } catch (error) {
      console.error('SMTP verification failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send email
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
          error: 'Email service not initialized. Check SMTP configuration or provide custom adapter.'
        };
      }

      if (!this.smtpAdapter) {
        return {
          success: false,
          error: 'Email adapter not available'
        };
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@sirizagaria.com',
        to,
        subject,
        html,
        ...options
      };

      const result = await this.smtpAdapter.send(mailOptions);

      if (result.success) {
        console.log(`Email sent successfully to ${to}. Message ID: ${result.messageId || 'N/A'}`);
      }

      return result;
    } catch (error) {
      console.error('Error sending email:', error.message);
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
