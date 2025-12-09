import mongoose, { Document } from 'mongoose';

// TypeScript interface for Payment
export interface IPayment extends Document {
  tenantId: mongoose.Types.ObjectId;
  paymentNumber: string;
  invoiceId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'check';
  paymentDate: Date;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  reference?: string;
  notes?: string;
  processedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new mongoose.Schema<IPayment>({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  paymentNumber: {
    type: String,
    required: true,
  },
  invoiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
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

// Compound indexes with tenantId for proper tenant isolation
PaymentSchema.index({ tenantId: 1, paymentNumber: 1 }, { unique: true });
PaymentSchema.index({ tenantId: 1, invoiceId: 1 });
PaymentSchema.index({ tenantId: 1, customerId: 1 });
PaymentSchema.index({ tenantId: 1, status: 1 });
PaymentSchema.index({ tenantId: 1, paymentDate: -1 });
PaymentSchema.index({ tenantId: 1, paymentMethod: 1 });
PaymentSchema.index({ tenantId: 1, createdAt: -1 });

// Helper method to find payments by tenant
PaymentSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
