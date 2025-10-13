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
    type: String
  },
  estimatedDuration: {
    type: Number
  },
  defaultLaborRate: {
    type: Number
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Service', serviceSchema);
