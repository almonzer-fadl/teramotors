import mongoose, { Document } from 'mongoose';
const { Schema } = mongoose;

// TypeScript interface for Appointment
export interface IAppointment extends Document {
  tenantId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  vehicleId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  estimatedCost: number;
  actualCost?: number;
  mechanicId: mongoose.Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'admin' | 'customer' | 'api' | 'phone';
  confirmationNumber: string;
  requiresApproval?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    index: true,
  },
  vehicleId: {
    type: Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  appointmentDate: { type: Date, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
  notes: { type: String, required: false },
  estimatedCost: { type: Number, required: true, min: 0 },
  actualCost: { type: Number, required: false, min: 0 },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'Mechanic', required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  source: { type: String, enum: ['admin', 'customer', 'api', 'phone'], default: 'admin', required: true },
  confirmationNumber: { type: String, required: true, unique: true },
  requiresApproval: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
});

// Compound indexes with tenantId for proper tenant isolation
AppointmentSchema.index({ tenantId: 1, appointmentDate: 1 });
AppointmentSchema.index({ tenantId: 1, customerId: 1 });
AppointmentSchema.index({ tenantId: 1, vehicleId: 1 });
AppointmentSchema.index({ tenantId: 1, mechanicId: 1 });
AppointmentSchema.index({ tenantId: 1, status: 1 });
AppointmentSchema.index({ tenantId: 1, priority: 1 });
AppointmentSchema.index({ tenantId: 1, createdAt: -1 });
AppointmentSchema.index({ tenantId: 1, status: 1, appointmentDate: 1 });
AppointmentSchema.index({ confirmationNumber: 1 }, { unique: true });
AppointmentSchema.index({ tenantId: 1, source: 1 });

// Helper method to find appointments by tenant
AppointmentSchema.statics.findByTenant = function(
  tenantId: string | mongoose.Types.ObjectId,
  filter = {}
) {
  return this.find({ tenantId, ...filter });
};

const Appointment = (mongoose.models && mongoose.models.Appointment) || mongoose.model<IAppointment>('Appointment', AppointmentSchema);

export default Appointment;