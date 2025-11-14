import mongoose from 'mongoose';
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  category: { type: String, required: false },
  laborRate: { type: Number, required: true },
  laborHours: { type: Number, required: true, min: 0, default: 1 },
  uniqueCode: {
    type: String,
    required: false,  // Will be required after migration
    unique: true,
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
ServiceSchema.index({ uniqueCode: 1 });
ServiceSchema.index({ category: 1 });
ServiceSchema.index({ isActive: 1 });

const Service = (mongoose.models && mongoose.models.Service) || mongoose.model('Service', ServiceSchema);

export default Service;