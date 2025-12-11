import mongoose, { Document } from 'mongoose';
const { Schema } = mongoose;

interface IService {
  serviceId: mongoose.Types.ObjectId;
  quantity: number;
  laborHours: number;
  laborRate: number;
}

interface IPartUsed {
  partId?: mongoose.Types.ObjectId;
  quantity: number;
  cost: number;
}

// TypeScript interface for JobCard
export interface IJobCard extends Document {
  tenantId: mongoose.Types.ObjectId;
  jobCardNumber: string;
  appointmentId?: mongoose.Types.ObjectId;
  inspectionId?: mongoose.Types.ObjectId;
  type: 'regular' | 'inspection' | 'repair';
  parentJobCardId?: mongoose.Types.ObjectId;
  inspectionFeeDeducted: number;
  customerId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  mechanicId?: mongoose.Types.ObjectId;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedStartTime?: Date;
  estimatedEndTime?: Date;
  actualStartTime?: Date;
  actualEndTime?: Date;
  services: IService[];
  partsUsed: IPartUsed[];
  discount?: number;
  notes?: string;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface JobCardModel extends mongoose.Model<IJobCard> {
  findByTenant(
    tenantId: string | mongoose.Types.ObjectId,
    filter?: Record<string, unknown>
  ): Promise<IJobCard[]>;
  getNextJobCardNumber(
    tenantId: string | mongoose.Types.ObjectId
  ): Promise<string>;
}

const JobCardSchema = new Schema<IJobCard>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  jobCardNumber: {
    type: String,
    required: true,
  },
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: false },
  inspectionId: { type: Schema.Types.ObjectId, ref: 'VehicleInspection', required: false },
  type: {
    type: String,
    enum: ['regular', 'inspection', 'repair'],
    default: 'regular'
  },
  parentJobCardId: {
    type: Schema.Types.ObjectId,
    ref: 'JobCard',
    required: false
  },
  inspectionFeeDeducted: {
    type: Number,
    default: 0,
    min: 0
  },
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
  mechanicId: { type: Schema.Types.ObjectId, ref: 'Mechanic', required: false },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  estimatedStartTime: { type: Date, required: false },
  estimatedEndTime: { type: Date, required: false },
  actualStartTime: { type: Date, required: false },
  actualEndTime: { type: Date, required: false },
  services: [{
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    laborHours: { type: Number, required: true, min: 0 },
    laborRate: { type: Number, required: true, min: 0 }
  }],
  partsUsed: [{
    partId: { type: Schema.Types.ObjectId, ref: 'Part' },
    quantity: { type: Number, required: true, min: 1 },
    cost: { type: Number, required: true, min: 0 }
  }],
  discount: { type: Number, default: 0, min: 0 },
  notes: { type: String, required: false },
  photos: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
JobCardSchema.index({ tenantId: 1, jobCardNumber: 1 }, { unique: true });
JobCardSchema.index({ tenantId: 1, customerId: 1 });
JobCardSchema.index({ tenantId: 1, vehicleId: 1 });
JobCardSchema.index({ tenantId: 1, status: 1 });
JobCardSchema.index({ tenantId: 1, priority: 1 });
JobCardSchema.index({ tenantId: 1, appointmentId: 1 });
JobCardSchema.index({ tenantId: 1, createdAt: -1 });
JobCardSchema.index({ tenantId: 1, estimatedStartTime: 1 });
JobCardSchema.index({ tenantId: 1, type: 1 });
JobCardSchema.index({ tenantId: 1, parentJobCardId: 1 });
JobCardSchema.index({ tenantId: 1, status: 1, actualStartTime: 1, actualEndTime: 1 });

// Helper method to find job cards by tenant
JobCardSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

// Method to generate next job card number for tenant
JobCardSchema.statics.getNextJobCardNumber = async function(
  tenantId: string | mongoose.Types.ObjectId
) {
  const lastJobCard = await this.findOne({ tenantId })
    .sort({ createdAt: -1 })
    .select('jobCardNumber');

  if (!lastJobCard || !lastJobCard.jobCardNumber) {
    return 'JC-0001';
  }

  const lastNumber = parseInt(lastJobCard.jobCardNumber.split('-')[1]);
  const nextNumber = (lastNumber + 1).toString().padStart(4, '0');
  return `JC-${nextNumber}`;
};

const JobCard =
  (mongoose.models.JobCard as JobCardModel) ||
  mongoose.model<IJobCard, JobCardModel>('JobCard', JobCardSchema);

export default JobCard;
