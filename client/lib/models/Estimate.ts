import mongoose, { Document, Schema as MongooseSchema } from 'mongoose';

export interface IEstimate extends Document {
  tenantId: MongooseSchema.Types.ObjectId;
  estimateNumber: string;
  jobCardId?: MongooseSchema.Types.ObjectId;
  inspectionId?: MongooseSchema.Types.ObjectId;
  customerId: MongooseSchema.Types.ObjectId;
  vehicleId: MongooseSchema.Types.ObjectId;
  mechanicId?: MongooseSchema.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  services: {
    serviceId?: MongooseSchema.Types.ObjectId;
    name?: string;
    description?: string;
    quantity: number;
    laborHours?: number;
    laborRate?: number;
    laborCost: number;
    partsCost: number;
    totalCost: number;
  }[];
  parts: {
    partId?: MongooseSchema.Types.ObjectId;
    name?: string;
    description?: string;
    quantity: number;
    unitCost: number;
    totalCost: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  inspectionFee?: number;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

const { Schema } = mongoose;

const EstimateSchema = new Schema<IEstimate>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  estimateNumber: {
    type: String,
    required: true,
  },
  jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: false },
  inspectionId: { type: Schema.Types.ObjectId, ref: 'VehicleInspection', required: false },
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
  mechanicId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: { type: String, required: false },
  services: [{
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: false },
    name: { type: String, required: false, default: '' },
    description: { type: String, required: false, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    laborHours: { type: Number, required: false, default: 0, min: 0 },
    laborRate: { type: Number, required: false, default: 0, min: 0 },
    laborCost: { type: Number, required: true, min: 0 },
    partsCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 }
  }],
  parts: [{
    partId: { type: Schema.Types.ObjectId, ref: 'Part', required: false },
    name: { type: String, required: false, default: '' },
    description: { type: String, required: false, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 }
  }],
  subtotal: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  inspectionFee: { type: Number, default: 0, min: 0 },
  validUntil: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
EstimateSchema.index({ tenantId: 1, estimateNumber: 1 }, { unique: true });
EstimateSchema.index({ tenantId: 1, customerId: 1 });
EstimateSchema.index({ tenantId: 1, vehicleId: 1 });
EstimateSchema.index({ tenantId: 1, jobCardId: 1 });
EstimateSchema.index({ tenantId: 1, inspectionId: 1 });
EstimateSchema.index({ tenantId: 1, status: 1 });
EstimateSchema.index({ tenantId: 1, createdAt: -1 });

// Helper method to find estimates by tenant
EstimateSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

const Estimate = (mongoose.models && mongoose.models.Estimate) || mongoose.model<IEstimate>('Estimate', EstimateSchema);

export default Estimate;