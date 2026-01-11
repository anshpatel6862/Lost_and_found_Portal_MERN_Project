const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 
require('dotenv').config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("🌱 MongoDB Connected for Seeding..."))
    .catch(err => {
        console.error("❌ DB Connection Error:", err);
        process.exit(1);
    });

const seedAdmin = async () => {
    try {
        // Check agar admin pehle se hai
        const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
        if (existingAdmin) {
            console.log("⚠️ Admin already exists! No need to create.");
            process.exit();
        }

        // Password Hash karo
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("admin123", salt); // Password: admin123

        // Admin Create karo
        const newAdmin = new User({
            name: "Super Admin",
            email: "admin@gmail.com",
            password: hashedPassword,
            role: "admin",
            phone: "9999999999" // 🔥 FIX: Phone number add kar diya
        });

        await newAdmin.save();
        console.log("✅ Admin Created Successfully!");
        console.log("👉 Email: admin@gmail.com");
        console.log("👉 Password: admin123");
        process.exit();
    } catch (error) {
        console.error("❌ Error seeding admin:", error);
        process.exit(1);
    }
};

seedAdmin();