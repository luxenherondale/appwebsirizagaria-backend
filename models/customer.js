const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  rut: {
    type: String,
    sparse: true,
    index: true,
    trim: true
  },
  email: {
    type: String,
    sparse: true,
    index: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  phone: String,
  address: String,
  commune: String,
  region: String,
  country: {
    type: String,
    default: 'Chile'
  },
  businessName: String,
  businessType: {
    type: String,
    enum: ['individual', 'business'],
    default: 'individual'
  },
  taxId: String,
  notes: String,
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  totalOwed: {
    type: Number,
    default: 0
  },
  lastOrderDate: Date,
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

customerSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

customerSchema.index({ rut: 1, email: 1, name: 1 });
customerSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Customer', customerSchema);
