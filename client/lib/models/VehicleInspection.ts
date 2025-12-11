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

interface VehicleInspectionModel extends mongoose.Model<IVehicleInspection> {
  getNextInspectionNumber(
    tenantId: string | mongoose.Types.ObjectId
  ): Promise<string>;
  findByTenant(
    tenantId: string | mongoose.Types.ObjectId,
    filter?: Record<string, unknown>
  ): Promise<IVehicleInspection[]>;
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

VehicleInspectionSchema.statics.getNextInspectionNumber = async function(
  tenantId: string | mongoose.Types.ObjectId
) {
  const lastInspection = await this.findOne({ tenantId })
    .sort({ createdAt: -1 })
    .select('inspectionNumber');

  if (!lastInspection || !lastInspection.inspectionNumber) {
    return 'INSP-0001';
  }

  const lastNumber = parseInt(lastInspection.inspectionNumber.split('-')[1]);
  const nextNumber = (isNaN(lastNumber) ? 1 : lastNumber + 1).toString().padStart(4, '0');
  return `INSP-${nextNumber}`;
};

// Helper method to find inspections by tenant
VehicleInspectionSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

const VehicleInspection =
  (mongoose.models.VehicleInspection as VehicleInspectionModel) ||
  mongoose.model<IVehicleInspection, VehicleInspectionModel>(
    'VehicleInspection',
    VehicleInspectionSchema
  );

export default VehicleInspection;
