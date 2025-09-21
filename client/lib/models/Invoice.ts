import mongoose from 'mongoose';
const { Schema } = mongoose;

const InvoiceSchema = new Schema({
  jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled'], default: 'pending' },
  notes: { type: String, required: false },
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, required: false, min: 0 }, // Make optional
  dueDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bank_transfer', 'other'], required: false }, // Make optional
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  paymentDate: { type: Date, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Invoice = (mongoose.models && mongoose.models.Invoice) || mongoose.model('Invoice', InvoiceSchema);

export default Invoice;