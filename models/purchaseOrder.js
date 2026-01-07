const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema({
  purchaseOrderNumber: {
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
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    index: true
  },
  supplierName: String,
  supplierEmail: String,
  supplierPhone: String,
  poDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  requiredDeliveryDate: Date,
  actualDeliveryDate: Date,
  items: [
    {
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number,
      bookId: mongoose.Schema.Types.ObjectId,
      sku: String
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
    enum: ['draft', 'sent', 'acknowledged', 'in_progress', 'partially_received', 'received', 'cancelled'],
    default: 'draft',
    index: true
  },
  paymentTerms: String,
  shippingTerms: String,
  notes: String,
  internalNotes: String,
  attachments: [String],
  createdBy: String,
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

purchaseOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  this.subtotal = this.items.reduce((sum, item) => sum + (item.total || 0), 0);
  this.tax = Math.round(this.subtotal * (this.taxRate / 100));
  this.total = this.subtotal + this.tax;
  
  next();
});

purchaseOrderSchema.index({ customerId: 1, poDate: -1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
