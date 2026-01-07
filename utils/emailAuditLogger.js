const EmailAudit = require('../models/emailAudit');

class EmailAuditLogger {
  async logEmail(emailData) {
    try {
      const audit = new EmailAudit({
        messageId: emailData.messageId,
        to: emailData.to,
        cc: emailData.cc,
        bcc: emailData.bcc,
        subject: emailData.subject,
        templateName: emailData.templateName,
        from: emailData.from,
        status: emailData.status || 'sent',
        statusCode: emailData.statusCode,
        errorMessage: emailData.errorMessage,
        relatedOrderId: emailData.relatedOrderId,
        relatedUserId: emailData.relatedUserId,
        emailType: emailData.emailType,
        htmlContent: emailData.htmlContent,
        textContent: emailData.textContent,
        templateData: emailData.templateData,
        smtpResponse: emailData.smtpResponse,
        metadata: emailData.metadata || {},
        sentAt: emailData.sentAt || new Date()
      });

      await audit.save();
      return audit;
    } catch (error) {
      console.error('Error logging email to audit:', error.message);
      return null;
    }
  }

  async logEmailSent(to, subject, messageId, smtpResponse, options = {}) {
    return this.logEmail({
      messageId,
      to,
      cc: options.cc,
      bcc: options.bcc,
      subject,
      templateName: options.templateName,
      from: options.from,
      status: 'sent',
      relatedOrderId: options.relatedOrderId,
      relatedUserId: options.relatedUserId,
      emailType: options.emailType,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
      templateData: options.templateData,
      smtpResponse,
      metadata: options.metadata,
      sentAt: new Date()
    });
  }

  async logEmailFailed(to, subject, error, options = {}) {
    return this.logEmail({
      to,
      subject,
      from: options.from,
      status: 'failed',
      errorMessage: error.message || error,
      statusCode: error.statusCode,
      relatedOrderId: options.relatedOrderId,
      relatedUserId: options.relatedUserId,
      emailType: options.emailType,
      templateName: options.templateName,
      metadata: options.metadata,
      sentAt: new Date()
    });
  }

  async getEmailLog(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) query.status = filters.status;
      if (filters.to) query.to = new RegExp(filters.to, 'i');
      if (filters.relatedOrderId) query.relatedOrderId = filters.relatedOrderId;
      if (filters.emailType) query.emailType = filters.emailType;
      
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const limit = filters.limit || 50;
      const skip = ((filters.page || 1) - 1) * limit;

      const emails = await EmailAudit.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await EmailAudit.countDocuments(query);

      return {
        emails,
        total,
        page: filters.page || 1,
        limit,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching email log:', error.message);
      return null;
    }
  }

  async getEmailStats(filters = {}) {
    try {
      const query = {};
      
      if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
        if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
      }

      const stats = await EmailAudit.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const total = await EmailAudit.countDocuments(query);
      const sent = stats.find(s => s._id === 'sent')?.count || 0;
      const failed = stats.find(s => s._id === 'failed')?.count || 0;
      const pending = stats.find(s => s._id === 'pending')?.count || 0;

      return {
        total,
        sent,
        failed,
        pending,
        successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('Error fetching email stats:', error.message);
      return null;
    }
  }
}

module.exports = new EmailAuditLogger();
