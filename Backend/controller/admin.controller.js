const User = require('../models/User');
const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const Claim = require('../models/Claim');
const bcrypt = require('bcryptjs');

// 1. Dashboard Stats & Recent Activity
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const lostCount = await LostItem.countDocuments();
        const foundCount = await FoundItem.countDocuments();
        const pendingClaims = await Claim.countDocuments({ status: 'Pending' });

        // Recent Activity (Top 5 newest items)
        const recentLost = await LostItem.find().sort({ createdAt: -1 }).limit(3);
        const recentFound = await FoundItem.find().sort({ createdAt: -1 }).limit(3);
        
        // Merge and Sort by Date
        const activity = [...recentLost, ...recentFound]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        res.json({
            counts: { totalUsers, lostCount, foundCount, pendingClaims },
            activity
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Password mat bhejo
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Delete User
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Change Admin Password
exports.changePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });
        res.json({ message: "Password updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};