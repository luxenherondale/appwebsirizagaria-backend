const EmailAudit = require('../models/emailAudit');

exports.getEmailAuditLog = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, to, relatedOrderId, emailType, startDate, endDate } = req.query;

    const filter = {};
    
    if (status) filter.status = status;
    if (to) filter.to = new RegExp(to, 'i');
    if (relatedOrderId) filter.relatedOrderId = relatedOrderId;
    if (emailType) filter.emailType = emailType;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const total = await EmailAudit.countDocuments(filter);
    
    const emails = await EmailAudit.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching email audit log:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getEmailAuditDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const email = await EmailAudit.findById(id);
    
    if (!email) {
      return res.status(404).json({
        success: false,
        error: 'Email audit record not found'
      });
    }

    res.json({
      success: true,
      data: email
    });
  } catch (error) {
    console.error('Error fetching email audit detail:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getEmailAuditStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await EmailAudit.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const emailTypeStats = await EmailAudit.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$emailType',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await EmailAudit.countDocuments(filter);
    const sent = stats.find(s => s._id === 'sent')?.count || 0;
    const failed = stats.find(s => s._id === 'failed')?.count || 0;
    const pending = stats.find(s => s._id === 'pending')?.count || 0;

    res.json({
      success: true,
      stats: {
        total,
        byStatus: {
          sent,
          failed,
          pending,
          successRate: total > 0 ? ((sent / total) * 100).toFixed(2) + '%' : '0%'
        },
        byEmailType: emailTypeStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching email audit stats:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getEmailsByOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const emails = await EmailAudit.find({ relatedOrderId: orderId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: emails
    });
  } catch (error) {
    console.error('Error fetching emails by order:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getEmailsByRecipient = async (req, res) => {
  try {
    const { email } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const total = await EmailAudit.countDocuments({ to: email });
    
    const emails = await EmailAudit.find({ to: email })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: emails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching emails by recipient:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.resendEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const emailSender = require('../utils/emailSender');

    const audit = await EmailAudit.findById(id);
    
    if (!audit) {
      return res.status(404).json({
        success: false,
        error: 'Email audit record not found'
      });
    }

    if (!audit.htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Cannot resend email - original content not available'
      });
    }

    const result = await emailSender.sendEmail(
      audit.to,
      audit.subject,
      audit.htmlContent,
      {
        cc: audit.cc,
        bcc: audit.bcc
      }
    );

    if (result.success) {
      const newAudit = new EmailAudit({
        messageId: result.messageId,
        to: audit.to,
        cc: audit.cc,
        bcc: audit.bcc,
        subject: audit.subject,
        templateName: audit.templateName,
        from: audit.from,
        status: 'sent',
        relatedOrderId: audit.relatedOrderId,
        relatedUserId: audit.relatedUserId,
        emailType: audit.emailType,
        htmlContent: audit.htmlContent,
        textContent: audit.textContent,
        templateData: audit.templateData,
        smtpResponse: result,
        metadata: {
          ...audit.metadata,
          initiatedBy: req.user?.id || 'system',
          initiatedByEmail: req.user?.email || 'system'
        },
        sentAt: new Date()
      });

      await newAudit.save();

      res.json({
        success: true,
        message: 'Email resent successfully',
        newAuditId: newAudit._id,
        messageId: result.messageId
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error resending email:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteEmailAudit = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await EmailAudit.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Email audit record not found'
      });
    }

    res.json({
      success: true,
      message: 'Email audit record deleted'
    });
  } catch (error) {
    console.error('Error deleting email audit:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.exportEmailAudit = async (req, res) => {
  try {
    const { format = 'json', status, emailType, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (emailType) filter.emailType = emailType;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const emails = await EmailAudit.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      const csv = convertToCSV(emails);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="email-audit.csv"');
      res.send(csv);
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="email-audit.json"');
      res.send(JSON.stringify(emails, null, 2));
    }
  } catch (error) {
    console.error('Error exporting email audit:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

function convertToCSV(data) {
  if (!data || data.length === 0) return '';

  const headers = ['ID', 'To', 'Subject', 'Status', 'Email Type', 'Order ID', 'Sent At', 'Created At'];
  const rows = data.map(email => [
    email._id,
    email.to,
    email.subject,
    email.status,
    email.emailType,
    email.relatedOrderId || 'N/A',
    email.sentAt ? new Date(email.sentAt).toISOString() : 'N/A',
    new Date(email.createdAt).toISOString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}
