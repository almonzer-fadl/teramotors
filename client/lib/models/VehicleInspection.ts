import mongoose from 'mongoose';
const { Schema } = mongoose;

const VehicleInspectionSchema = new Schema({
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'InspectionTemplate', required: false },
  inspectionDate: { type: Date, required: true },
  mileage: { type: Number, required: true },
  overallCondition: { type: String, required: true },
  items: [{
    itemId: { type: String, required: true },
    category: { type: String, required: true },
    condition: { type: String, enum: ['good', 'fair', 'poor', 'critical'], required: true },
  }],
  recommendations: { type: String, required: false }, // Add overall recommendations
  nextInspectionDate: { type: Date, required: false }, // Add next inspection date
  status: { type: String, enum: ['in-progress', 'completed', 'cancelled'], default: 'in-progress' }, // Add status
  createdAt: { type: Date, default: Date.now }, // Add timestamps
  updatedAt: { type: Date, default: Date.now },
});

// Clear any existing model to avoid caching issues
if (mongoose.models && mongoose.models.VehicleInspection) {
  delete mongoose.models.VehicleInspection;
}

const VehicleInspection = mongoose.model('VehicleInspection', VehicleInspectionSchema);

export default VehicleInspection;