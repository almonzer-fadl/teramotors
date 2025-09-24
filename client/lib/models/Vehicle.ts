import mongoose from 'mongoose';
const { Schema } = mongoose;

const ServiceHistorySchema = new Schema({
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
  date: { type: Date, required: true },
  mileage: { type: Number, required: true },
  cost: { type: Number, required: true },
  notes: { type: String }
});

const VehicleSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: false },  
  vin: { type: String, required: false, unique: true, sparse: true },
  make: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true, min: 1900, max: new Date().getFullYear() + 1 }, 
  color: { type: String, required: false },
  licensePlate: { type: String, required: true, unique: true },
  mileage: { type: Number, required: false, min: 0 },
  engineType: { type: String, required: false },
  transmission: { type: String, enum: ['manual', 'automatic', 'cvt'], required: false },
  fuelType: { type: String, enum: ['gasoline', 'diesel', 'hybrid', 'electric'], required: false },
  photos: [{ type: String }],
  serviceHistory: [ServiceHistorySchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
VehicleSchema.index({ customerId: 1 });
VehicleSchema.index({ make: 1, model: 1 });
VehicleSchema.index({ year: 1 });
VehicleSchema.index({ isActive: 1 });
VehicleSchema.index({ createdAt: -1 });

const Vehicle = (mongoose.models && mongoose.models.Vehicle) || mongoose.model('Vehicle', VehicleSchema);

export default Vehicle;