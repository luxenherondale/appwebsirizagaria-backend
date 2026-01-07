const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
    index: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  reservedQuantity: {
    type: Number,
    default: 0
  },
  availableQuantity: {
    type: Number,
    default: function() {
      return this.quantity - this.reservedQuantity;
    }
  },
  location: String,
  warehouseSection: String,
  notes: String,
  lastRestockDate: Date,
  expiryDate: Date,
  condition: {
    type: String,
    enum: ['new', 'used', 'damaged', 'refurbished'],
    default: 'new'
  },
  costPerUnit: Number,
  totalCost: {
    type: Number,
    default: function() {
      return (this.quantity || 0) * (this.costPerUnit || 0);
    }
  },
  movements: [
    {
      type: {
        type: String,
        enum: ['in', 'out', 'adjustment', 'return', 'damage']
      },
      quantity: Number,
      reason: String,
      reference: String,
      date: {
        type: Date,
        default: Date.now
      },
      createdBy: String
    }
  ],
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

stockSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.availableQuantity = Math.max(0, this.quantity - this.reservedQuantity);
  this.totalCost = this.quantity * (this.costPerUnit || 0);
  next();
});

stockSchema.index({ customerId: 1, bookId: 1 });
stockSchema.index({ customerId: 1, availableQuantity: 1 });
stockSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Stock', stockSchema);
