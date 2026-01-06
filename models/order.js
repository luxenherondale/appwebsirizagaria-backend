const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order identification
  buy_order: {
    type: String,
    required: true,
    unique: true,
    maxlength: 26
  },
  session_id: {
    type: String,
    required: true,
    maxlength: 61
  },
  
  // Customer information
  customer: {
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String, required: true },
    region: { type: String, required: true },
    comuna: { type: String, required: true },
    direccion: { type: String, required: true },
    notas: { type: String }
  },
  
  // Order details
  items: [{
    product: { type: String, default: 'La Nueva Violencia Moderna' },
    quantity: { type: Number, required: true, min: 1 },
    unit_price: { type: Number, required: true }
  }],
  
  subtotal: { type: Number, required: true },
  shipping_cost: { type: Number, required: true, default: 0 },
  total: { type: Number, required: true },
  
  // Payment information
  payment_method: {
    type: String,
    enum: ['webpay', 'transferencia'],
    required: true
  },
  
  // Transbank specific fields
  transbank_token: { type: String },
  transbank_url: { type: String },
  
  // Transaction response data
  transaction_data: {
    vci: String,
    authorization_code: String,
    payment_type_code: String,
    response_code: Number,
    installments_number: Number,
    card_last4: String,
    accounting_date: String,
    transaction_date: Date
  },
  
  // Order status
  status: {
    type: String,
    enum: ['initiated', 'pending_payment', 'confirmed', 'cancelled', 'refunded', 'failed', 'shipped', 'delivered'],
    default: 'initiated'
  },
  
  // Invoice information
  invoice_url: { type: String },
  tracking_number: { type: String },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  confirmed_at: { type: Date },
  cancelled_at: { type: Date }
});

// Update timestamp on save
orderSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Generate unique buy_order
orderSchema.statics.generateBuyOrder = function() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `SA${timestamp}${random}`.substring(0, 26);
};

// Generate session_id
orderSchema.statics.generateSessionId = function() {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

module.exports = mongoose.model('Order', orderSchema);
