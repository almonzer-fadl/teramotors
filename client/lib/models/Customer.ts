import mongoose from 'mongoose';
const { Schema } = mongoose;

const CustomerSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  notes: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
CustomerSchema.index({ firstName: 1, lastName: 1 });
CustomerSchema.index({ phone: 1 });
CustomerSchema.index({ isActive: 1 });
CustomerSchema.index({ createdAt: -1 });
CustomerSchema.index({ 'address.city': 1 });

const Customer = (mongoose.models && mongoose.models.Customer) || mongoose.model('Customer', CustomerSchema);

export default Customer;
 