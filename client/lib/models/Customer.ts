import mongoose, { Document } from 'mongoose';
const { Schema } = mongoose;

// TypeScript interface for Customer
export interface ICustomer extends Document {
  tenantId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneNumber?: string;
  whatsappEnabled: boolean;
  language: 'ar' | 'en';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  vehicles: mongoose.Types.ObjectId[];
  vatNumber?: string;
  idNumber?: string;
  companyName?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: { type: String, required: true },
  phoneNumber: { type: String }, // WhatsApp number (can be different from phone)
  whatsappEnabled: { type: Boolean, default: true },
  language: { type: String, enum: ['ar', 'en'], default: 'ar' },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  vehicles: [{ type: Schema.Types.ObjectId, ref: 'Vehicle' }],
  vatNumber: { type: String, length: 15 },
  idNumber: { type: String, length: 10 },
  companyName: { type: String },
  notes: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
CustomerSchema.index({ tenantId: 1, email: 1 }, { unique: true, sparse: true });
CustomerSchema.index({ tenantId: 1, phone: 1 });
CustomerSchema.index({ tenantId: 1, firstName: 1, lastName: 1 });
CustomerSchema.index({ tenantId: 1, isActive: 1 });
CustomerSchema.index({ tenantId: 1, createdAt: -1 });
CustomerSchema.index({ tenantId: 1, 'address.city': 1 });

// Helper method to find customers by tenant
CustomerSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

const Customer = (mongoose.models && mongoose.models.Customer) || mongoose.model<ICustomer>('Customer', CustomerSchema);

export default Customer;
 