import mongoose from 'mongoose';
const { Schema } = mongoose;

const JobCardSchema = new Schema({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: false },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  estimatedStartTime: { type: Date, required: false },
  estimatedEndTime: { type: Date, required: false },
  actualStartTime: { type: Date, required: false },
  actualEndTime: { type: Date, required: false },
  services: [{
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    laborHours: { type: Number, required: true, min: 0 },
    laborRate: { type: Number, required: true, min: 0 }
  }],
  partsUsed: [{
    partId: { type: Schema.Types.ObjectId, ref: 'Part' },
    quantity: { type: Number, required: true, min: 1 },
    cost: { type: Number, required: true, min: 0 }
  }],
  notes: { type: String, required: false },
  photos: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


// Add indexes for better query performance
JobCardSchema.index({ customerId: 1 });
JobCardSchema.index({ vehicleId: 1 });
JobCardSchema.index({ status: 1 });
JobCardSchema.index({ priority: 1 });
JobCardSchema.index({ appointmentId: 1 });
JobCardSchema.index({ createdAt: -1 });
JobCardSchema.index({ estimatedStartTime: 1 });
JobCardSchema.index({ actualStartTime: 1 });
JobCardSchema.index({ status: 1, actualStartTime: 1, actualEndTime: 1 });

const JobCard = (mongoose.models && mongoose.models.JobCard) || mongoose.model('JobCard', JobCardSchema);

export default JobCard;