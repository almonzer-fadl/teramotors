const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  partNumber: {
    type: String
  },
  description: {
    type: String
  },
  category: {
    type: String
  },
  unitCost: {
    type: Number,
    required: true
  },
  quantityInStock: {
    type: Number,
    default: 0
  },
  supplier: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Part', partSchema);
