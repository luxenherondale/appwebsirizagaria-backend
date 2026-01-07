const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  purchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    index: true
  },
  invoiceDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  dueDate: Date,
  items: [
    {
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number,
      bookId: mongoose.Schema.Types.ObjectId
    }
  ],
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 19
  },
  total: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'CLP'
  },
  status: {
    type: String,
    enum: ['draft', 'issued', 'sent', 'viewed', 'paid', 'partially_paid', 'overdue', 'cancelled'],
    default: 'draft',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partially_paid', 'paid'],
    default: 'unpaid',
    index: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  amountOwed: {
    type: Number,
    default: function() {
      return this.total;
    }
  },
  payments: [
    {
      paymentId: mongoose.Schema.Types.ObjectId,
      amount: Number,
      paymentDate: Date,
      paymentMethod: String,
      reference: String
    }
  ],
  notes: String,
  internalNotes: String,
  attachments: [String],
  issuedBy: String,
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

invoiceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  this.subtotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
  this.tax = Math.round(this.subtotal * (this.taxRate / 100));
  this.total = this.subtotal + this.tax;
  this.amountOwed = this.total - this.amountPaid;
  
  if (this.amountOwed <= 0) {
    this.paymentStatus = 'paid';
  } else if (this.amountPaid > 0) {
    this.paymentStatus = 'partially_paid';
  } else {
    this.paymentStatus = 'unpaid';
  }
  
  next();
});

invoiceSchema.index({ customerId: 1, invoiceDate: -1 });
invoiceSchema.index({ status: 1, paymentStatus: 1 });
invoiceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Invoice', invoiceSchema);
