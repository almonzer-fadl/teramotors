import mongoose from 'mongoose';
const { Schema } = mongoose;

const ServiceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  category: { type: String, required: true },
  laborRate: { type: Number, required: true },
  laborHours: { type: Number, required: true, min: 0 },
  partsRequired: [{
    partId: { type: Schema.Types.ObjectId, ref: 'Part' },
    quantity: { type: Number, required: true, min: 1 },
    cost: { type: Number, required: true, min: 0 }
  }],
  isActive: { type: Boolean, default: true },
  isTemplate: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Service = (mongoose.models && mongoose.models.Service) || mongoose.model('Service', ServiceSchema);

export default Service;