const mongoose = require('mongoose');

const dteSchema = new mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  tipoDTE: {
    type: Number,
    required: true,
    enum: [33, 34, 39, 41, 43, 46, 52, 56, 61, 110, 111, 112],
    index: true
  },
  folio: {
    type: Number,
    sparse: true,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected', 'cancelled'],
    default: 'pending',
    index: true
  },
  rutEmisor: {
    type: String,
    required: true,
    index: true
  },
  rutReceptor: {
    type: String,
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    index: true
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    index: true
  },
  shippingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipping',
    index: true
  },
  fechaEmision: {
    type: Date,
    default: Date.now,
    index: true
  },
  fechaVencimiento: Date,
  mntNeto: Number,
  mntExe: Number,
  tasaIVA: {
    type: Number,
    default: 19
  },
  iva: Number,
  mntTotal: {
    type: Number,
    required: true
  },
  formaPago: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  },
  detalle: [
    {
      nroLinDet: Number,
      nmbItem: String,
      dscItem: String,
      qtyItem: Number,
      unmdItem: String,
      prcItem: Number,
      descuentoMonto: Number,
      descuentoPct: Number,
      montoItem: Number,
      cdgItem: [
        {
          tpoCodigo: String,
          vlrCodigo: String
        }
      ]
    }
  ],
  transporte: {
    patente: String,
    rutTrans: String,
    rutChofer: String,
    nombreChofer: String,
    dirDest: String,
    cmnaDest: String,
    ciudadDest: String
  },
  referencia: [
    {
      nroLinRef: Number,
      tpoDocRef: String,
      folioRef: Number,
      fchRef: Date,
      codRef: Number,
      razonRef: String
    }
  ],
  dteXml: String,
  dteJson: mongoose.Schema.Types.Mixed,
  siiResponse: mongoose.Schema.Types.Mixed,
  siiError: String,
  processedAt: Date,
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

dteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

dteSchema.index({ rutEmisor: 1, tipoDTE: 1, folio: 1 });
dteSchema.index({ customerId: 1, status: 1 });
dteSchema.index({ createdAt: -1 });

module.exports = mongoose.model('DTE', dteSchema);
