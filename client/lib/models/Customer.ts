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

const Customer = (mongoose.models && mongoose.models.Customer) || mongoose.model('Customer', CustomerSchema);

export default Customer;
 