const mongoose = require('mongoose');

const smtpConfigSchema = new mongoose.Schema({
  host: {
    type: String,
    required: true,
    default: ''
  },
  port: {
    type: Number,
    required: true,
    default: 587
  },
  secure: {
    type: Boolean,
    default: false
  },
  auth: {
    user: {
      type: String,
      required: true,
      default: ''
    },
    pass: {
      type: String,
      required: true,
      default: ''
    }
  },
  from: {
    type: String,
    required: true,
    default: ''
  },
  fromName: {
    type: String,
    default: 'Siriza Agaria'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

smtpConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('SmtpConfig', smtpConfigSchema);
