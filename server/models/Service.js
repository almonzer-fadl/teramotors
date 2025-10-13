const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String,
    required: true
  },
  fixedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  laborRate: {
    type: Number,
    required: false
  },
  laborHours: {
    type: Number,
    required: true,
    min: 0
  },
  partsRequired: [{
    partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Part' },
    quantity: { type: Number, required: true, min: 1 },
    cost: { type: Number, required: true, min: 0 }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
