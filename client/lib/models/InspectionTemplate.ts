import mongoose, { Document } from 'mongoose';
const { Schema } = mongoose;

interface ITemplateItem {
  itemId: string;
  name: string;
  category: string;
  uniqueCode?: string;
}

// TypeScript interface for InspectionTemplate
export interface IInspectionTemplate extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  vehicleType: 'sedan' | 'suv' | 'truck' | 'motorcycle';
  items: ITemplateItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InspectionTemplateSchema = new Schema<IInspectionTemplate>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  name: { type: String, required: true },
  description: { type: String, required: false },
  vehicleType: { type: String, enum: ['sedan', 'suv', 'truck', 'motorcycle'], required: true },
  items: [{
    itemId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    uniqueCode: { type: String, required: false }
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
InspectionTemplateSchema.index({ tenantId: 1, name: 1 }, { unique: true });
InspectionTemplateSchema.index({ tenantId: 1, vehicleType: 1 });
InspectionTemplateSchema.index({ tenantId: 1, isActive: 1 });
InspectionTemplateSchema.index({ tenantId: 1, createdAt: -1 });

// Helper method to find templates by tenant
InspectionTemplateSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

// Clear the model cache to ensure the new schema is used
delete mongoose.models.InspectionTemplate;
const InspectionTemplate = mongoose.model<IInspectionTemplate>('InspectionTemplate', InspectionTemplateSchema);

export default InspectionTemplate;