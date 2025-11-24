import mongoose from 'mongoose';
const { Schema } = mongoose;

const PartSchema = new Schema({
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  partNumber: { type: String, required: false, unique: true, sparse: true },
  uniqueCode: {
    type: String,
    required: false,  // Will be required after migration
    unique: true,
    sparse: true,
    match: /^[A-Z]\d{3}$/  // Format: E015, B023, T007
  },
  compatibleVehicles: [{
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true }
  }]
});

// Add indexes for better query performance
PartSchema.index({ name: 1 });
PartSchema.index({ category: 1 });
PartSchema.index({ manufacturer: 1 });
PartSchema.index({ stockQuantity: 1 });
PartSchema.index({ minStockLevel: 1 });
PartSchema.index({ isActive: 1 });
PartSchema.index({ createdAt: -1 });
PartSchema.index({ isLowStock: 1 });
// uniqueCode index is already created by unique: true on the field definition

// Pre-save hook to update isLowStock
PartSchema.pre('save', function(next) {
  if (this.isModified('stockQuantity') || this.isModified('minStockLevel')) {
    this.isLowStock = this.stockQuantity <= this.minStockLevel;
  }
  next();
});

const Part = (mongoose.models && mongoose.models.Part) || mongoose.model('Part', PartSchema);

export default Part;