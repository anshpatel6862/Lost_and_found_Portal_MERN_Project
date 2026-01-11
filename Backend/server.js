require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/item.routes');
const claimRoutes = require('./routes/claim.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Middleware
app.use(express.json()); // JSON data allow karne ke liye
app.use(cors()); // Frontend connection allow karne ke liye
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/admin', adminRoutes)

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Test Route
app.get('/', (req, res) => {
  res.send('Lost & Found API is Running...');
});

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});