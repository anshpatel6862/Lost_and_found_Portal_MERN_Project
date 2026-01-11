const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// 1. REGISTER LOGIC
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        // Password Encryption (Hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create New User
        user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'user' // Default role 'user'
        });

        await user.save();

        // Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.jwt_secret, { expiresIn: '1d' });

        res.status(201).json({ token, user: { id: user._id, name: user.name, role: user.role } });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. LOGIN LOGIC
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body; // 🔥 Role bhi receive karein

        // 1. User dhundo
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid Credentials" });

        // 2. Password Match karo
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        // 🔥 3. ROLE CHECK (Sabse Zaroori)
        // Agar user ne 'admin' select kiya par DB me wo 'user' hai, to block karo.
        if (role && user.role !== role) {
            return res.status(403).json({ message: `Access Denied! You are not an ${role}.` });
        }

        // 4. Token Generate
        const payload = { user: { id: user.id, role: user.role } };
        
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5d' }, (err, token) => {
            if (err) throw err;
            res.json({ 
                token, 
                user: { id: user.id, name: user.name, email: user.email, role: user.role } 
            });
        });

    } catch (err) {
        res.status(500).send('Server Error');
    }
};



exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        
        // 🔥 DEBUG LOGS (Terminal me check karein)
        console.log("Change Password Request Recieved:");
        console.log("👉 User ID from Token:", req.user ? req.user.id : "UNDEFINED");
        console.log("👉 New Password:", newPassword);

        const userId = req.user.id;
        const user = await User.findById(userId);

        // Agar user nahi mila
        if (!user) {
            console.log("❌ Error: User not found in DB with ID:", userId);
            return res.status(404).json({ message: "User not found" });
        }

        // Old Password Check
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect Old Password!" });
        }

        // Update Password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        console.log("✅ Password Updated Successfully for:", user.email);
        res.json({ message: "Password Changed Successfully! ✅" });

    } catch (err) {
        console.error("❌ Server Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};