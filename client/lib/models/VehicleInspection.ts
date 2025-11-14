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
    name: { type: String, required: true },
    category: { type: String, required: true },
    uniqueCode: { type: String, required: false },
    condition: { type: String, enum: ['good', 'fair', 'poor'], required: true }
  }],
  recommendations: { type: String, required: false }, // Add overall recommendations
  nextInspectionDate: { type: Date, required: false }, // Add next inspection date
  status: { type: String, enum: ['in-progress', 'completed', 'cancelled'], default: 'in-progress' }, // Add status
  jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: false },
  generatedEstimateId: { type: Schema.Types.ObjectId, ref: 'Estimate', required: false },
  generatedInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: false },
  createdAt: { type: Date, default: Date.now }, // Add timestamps
  updatedAt: { type: Date, default: Date.now },
});

// Add indexes for better query performance
VehicleInspectionSchema.index({ jobCardId: 1 });
VehicleInspectionSchema.index({ generatedEstimateId: 1 });
VehicleInspectionSchema.index({ generatedInvoiceId: 1 });
VehicleInspectionSchema.index({ status: 1 });
VehicleInspectionSchema.index({ vehicleId: 1 });
VehicleInspectionSchema.index({ customerId: 1 });

// Clear any existing model to avoid caching issues
if (mongoose.models && mongoose.models.VehicleInspection) {
  delete mongoose.models.VehicleInspection;
}

const VehicleInspection = mongoose.model('VehicleInspection', VehicleInspectionSchema);

export default VehicleInspection;