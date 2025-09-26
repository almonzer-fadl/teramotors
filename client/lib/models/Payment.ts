import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['cash', 'card', 'bank_transfer', 'check']
  },
  paymentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  reference: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for better query performance
PaymentSchema.index({ invoiceId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ paymentDate: -1 });
PaymentSchema.index({ paymentMethod: 1 });

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
