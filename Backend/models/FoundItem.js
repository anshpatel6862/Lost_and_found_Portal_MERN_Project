const mongoose = require('mongoose');

const FoundItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  dateFound: { type: Date, required: true },
  imageUrl: { type: String },
  
  // 🔥 AI VECTOR FIELD
  imageVector: { type: [Number] },

  // Contact Details
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactEmail: { type: String, required: true },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Available' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FoundItem', FoundItemSchema);