const SmtpConfig = require('../models/smtpConfig');
const emailSender = require('../utils/emailSender');
const smtpManager = require('../utils/smtpManager');

exports.getSmtpConfig = async (req, res) => {
  try {
    let config = await SmtpConfig.findOne();
    
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'SMTP configuration not found. Please configure SMTP settings via environment variables and API.'
      });
    }

    res.json({
      success: true,
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        from: config.from,
        fromName: config.fromName,
        isActive: config.isActive,
        auth: {
          user: config.auth.user
        }
      }
    });
  } catch (error) {
    console.error('Error getting SMTP config:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateSmtpConfig = async (req, res) => {
  try {
    const { host, port, secure, auth, from, fromName, isActive } = req.body;

    if (!host || !port || !auth || !auth.user || !auth.pass) {
      return res.status(400).json({
        success: false,
        error: 'Missing required SMTP configuration fields: host, port, auth.user, auth.pass'
      });
    }

    let config = await SmtpConfig.findOne();
    
    if (!config) {
      config = new SmtpConfig();
    }

    config.host = host;
    config.port = parseInt(port);
    config.secure = secure === true || secure === 'true';
    config.auth = {
      user: auth.user,
      pass: auth.pass
    };
    config.from = from || auth.user;
    config.fromName = fromName || 'Siriza Agaria';
    config.isActive = isActive !== false;

    await config.save();

    const applied = await smtpManager.applyConfiguration(config);
    
    if (!applied) {
      return res.status(400).json({
        success: false,
        error: 'Configuration saved but failed to initialize email service'
      });
    }

    res.json({
      success: true,
      message: 'SMTP configuration updated successfully',
      config: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        from: config.from,
        fromName: config.fromName,
        isActive: config.isActive,
        auth: {
          user: config.auth.user
        }
      }
    });
  } catch (error) {
    console.error('Error updating SMTP config:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.verifySmtpConnection = async (req, res) => {
  try {
    const result = await emailSender.verifyConnection();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'SMTP connection verified successfully',
        status: 'connected'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        status: 'failed'
      });
    }
  } catch (error) {
    console.error('Error verifying SMTP connection:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      status: 'error'
    });
  }
};

exports.testSmtpEmail = async (req, res) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        error: 'Recipient email address required'
      });
    }

    const result = await emailSender.sendEmail(
      to,
      'Test Email - Siriza Agaria SMTP Configuration',
      `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Test Email</h2>
            <p>This is a test email to verify your SMTP configuration is working correctly.</p>
            <p><strong>Timestamp:</strong> ${new Date().toLocaleString('es-CL')}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              This email was sent from Siriza Agaria backend system.
            </p>
          </body>
        </html>
      `
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.resetSmtpConfig = async (req, res) => {
  try {
    const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD', 'EMAIL_FROM'];
    const missingVars = requiredEnvVars.filter(v => !process.env[v]);

    if (missingVars.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot reset configuration. Missing environment variables: ${missingVars.join(', ')}`
      });
    }

    const defaultConfig = new SmtpConfig({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      from: process.env.EMAIL_FROM,
      fromName: process.env.EMAIL_FROM_NAME || 'Siriza Agaria',
      isActive: true
    });

    await SmtpConfig.deleteMany({});
    await defaultConfig.save();

    const applied = await smtpManager.applyConfiguration(defaultConfig);
    
    if (!applied) {
      return res.status(400).json({
        success: false,
        error: 'Configuration reset but failed to initialize email service'
      });
    }

    res.json({
      success: true,
      message: 'SMTP configuration reset to environment variables',
      config: {
        host: defaultConfig.host,
        port: defaultConfig.port,
        secure: defaultConfig.secure,
        from: defaultConfig.from,
        fromName: defaultConfig.fromName,
        isActive: defaultConfig.isActive,
        auth: {
          user: defaultConfig.auth.user
        }
      }
    });
  } catch (error) {
    console.error('Error resetting SMTP config:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getSmtpStatus = async (req, res) => {
  try {
    const config = await SmtpConfig.findOne();
    const isReady = emailSender.isReady();

    res.json({
      success: true,
      status: {
        configured: !!config,
        active: config?.isActive || false,
        ready: isReady,
        host: config?.host || null,
        port: config?.port || null,
        from: config?.from || null
      }
    });
  } catch (error) {
    console.error('Error getting SMTP status:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.testTemplate = async (req, res) => {
  try {
    const { to, subject, htmlContent } = req.body;

    if (!to || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, subject, htmlContent'
      });
    }

    if (!emailSender.isReady()) {
      return res.status(400).json({
        success: false,
        error: 'Email service is not initialized. Please configure SMTP settings.'
      });
    }

    const result = await emailSender.sendEmail(
      to,
      subject,
      htmlContent,
      {
        emailType: 'test',
        templateName: 'test-template',
        metadata: {
          initiatedBy: req.user?.id || 'system',
          initiatedByEmail: req.user?.email || 'system'
        }
      }
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Error sending test template email:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
