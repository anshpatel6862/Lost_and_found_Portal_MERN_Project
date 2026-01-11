const mongoose = require('mongoose');

const LostItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  dateLost: { type: Date, required: true },
  imageUrl: { type: String }, // Image URL
  
  // 🔥 AI VECTOR FIELD (Ye missing tha!)
  imageVector: { type: [Number] }, 

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Lost' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LostItem', LostItemSchema);