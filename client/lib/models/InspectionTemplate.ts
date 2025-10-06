import mongoose from 'mongoose';
const { Schema } = mongoose;

const InspectionTemplateSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  vehicleType: { type: String, enum: ['sedan', 'suv', 'truck', 'motorcycle'], required: true },
  category: { type: String, required: true },
  items: [{
    itemId: { type: String, required: true },
    category: { type: String, required: true },
  }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
    
// Clear the model cache to ensure the new schema is used
delete mongoose.models.InspectionTemplate;
const InspectionTemplate = mongoose.model('InspectionTemplate', InspectionTemplateSchema);

export default InspectionTemplate;