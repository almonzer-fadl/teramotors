import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBackup extends Document {
  type: 'full' | 'tenant';
  tenantId?: Types.ObjectId;
  filename: string;
  filepath: string;
  size: number; // in bytes
  status: 'in_progress' | 'completed' | 'failed';
  createdBy: Types.ObjectId;
  createdAt: Date;
  completedAt?: Date;
  metadata: {
    documentCounts?: Record<string, number>;
    collections?: string[];
  };
}

const BackupSchema = new Schema<IBackup>(
  {
    type: {
      type: String,
      enum: ['full', 'tenant'],
      required: true,
    },
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: false, // Only required for 'tenant' type backups
    },
    filename: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      required: true,
    },
    size: {
      type: Number, // size in bytes
      required: true,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'failed'],
      default: 'in_progress',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    completedAt: {
      type: Date,
    },
    metadata: {
      documentCounts: Schema.Types.Mixed,
      collections: [String],
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
  }
);

BackupSchema.index({ type: 1 });
BackupSchema.index({ status: 1 });
BackupSchema.index({ tenantId: 1 });
BackupSchema.index({ createdAt: -1 });

const Backup =
  (mongoose.models.Backup as mongoose.Model<IBackup>) ||
  mongoose.model<IBackup>('Backup', BackupSchema);

export default Backup;
