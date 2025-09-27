import mongoose from 'mongoose';
const { Schema } = mongoose;

const EstimateSchema = new Schema({
  jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: false },
  inspectionId: { type: Schema.Types.ObjectId, ref: 'VehicleInspection', required: false },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: { type: String, required: false },
  services: [{
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: false },
    name: { type: String, required: false, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    laborCost: { type: Number, required: true, min: 0 },
    partsCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 }
  }],
  parts: [{
    partId: { type: Schema.Types.ObjectId, ref: 'Part', required: false },
    name: { type: String, required: false, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
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