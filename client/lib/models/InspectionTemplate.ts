import mongoose from 'mongoose';
const { Schema } = mongoose;

const InspectionTemplateSchema = new Schema({
name: { type: String, required: true }, // Add template name
vehicleType: { type: String, enum: ['sedan', 'suv', 'truck', 'motorcycle'], required: true }, // Add vehicle type
  category: { type: String, required: true },
  items: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: false },
    category: { type: String, required: true },
    isRequired: { type: Boolean, default: true },
    defaultCondition: { type: String, required: false },
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
    
const InspectionTemplate = (mongoose.models && mongoose.models.InspectionTemplate) || mongoose.model('InspectionTemplate', InspectionTemplateSchema);

export default InspectionTemplate;