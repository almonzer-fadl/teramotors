import mongoose, { Schema, Document } from 'mongoose';

export interface ITenantConfig extends Document {
  tenantId: mongoose.Types.ObjectId;
  modules: {
    inspections: boolean;
    invoices: boolean;
    estimates: boolean;
    jobCards: boolean;
    whatsapp: boolean;
    payments: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  limits: {
    storageGB: number;
    apiRateLimit: number;
    monthlyMessages: number;
  };
  preferences: {
    defaultLanguage: string;
    measurementSystem: 'metric' | 'imperial';
    enableNotifications: boolean;
  };
  compliance: {
    zatcaPhase2: boolean;
    requireTwoFactor: boolean;
    dataResidency: 'sa' | 'eu' | 'us';
  };
  automation: {
    autoAssignJobs: boolean;
    autoCloseInspections: boolean;
    notifyOnLowStock: boolean;
  };
  inspectionSettings?: {
    defaultFee: number;
    invoiceDueDays: number;
    estimateValidityDays: number;
    autoCloseInspectionJobCard: boolean;
    autoGenerateEstimate: boolean;
    autoGenerateInvoice: boolean;
    whatsappNotifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TenantConfigSchema = new Schema<ITenantConfig>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      unique: true,
      index: true,
    },
    modules: {
      inspections: { type: Boolean, default: true },
      invoices: { type: Boolean, default: true },
      estimates: { type: Boolean, default: true },
      jobCards: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false },
      payments: { type: Boolean, default: true },
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
    },
    branding: {
      logoUrl: String,
      primaryColor: { type: String, default: '#3b82f6' },
      secondaryColor: { type: String, default: '#10b981' },
    },
    limits: {
      storageGB: { type: Number, default: 10 },
      apiRateLimit: { type: Number, default: 10000 },
      monthlyMessages: { type: Number, default: 1000 },
    },
    preferences: {
      defaultLanguage: { type: String, default: 'ar' },
      measurementSystem: {
        type: String,
        enum: ['metric', 'imperial'],
        default: 'metric',
      },
      enableNotifications: { type: Boolean, default: true },
    },
    compliance: {
      zatcaPhase2: { type: Boolean, default: false },
      requireTwoFactor: { type: Boolean, default: false },
      dataResidency: {
        type: String,
        enum: ['sa', 'eu', 'us'],
        default: 'sa',
      },
    },
    automation: {
      autoAssignJobs: { type: Boolean, default: false },
      autoCloseInspections: { type: Boolean, default: false },
      notifyOnLowStock: { type: Boolean, default: true },
    },
    inspectionSettings: {
      defaultFee: { type: Number, default: 150 },
      invoiceDueDays: { type: Number, default: 7 },
      estimateValidityDays: { type: Number, default: 30 },
      autoCloseInspectionJobCard: { type: Boolean, default: true },
      autoGenerateEstimate: { type: Boolean, default: true },
      autoGenerateInvoice: { type: Boolean, default: true },
      whatsappNotifications: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

TenantConfigSchema.index({ tenantId: 1 }, { unique: true });

const TenantConfig =
  (mongoose.models.TenantConfig as mongoose.Model<ITenantConfig>) ||
  mongoose.model<ITenantConfig>('TenantConfig', TenantConfigSchema);

export { TenantConfig };
export default TenantConfig;
