import mongoose, { Document } from 'mongoose';
const { Schema } = mongoose;

interface ICompatibleVehicle {
  make: string;
  model: string;
  year: number;
}

// TypeScript interface for Part
export interface IPart extends Document {
  tenantId: mongoose.Types.ObjectId;
  partNumber: string;
  name: string;
  description?: string;
  category?: string;
  manufacturer?: string;
  cost: number;
  sellingPrice: number;
  stockQuantity: number;
  minStockLevel: number;
  isLowStock: boolean;
  location?: string;
  isActive: boolean;
  uniqueCode?: string;
  compatibleVehicles: ICompatibleVehicle[];
  createdAt: Date;
  updatedAt: Date;
}

const PartSchema = new Schema<IPart>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  partNumber: {
    type: String,
    required: true,
  },
  name: { type: String, required: true },
  description: { type: String, required: false },
  category: { type: String, required: false },
  manufacturer: { type: String, required: false },
  cost: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  stockQuantity: { type: Number, required: true, min: 0 },
  minStockLevel: { type: Number, required: true, min: 0 },
  isLowStock: { type: Boolean, default: false },
  location: { type: String, required: false },
  isActive: { type: Boolean, default: true },
  uniqueCode: {
    type: String,
    required: false,
    sparse: true,
    match: /^[A-Z]\d{3}$/  // Format: E015, B023, T007
  },
  compatibleVehicles: [{
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
PartSchema.index({ tenantId: 1, partNumber: 1 }, { unique: true });
PartSchema.index({ tenantId: 1, name: 1 });
PartSchema.index({ tenantId: 1, category: 1 });
PartSchema.index({ tenantId: 1, manufacturer: 1 });
PartSchema.index({ tenantId: 1, isActive: 1 });
PartSchema.index({ tenantId: 1, stockQuantity: 1 });
PartSchema.index({ tenantId: 1, isLowStock: 1 });
PartSchema.index({ tenantId: 1, uniqueCode: 1 }, { sparse: true });
PartSchema.index({ tenantId: 1, createdAt: -1 });

// Pre-save hook to update isLowStock
PartSchema.pre('save', function(next) {
  if (this.isModified('stockQuantity') || this.isModified('minStockLevel')) {
    this.isLowStock = this.stockQuantity <= this.minStockLevel;
  }
  next();
});

// Helper method to find parts by tenant
PartSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

const Part = (mongoose.models && mongoose.models.Part) || mongoose.model<IPart>('Part', PartSchema);

export default Part;