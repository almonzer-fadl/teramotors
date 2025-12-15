import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

export interface IInvoice extends Document {
  tenantId: MongooseSchema.Types.ObjectId;
  invoiceNumber: string;
  jobCardId?: MongooseSchema.Types.ObjectId;
  inspectionId?: MongooseSchema.Types.ObjectId;
  isInspectionInvoice?: boolean;
  customerId: MongooseSchema.Types.ObjectId;
  vehicleId: MongooseSchema.Types.ObjectId;
  mechanicId?: MongooseSchema.Types.ObjectId;
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  totalAmount: number;
  paidAmount?: number;
  dueDate: Date;
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'other';
  paymentDate?: Date;
  paidAt?: Date;
  zatca?: {
    qrCode?: string;
    qrCodeImage?: string;
    invoiceNumber?: string;
    invoiceDate?: Date;
    vatAmount?: number;
    subtotal?: number;
    compliance?: {
      phase: number;
      isCompliant: boolean;
      errors: string[];
      warnings: string[];
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

interface InvoiceModel extends mongoose.Model<IInvoice> {
  findByTenant(
    tenantId: string | mongoose.Types.ObjectId,
    filter?: Record<string, unknown>
  ): Promise<IInvoice[]>;
  getNextInvoiceNumber(
    tenantId: string | mongoose.Types.ObjectId
  ): Promise<string>;
}

const { Schema } = mongoose;

const InvoiceSchema = new Schema<IInvoice>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  invoiceNumber: {
    type: String,
    required: true,
  },
  jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: false },
  inspectionId: { type: Schema.Types.ObjectId, ref: 'VehicleInspection', required: false },
  isInspectionInvoice: { type: Boolean, default: false },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'Mechanic', required: false },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  notes: { type: String, required: false },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: false, min: 0 },
  dueDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'other'], required: false },
  paymentDate: { type: Date, required: false },
  paidAt: { type: Date, required: false },

  // ZATCA compliance fields
  zatca: {
    qrCode: { type: String, required: false },
    qrCodeImage: { type: String, required: false },
    invoiceNumber: { type: String, required: false },
    invoiceDate: { type: Date, required: false },
    vatAmount: { type: Number, required: false },
    subtotal: { type: Number, required: false },
    compliance: {
      phase: { type: Number, default: 1 },
      isCompliant: { type: Boolean, default: true },
      errors: [{ type: String }],
      warnings: [{ type: String }]
    }
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
InvoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ tenantId: 1, customerId: 1 });
InvoiceSchema.index({ tenantId: 1, vehicleId: 1 });
InvoiceSchema.index({ tenantId: 1, jobCardId: 1 });
InvoiceSchema.index({ tenantId: 1, inspectionId: 1 });
InvoiceSchema.index({ tenantId: 1, status: 1 });
InvoiceSchema.index({ tenantId: 1, dueDate: 1 });
InvoiceSchema.index({ tenantId: 1, createdAt: -1 });
InvoiceSchema.index({ tenantId: 1, 'zatca.invoiceNumber': 1 });
InvoiceSchema.index({ tenantId: 1, status: 1, createdAt: 1 });
InvoiceSchema.index({ tenantId: 1, isInspectionInvoice: 1 });

// Helper method to find invoices by tenant
InvoiceSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

// Generate next invoice number for tenant
InvoiceSchema.statics.getNextInvoiceNumber = async function(
  tenantId: string | mongoose.Types.ObjectId
) {
  try {
    const lastInvoice = await this.findOne({ tenantId })
      .sort({ createdAt: -1 })
      .select('invoiceNumber');

    const rawInvoiceNumber = typeof lastInvoice?.invoiceNumber === 'string'
      ? lastInvoice.invoiceNumber.trim()
      : '';

    if (!rawInvoiceNumber) {
      return 'INV-0001';
    }

    const prefixMatch = rawInvoiceNumber.match(/^([A-Za-z]+)-/);
    const numberMatch = rawInvoiceNumber.match(/(\d+)$/);
    const prefix = prefixMatch ? prefixMatch[1] : 'INV';
    const lastNumber = numberMatch ? parseInt(numberMatch[1], 10) : 0;
    const safeLastNumber = Number.isFinite(lastNumber) ? lastNumber : 0;
    const nextNumber = (safeLastNumber + 1).toString().padStart(4, '0');
    return `${prefix}-${nextNumber}`;
  } catch (error) {
    return 'INV-0001';
  }
};

const Invoice =
  (mongoose.models.Invoice as InvoiceModel) ||
  mongoose.model<IInvoice, InvoiceModel>('Invoice', InvoiceSchema);

export default Invoice;
