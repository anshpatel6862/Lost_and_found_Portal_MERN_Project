const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  foundItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoundItem', required: true },
  lostItem: { type: mongoose.Schema.Types.ObjectId, ref: 'LostItem' }, // 🔥 Linked Lost Item
  
  claimer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Jisne claim kiya
  finder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Jisko item mila tha
  
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
  message: { type: String }, // Optional message
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Claim', ClaimSchema);