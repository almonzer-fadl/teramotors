import mongoose from 'mongoose';
const { Schema } = mongoose;

const AppointmentSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
AppointmentSchema.index({ customerId: 1 });
AppointmentSchema.index({ vehicleId: 1 });
AppointmentSchema.index({ mechanicId: 1 });
AppointmentSchema.index({ appointmentDate: 1 });
AppointmentSchema.index({ startTime: 1 });
AppointmentSchema.index({ status: 1 });
AppointmentSchema.index({ priority: 1 });
AppointmentSchema.index({ createdAt: -1 });
AppointmentSchema.index({ status: 1, appointmentDate: 1 });

const Appointment = (mongoose.models && mongoose.models.Appointment) || mongoose.model('Appointment', AppointmentSchema);

export default Appointment;