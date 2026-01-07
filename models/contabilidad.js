const mongoose = require('mongoose');

const contabilidadSchema = new mongoose.Schema({
  transactionNumber: {
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
  transactionDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'adjustment'],
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: ['payment', 'invoice', 'purchase_order', 'refund', 'adjustment', 'other'],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'CLP'
  },
  relatedInvoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true
  },
  relatedPaymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    index: true
  },
  relatedPurchaseOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PurchaseOrder',
    index: true
  },
  relatedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  paymentMethod: String,
  reference: String,
  invoiceAttachment: String,
  notes: String,
  internalNotes: String,
  status: {
    type: String,
    enum: ['pending', 'verified', 'recorded', 'reconciled'],
    default: 'pending',
    index: true
  },
  verifiedBy: String,
  verifiedDate: Date,
  recordedBy: String,
  recordedDate: Date,
  reconciliationStatus: {
    type: String,
    enum: ['unreconciled', 'reconciled', 'disputed'],
    default: 'unreconciled'
  },
  reconciliationDate: Date,
  reconciliationNotes: String,
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

contabilidadSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

contabilidadSchema.index({ customerId: 1, transactionDate: -1 });
contabilidadSchema.index({ type: 1, category: 1, transactionDate: -1 });
contabilidadSchema.index({ status: 1, reconciliationStatus: 1 });
contabilidadSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Contabilidad', contabilidadSchema);
