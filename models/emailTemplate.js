const mongoose = require('mongoose');

const emailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: String,
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  textContent: String,
  type: {
    type: String,
    enum: ['order-confirmation', 'transfer-confirmation', 'shipping-notification', 'custom'],
    required: true,
    index: true
  },
  placeholders: [
    {
      name: String,
      description: String,
      required: Boolean
    }
  ],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 1
  },
  createdBy: String,
  updatedBy: String,
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

emailTemplateSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

emailTemplateSchema.index({ type: 1, isActive: 1 });
emailTemplateSchema.index({ createdAt: -1 });

module.exports = mongoose.model('EmailTemplate', emailTemplateSchema);
