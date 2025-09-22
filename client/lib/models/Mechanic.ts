
import { Schema, model, models } from 'mongoose';

const MechanicSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  specializations: [{
    type: String,
  }],
  experienceYears: {
    type: Number,
    min: 0,
  },
  certifications: [{
    name: String,
    issuingAuthority: String,
    issueDate: Date,
    expiryDate: Date,
  }],
  hourlyRate: {
    type: Number,
    min: 0,
  },
  availability: {
    type: String, // e.g., "Mon-Fri 9am-5pm"
  },
  notes: String,
}, { timestamps: true });

const Mechanic = models.Mechanic || model('Mechanic', MechanicSchema);

export default Mechanic;
