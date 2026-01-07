const emailSender = require('./emailSender');

class SmtpManager {
  constructor() {
    this.currentConfig = null;
  }

  async loadConfigFromDatabase() {
    try {
      const SmtpConfig = require('../models/smtpConfig');
      const config = await SmtpConfig.findOne();
      
      if (config) {
        this.currentConfig = config;
        return config;
      }
      return null;
    } catch (error) {
      console.error('Error loading SMTP config from database:', error.message);
      return null;
    }
  }

  async applyConfiguration(config) {
    try {
      if (!config) {
        console.warn('No SMTP configuration provided');
        return false;
      }

      process.env.SMTP_HOST = config.host;
      process.env.SMTP_PORT = config.port;
      process.env.SMTP_SECURE = config.secure ? 'true' : 'false';
      process.env.SMTP_USER = config.auth.user;
      process.env.SMTP_PASSWORD = config.auth.pass;
      process.env.EMAIL_FROM = config.from;

      this.currentConfig = config;

      const initialized = emailSender.initialize();
      return initialized;
    } catch (error) {
      console.error('Error applying SMTP configuration:', error.message);
      return false;
    }
  }

  getCurrentConfig() {
    return this.currentConfig;
  }

  isConfigured() {
    return this.currentConfig !== null;
  }

  async verifyAndApply(config) {
    try {
      const applied = await this.applyConfiguration(config);
      
      if (!applied) {
        return {
          success: false,
          error: 'Failed to apply configuration'
        };
      }

      const result = await emailSender.verifyConnection();
      return result;
    } catch (error) {
      console.error('Error verifying and applying configuration:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SmtpManager();
