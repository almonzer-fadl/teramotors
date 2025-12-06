import mongoose, { Document } from 'mongoose';
const { Schema } = mongoose;

interface IPartRequired {
  partId?: mongoose.Types.ObjectId;
  uniqueCode?: string;
  quantity: number;
  cost: number;
}

// TypeScript interface for Service
export interface IService extends Document {
  tenantId: mongoose.Types.ObjectId;
  code: string;
  name: string;
  description?: string;
  category?: string;
  laborRate: number;
  laborHours: number;
  uniqueCode?: string;
  partsRequired: IPartRequired[];
  isActive: boolean;
  isTemplate: boolean;
  estimatedDuration?: number; // in minutes
  bookingEnabled?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  code: {
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String, required: false },
  category: { type: String, required: false },
  laborRate: { type: Number, required: true },
  laborHours: { type: Number, required: true, min: 0, default: 1 },
  uniqueCode: {
    type: String,
    required: false,
    sparse: true,
    match: /^[A-Z]\d{3}$/  // Format: E015, B023, T007
  },
  partsRequired: [{
    partId: { type: Schema.Types.ObjectId, ref: 'Part' },
    uniqueCode: { type: String, required: false },
    quantity: { type: Number, required: true, min: 1 },
    cost: { type: Number, required: true, min: 0 }
  }],
  isActive: { type: Boolean, default: true },
  isTemplate: { type: Boolean, default: false },
  estimatedDuration: { type: Number, min: 0 },
  bookingEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
ServiceSchema.index({ tenantId: 1, code: 1 }, { unique: true });
ServiceSchema.index({ tenantId: 1, name: 1 });
ServiceSchema.index({ tenantId: 1, category: 1 });
ServiceSchema.index({ tenantId: 1, isActive: 1 });
ServiceSchema.index({ tenantId: 1, uniqueCode: 1 }, { sparse: true });

// Helper method to find services by tenant
ServiceSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

const Service = (mongoose.models && mongoose.models.Service) || mongoose.model<IService>('Service', ServiceSchema);

export default Service;