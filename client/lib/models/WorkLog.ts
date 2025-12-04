import mongoose from 'mongoose';
const { Schema } = mongoose;

const WorkLogSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
  jobCardId: { type: Schema.Types.ObjectId, ref: 'JobCard', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'mechanic', 'inspector'], required: true },
  startedAt: { type: Date, required: true, default: Date.now },
  endedAt: { type: Date, required: false },
  durationMs: { type: Number, required: false },
  notes: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

WorkLogSchema.index({ tenantId: 1, jobCardId: 1 });
WorkLogSchema.index({ tenantId: 1, userId: 1, endedAt: 1 });

const WorkLog = (mongoose.models && mongoose.models.WorkLog) || mongoose.model('WorkLog', WorkLogSchema);

export default WorkLog;


