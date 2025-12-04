import mongoose, { Document } from 'mongoose';
const { Schema } = mongoose;

interface IServiceHistory {
  serviceId?: mongoose.Types.ObjectId;
  date: Date;
  mileage: number;
  cost: number;
  notes?: string;
}

// TypeScript interface for Vehicle
export interface IVehicle extends Document {
  tenantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  vin?: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  licensePlate: string;
  mileage?: number;
  engineType?: string;
  transmission?: 'manual' | 'automatic' | 'cvt';
  fuelType?: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  photos: string[];
  serviceHistory: IServiceHistory[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceHistorySchema = new Schema({
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  date: { type: Date, required: true },
  mileage: { type: Number, required: true },
  cost: { type: Number, required: true },
  notes: { type: String }
});

const VehicleSchema = new Schema<IVehicle>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: false,
    index: true,
  },
  vin: { type: String, required: false, sparse: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1 },
  color: { type: String, required: false },
  licensePlate: { type: String, required: true },
  mileage: { type: Number, required: false, min: 0 },
  engineType: { type: String, required: false },
  transmission: { type: String, enum: ['manual', 'automatic', 'cvt'], required: false },
  fuelType: { type: String, enum: ['gasoline', 'diesel', 'hybrid', 'electric'], required: false },
  photos: [{ type: String }],
  serviceHistory: [ServiceHistorySchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
VehicleSchema.index({ tenantId: 1, licensePlate: 1 }, { unique: true, sparse: true });
VehicleSchema.index({ tenantId: 1, vin: 1 }, { unique: true, sparse: true });
VehicleSchema.index({ tenantId: 1, customerId: 1 });
VehicleSchema.index({ tenantId: 1, make: 1, model: 1 });
VehicleSchema.index({ tenantId: 1, year: 1 });
VehicleSchema.index({ tenantId: 1, isActive: 1 });
VehicleSchema.index({ tenantId: 1, createdAt: -1 });

// Helper method to find vehicles by tenant
VehicleSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

const Vehicle = (mongoose.models && mongoose.models.Vehicle) || mongoose.model<IVehicle>('Vehicle', VehicleSchema);

export default Vehicle;