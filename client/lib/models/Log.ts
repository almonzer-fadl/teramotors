import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'audit';
  message: string;
  tenantId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  resource: {
    type: string; // e.g., 'invoice', 'user', 'system'
    id?: string;
  };
  action: string; // e.g., 'create', 'update', 'delete', 'login_success', 'login_fail'
  details?: Record<string, any>;
}

const LogSchema = new Schema<ILog>(
  {
    timestamp: { type: Date, default: Date.now, required: true },
    level: {
      type: String,
      enum: ['info', 'warn', 'error', 'audit'],
      required: true,
    },
    message: { type: String, required: true },
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    resource: {
      type: { type: String, required: true },
      id: { type: String },
    },
    action: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
  },
  {
    timestamps: false, // We have our own timestamp
  }
);

// TTL index to automatically delete logs after 7 days (604800 seconds)
LogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

// Indexes for efficient querying
LogSchema.index({ level: 1 });
LogSchema.index({ tenantId: 1 });
LogSchema.index({ userId: 1 });
LogSchema.index({ 'resource.type': 1 });
LogSchema.index({ action: 1 });


const Log =
  (mongoose.models.Log as mongoose.Model<ILog>) ||
  mongoose.model<ILog>('Log', LogSchema);

export default Log;
