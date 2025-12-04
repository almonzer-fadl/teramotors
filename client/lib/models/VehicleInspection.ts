import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

export interface IVehicleInspection extends Document {
  tenantId: MongooseSchema.Types.ObjectId;
  inspectionNumber: string;
  jobCardId: MongooseSchema.Types.ObjectId;
  vehicleId: MongooseSchema.Types.ObjectId;
  customerId: MongooseSchema.Types.ObjectId;
  mechanicId: MongooseSchema.Types.ObjectId;
  templateId?: MongooseSchema.Types.ObjectId;
  inspectionDate: Date;
  mileage: number;
  items: {
    itemId: string;
    name: string;
    category: string;
    uniqueCode?: string;
    condition: 'good' | 'fair' | 'poor';
  }[];
  recommendations?: string;
  nextInspectionDate?: Date;
  nextInspectionMonths: 3 | 6;
  status: 'in-progress' | 'completed' | 'cancelled';
  generatedEstimateId?: MongooseSchema.Types.ObjectId;
  generatedInvoiceId?: MongooseSchema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const { Schema } = mongoose;

const VehicleInspectionSchema = new Schema<IVehicleInspection>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  inspectionNumber: {
    type: String,
    required: true,
  },
  jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: true },
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'InspectionTemplate', required: false },
  inspectionDate: { type: Date, required: true },
  mileage: { type: Number, required: true },
  items: [{
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    uniqueCode: { type: String, required: false },
    condition: { type: String, enum: ['good', 'fair', 'poor'], required: true }
  }],
  recommendations: { type: String, required: false },
  nextInspectionDate: { type: Date, required: false },
  nextInspectionMonths: { type: Number, enum: [3, 6], default: 3 },
  status: { type: String, enum: ['in-progress', 'completed', 'cancelled'], default: 'in-progress' },
  generatedEstimateId: { type: Schema.Types.ObjectId, ref: 'Estimate', required: false },
  generatedInvoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
VehicleInspectionSchema.index({ tenantId: 1, inspectionNumber: 1 }, { unique: true });
VehicleInspectionSchema.index({ tenantId: 1, vehicleId: 1 });
VehicleInspectionSchema.index({ tenantId: 1, customerId: 1 });
VehicleInspectionSchema.index({ tenantId: 1, jobCardId: 1 });
VehicleInspectionSchema.index({ tenantId: 1, status: 1 });
VehicleInspectionSchema.index({ tenantId: 1, generatedEstimateId: 1 });
VehicleInspectionSchema.index({ tenantId: 1, generatedInvoiceId: 1 });
VehicleInspectionSchema.index({ tenantId: 1, createdAt: -1 });

// Helper method to find inspections by tenant
VehicleInspectionSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

// Clear any existing model to avoid caching issues
if (mongoose.models && mongoose.models.VehicleInspection) {
  delete mongoose.models.VehicleInspection;
}

const VehicleInspection = mongoose.model<IVehicleInspection>('VehicleInspection', VehicleInspectionSchema);

export default VehicleInspection;