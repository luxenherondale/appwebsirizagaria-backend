const mongoose = require('mongoose');

const emailAuditSchema = new mongoose.Schema({
  messageId: {
    type: String,
    unique: true,
    sparse: true
  },
  to: {
    type: String,
    required: true,
    index: true
  },
  cc: [String],
  bcc: [String],
  subject: {
    type: String,
    required: true
  },
  templateName: {
    type: String,
    index: true
  },
  from: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending',
    index: true
  },
  statusCode: {
    type: Number
  },
  errorMessage: String,
  relatedOrderId: {
    type: String,
    index: true
  },
  relatedUserId: {
    type: String,
    index: true
  },
  emailType: {
    type: String,
    enum: ['order-confirmation', 'transfer-confirmation', 'shipping-notification', 'test', 'custom'],
    index: true
  },
  htmlContent: {
    type: String,
    select: false
  },
  textContent: {
    type: String,
    select: false
  },
  templateData: {
    type: mongoose.Schema.Types.Mixed,
    select: false
  },
  smtpResponse: {
    type: mongoose.Schema.Types.Mixed,
    select: false
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    initiatedBy: String,
    initiatedByEmail: String
  },
  sentAt: {
    type: Date,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

emailAuditSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

emailAuditSchema.index({ createdAt: -1 });
emailAuditSchema.index({ to: 1, createdAt: -1 });
emailAuditSchema.index({ status: 1, createdAt: -1 });
emailAuditSchema.index({ relatedOrderId: 1, createdAt: -1 });

module.exports = mongoose.model('EmailAudit', emailAuditSchema);
