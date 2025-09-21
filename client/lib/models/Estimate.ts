import mongoose from 'mongoose';
const { Schema } = mongoose;

const EstimateSchema = new Schema({
  jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: { type: String, required: false },
  services: [{
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    quantity: { type: Number, required: true, min: 1 },
    laborCost: { type: Number, required: true, min: 0 },
    partsCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  validUntil: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Estimate = (mongoose.models && mongoose.models.Estimate) || mongoose.model('Estimate', EstimateSchema);

export default Estimate;