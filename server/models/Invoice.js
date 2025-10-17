const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  jobCardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobCard',
    required: false
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'other']
  },
  paymentDate: {
    type: Date
  },
    notes: {
      type: String
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  ,
  zatca: {
    qrCode: String,
    qrCodeImage: String,
    invoiceNumber: String,
    invoiceDate: Date,
    vatAmount: Number,
    subtotal: Number,
    compliance: {
      phase: Number,
      isCompliant: Boolean,
      errors: [String],
      warnings: [String]
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Invoice', invoiceSchema);
