import mongoose from 'mongoose';
const { Schema } = mongoose;

const VehicleInspectionSchema = new Schema({
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'InspectionTemplate', required: true },
  inspectionDate: { type: Date, required: true },
  mileage: { type: Number, required: true },
  overallCondition: { type: String, required: true },
  items: [{
    itemId: { type: String, required: true },
    condition: { type: String, enum: ['good', 'fair', 'poor', 'critical'], required: true },
    notes: { type: String, required: false },
    photos: [{ type: String }],
    recommendations: { type: String, required: false },
    estimatedCost: { type: Number, required: false, min: 0 }, // Make optional
    priority: { type: String, enum: ['critical', 'safety', 'recommended', 'optional'], required: true },
  }],
  totalEstimatedCost: { type: Number, required: true, min: 0 }, // Add total cost
  recommendations: { type: String, required: false }, // Add overall recommendations
  nextInspectionDate: { type: Date, required: false }, // Add next inspection date
  status: { type: String, enum: ['in-progress', 'completed', 'cancelled'], default: 'in-progress' }, // Add status
  createdAt: { type: Date, default: Date.now }, // Add timestamps
  updatedAt: { type: Date, default: Date.now },
});

const VehicleInspection = (mongoose.models && mongoose.models.VehicleInspection) || mongoose.model('VehicleInspection', VehicleInspectionSchema);

export default VehicleInspection;