import mongoose, { Schema, Document } from 'mongoose';

export interface ITenant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'trial' | 'cancelled';
  companyInfo: {
    name: string;
    nameAr?: string;
    vatNumber?: string;
    crNumber?: string;
    address: {
      street?: string;
      city?: string;
      district?: string;
      postalCode?: string;
      country?: string;
    };
    phone?: string;
    email?: string;
    website?: string;
  };
  subscription: {
    plan: 'trial' | 'free' | 'basic' | 'professional' | 'enterprise';
    startDate: Date;
    endDate?: Date;
    maxUsers: number;
    maxVehicles: number;
  };
  settings: {
    timezone: string;
    currency: string;
    locale: string;
    dateFormat: string;
  };
  bookingSettings?: {
    enabled: boolean;
    workingHours: {
      monday: { start: string; end: string; closed: boolean };
      tuesday: { start: string; end: string; closed: boolean };
      wednesday: { start: string; end: string; closed: boolean };
      thursday: { start: string; end: string; closed: boolean };
      friday: { start: string; end: string; closed: boolean };
      saturday: { start: string; end: string; closed: boolean };
      sunday: { start: string; end: string; closed: boolean };
    };
    appointmentDuration: number; // in minutes
    bufferTime: number; // in minutes
    advanceBookingDays: number;
    requireApproval: boolean;
  };
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  integrations?: {
    smtp?: {
      host: string;
      port: number;
      user: string;
      password: string;
      fromEmail?: string;
    };
    whatsapp?: {
      sessionId: string;
      apiUrl: string;
      apiKey?: string;
    };
    twilio?: {
      accountSid: string;
      authToken: string;
      fromNumber: string;
    };
  };
  zatcaConfig?: {
    deviceId: string;
    cryptographicStamp: string;
    apiToken: string;
    apiUrl?: string;
    certificate?: string;
    privateKey?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  isActive(): boolean;
  hasExpired(): boolean;
  stats: {
    currentUsers: number;
    currentVehicles: number;
    currentCustomers: number;
    storageUsed: number;
    lastUpdated: Date;
  };
}

const TenantSchema = new Schema<ITenant>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'trial', 'cancelled'],
      default: 'trial',
    },
    companyInfo: {
      name: { type: String, required: true },
      nameAr: String,
      vatNumber: String,
      crNumber: String,
      address: {
        street: String,
        city: String,
        district: String,
        postalCode: String,
        country: { type: String, default: 'SA' },
      },
      phone: String,
      email: String,
      website: String,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['trial', 'free', 'basic', 'professional', 'enterprise'],
        default: 'trial',
      },
      startDate: { type: Date, default: Date.now },
      endDate: Date,
      maxUsers: { type: Number, default: 5 },
      maxVehicles: { type: Number, default: 100 },
    },
    settings: {
      timezone: { type: String, default: 'Asia/Riyadh' },
      currency: { type: String, default: 'SAR' },
      locale: { type: String, default: 'ar-SA' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      onboardingState: {
        step: { type: Number, default: 1 },
        completed: { type: Boolean, default: false }
      }
    },
    bookingSettings: {
      enabled: { type: Boolean, default: false },
      workingHours: {
        monday: {
          start: { type: String, default: '08:00' },
          end: { type: String, default: '17:00' },
          closed: { type: Boolean, default: false }
        },
        tuesday: {
          start: { type: String, default: '08:00' },
          end: { type: String, default: '17:00' },
          closed: { type: Boolean, default: false }
        },
        wednesday: {
          start: { type: String, default: '08:00' },
          end: { type: String, default: '17:00' },
          closed: { type: Boolean, default: false }
        },
        thursday: {
          start: { type: String, default: '08:00' },
          end: { type: String, default: '17:00' },
          closed: { type: Boolean, default: false }
        },
        friday: {
          start: { type: String, default: '08:00' },
          end: { type: String, default: '17:00' },
          closed: { type: Boolean, default: true }
        },
        saturday: {
          start: { type: String, default: '08:00' },
          end: { type: String, default: '17:00' },
          closed: { type: Boolean, default: false }
        },
        sunday: {
          start: { type: String, default: '08:00' },
          end: { type: String, default: '17:00' },
          closed: { type: Boolean, default: false }
        }
      },
      appointmentDuration: { type: Number, default: 60 },
      bufferTime: { type: Number, default: 15 },
      advanceBookingDays: { type: Number, default: 30 },
      requireApproval: { type: Boolean, default: false }
    },
    branding: {
      logoUrl: String,
      primaryColor: { type: String, default: '#3b82f6' },
      secondaryColor: { type: String, default: '#10b981' },
    },
    integrations: {
      smtp: {
        host: String,
        port: Number,
        user: String,
        password: String,
        fromEmail: String,
      },
      whatsapp: {
        sessionId: String,
        apiUrl: String,
        apiKey: String,
      },
      twilio: {
        accountSid: String,
        authToken: String,
        fromNumber: String,
      },
    },
    zatcaConfig: {
      deviceId: String,
      cryptographicStamp: String,
      apiToken: String,
      apiUrl: String,
      certificate: String,
      privateKey: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    stats: {
      currentUsers: { type: Number, default: 0 },
      currentVehicles: { type: Number, default: 0 },
      currentCustomers: { type: Number, default: 0 },
      storageUsed: { type: Number, default: 0 }, // in MB
      lastUpdated: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ status: 1 });
TenantSchema.index({ 'subscription.plan': 1 });
TenantSchema.index({ 'stats.currentUsers': 1 });
TenantSchema.index({ 'stats.currentVehicles': 1 });

TenantSchema.methods.isActive = function (): boolean {
  return this.status === 'active' || this.status === 'trial';
};

TenantSchema.methods.hasExpired = function (): boolean {
  if (!this.subscription?.endDate) return false;
  return new Date() > this.subscription.endDate;
};

const Tenant =
  (mongoose.models.Tenant as mongoose.Model<ITenant>) ||
  mongoose.model<ITenant>('Tenant', TenantSchema);

export { Tenant };
export default Tenant;
