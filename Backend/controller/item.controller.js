const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');
const cloudinary = require('../config/cloudinary');
const { getImageVector } = require('../utils/ai'); // AI Logic import

// --- LOST ITEMS ---

exports.addLostItem = async (req, res) => {
    try {
        const { name, category, description, location, dateLost } = req.body;
        
        let imageUrl = '';
        let imageVector = [];

        // Image Upload Logic
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;

            try {
                console.log("🤖 AI analyzing image...");
                imageVector = await getImageVector(imageUrl);
                console.log("✅ Vector generated!");
            } catch (aiError) {
                console.error("⚠️ AI Error:", aiError.message);
            }
        }

        const newItem = new LostItem({
            name, category, description, location, dateLost,
            imageUrl,
            imageVector,
            createdBy: req.user.id,
            status: 'Lost' // Default status
        });

        await newItem.save();
        res.status(201).json({ message: "Lost Item Reported Successfully", item: newItem });
    } catch (err) {
        console.error("❌ BACKEND ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// 🔥 UPDATE: Sirf 'Lost' items dikhana (Found wale hide karna)
exports.getLostItems = async (req, res) => {
    try {
        const items = await LostItem.find({ status: 'Lost' }) // Filter added
            .populate('createdBy', 'name email phone') 
            .sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- FOUND ITEMS ---

exports.addFoundItem = async (req, res) => {
    try {
        const { 
            name, category, description, location, dateFound, 
            contactName, contactPhone, contactEmail 
        } = req.body;

        let imageUrl = '';
        let imageVector = [];

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;

            try {
                console.log("🤖 AI analyzing image...");
                imageVector = await getImageVector(imageUrl);
                console.log("✅ Vector generated!");
            } catch (aiError) {
                console.error("⚠️ AI Error:", aiError.message);
            }
        }

        const newItem = new FoundItem({
            name, category, description, location, dateFound,
            imageUrl,
            imageVector,
            contactName, contactPhone, contactEmail,
            createdBy: req.user.id,
            status: 'Available' // Default status
        });

        await newItem.save();
        res.status(201).json({ message: "Found Item Reported Successfully", item: newItem });
    } catch (err) {
        console.error("❌ BACKEND ERROR:", err);
        res.status(500).json({ message: err.message });
    }
};

// 🔥 UPDATE: Sirf 'Available' items dikhana (Claimed wale hide karna)
exports.getFoundItems = async (req, res) => {
    try {
        const items = await FoundItem.find({ status: 'Available' }) // Filter added
            .populate('createdBy', 'name email') 
            .sort({ createdAt: -1 });
            
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- AI MATCHING LOGIC ---

const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

exports.getMatches = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log("🔍 Debugging User ID:", userId);

        // 🔥 FIX: Sirf Active Lost items match karo
        const myLostItems = await LostItem.find({ createdBy: userId, status: 'Lost' });
        console.log("📂 My Lost Items Found:", myLostItems.length);
        
        // 🔥 FIX: Sirf Available Found items match karo
        const allFoundItems = await FoundItem.find({ status: 'Available' });
        console.log("📂 All Found Items Found:", allFoundItems.length);

        let matches = [];

        for (let lost of myLostItems) {
            for (let found of allFoundItems) {
                
                // Check if vectors exist
                if (lost.imageVector && lost.imageVector.length > 0 && found.imageVector && found.imageVector.length > 0) {
                    
                    const similarity = cosineSimilarity(lost.imageVector, found.imageVector);
                    console.log(`🤖 Comparing: ${lost.name} vs ${found.name} -> Score: ${similarity}`); 

                    if (similarity > 0.60) { 
                        matches.push({
                            lostItem: lost,
                            foundItem: found,
                            score: (similarity * 100).toFixed(2)
                        });
                    }
                }
            }
        }

        matches.sort((a, b) => b.score - a.score);
        res.json(matches);

    } catch (err) {
        console.error("Matching Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- DELETE ITEM (Admin Action) ---
exports.deleteItem = async (req, res) => {
    try {
        const itemId = req.params.id;
        
        let item = await LostItem.findByIdAndDelete(itemId);
        
        if (!item) {
            item = await FoundItem.findByIdAndDelete(itemId);
        }

        if (!item) return res.status(404).json({ message: "Item not found" });

        res.json({ message: "Item deleted successfully by Admin!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};