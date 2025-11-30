import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

export interface IInvoice extends Document {
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

const { Schema } = mongoose;

const InvoiceSchema = new Schema({
  jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: false },
  inspectionId: { type: Schema.Types.ObjectId, ref: 'VehicleInspection', required: false },
  isInspectionInvoice: { type: Boolean, default: false },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'Mechanic', required: false },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  notes: { type: String, required: false },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: false, min: 0 }, // Make optional
  dueDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'other'], required: false }, // Make optional
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
});
// Add indexes for better query performance
InvoiceSchema.index({ jobCardId: 1 });
InvoiceSchema.index({ customerId: 1 });
InvoiceSchema.index({ vehicleId: 1 });
InvoiceSchema.index({ mechanicId: 1 });
InvoiceSchema.index({ status: 1 });
InvoiceSchema.index({ dueDate: 1 });
InvoiceSchema.index({ createdAt: -1 });
InvoiceSchema.index({ 'zatca.invoiceNumber': 1 });
InvoiceSchema.index({ status: 1, createdAt: 1 });
InvoiceSchema.index({ inspectionId: 1 });
InvoiceSchema.index({ isInspectionInvoice: 1 });

const Invoice = (mongoose.models && mongoose.models.Invoice) || mongoose.model('Invoice', InvoiceSchema);

export default Invoice;