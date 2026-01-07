const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
  guiaNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true
  },
  shippingDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  expectedDeliveryDate: Date,
  actualDeliveryDate: Date,
  shippingMethod: {
    type: String,
    enum: ['pickup', 'delivery', 'courier', 'mail'],
    required: true
  },
  carrier: String,
  trackingNumber: String,
  trackingUrl: String,
  items: [
    {
      bookId: mongoose.Schema.Types.ObjectId,
      description: String,
      quantity: Number,
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number
      }
    }
  ],
  totalWeight: Number,
  totalDimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    address: String,
    commune: String,
    region: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Chile'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'prepared', 'shipped', 'in_transit', 'delivered', 'returned', 'cancelled'],
    default: 'pending',
    index: true
  },
  guiaElectronica: {
    type: String,
    enum: ['pending', 'generated', 'sent', 'acknowledged', 'error'],
    default: 'pending'
  },
  guiaElectronicaNumber: String,
  guiaElectronicaUrl: String,
  guiaElectronicaError: String,
  signature: String,
  signatureDate: Date,
  notes: String,
  internalNotes: String,
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

shippingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

shippingSchema.index({ orderId: 1, shippingDate: -1 });
shippingSchema.index({ customerId: 1, status: 1 });
shippingSchema.index({ trackingNumber: 1 });
shippingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Shipping', shippingSchema);
