import mongoose from 'mongoose';
const { Schema } = mongoose;

const JobCardSchema = new Schema({
  appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  mechanicId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  estimatedStartTime: { type: Date, required: true },
  estimatedEndTime: { type: Date, required: true },
  actualStartTime: { type: Date, required: false },
  actualEndTime: { type: Date, required: false },
  laborHours: { type: Number, required: true, min: 0 },
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


const JobCard = (mongoose.models && mongoose.models.JobCard) || mongoose.model('JobCard', JobCardSchema);

export default JobCard;