const Claim = require('../models/Claim');
const FoundItem = require('../models/FoundItem');
const LostItem = require('../models/LostItem');
const User = require('../models/User'); // User model import zaroori hai
const nodemailer = require('nodemailer');

// --- EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
    },
    tls: { rejectUnauthorized: false }
});

// --- 1. CREATE CLAIM ---
exports.createClaim = async (req, res) => {
    try {
        const { lostItemId, foundItemId, message } = req.body;
        const userId = req.user.id;

        const foundItem = await FoundItem.findById(foundItemId);
        if (!foundItem) return res.status(404).json({ message: "Item not found" });

        // Check Duplicates
        const activeClaim = await Claim.findOne({ 
            claimer: userId, 
            foundItem: foundItemId,
            status: { $in: ['Pending', 'Accepted'] } 
        });

        if (activeClaim) {
            return res.status(400).json({ message: "Already claimed!" });
        }

        const newClaim = new Claim({
            lostItem: lostItemId, 
            foundItem: foundItemId,
            claimer: userId,
            finder: foundItem.createdBy, 
            message: message || "This is my item."
        });

        await newClaim.save();
        res.status(201).json({ message: "Claim sent successfully!", claim: newClaim });

    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 2. GET MY CLAIMS ---
exports.getMyClaims = async (req, res) => {
    try {
        // Sirf wahi claims dikhao jahan main CLAIMER hoon
        const claims = await Claim.find({ claimer: req.user.id })
            .populate('foundItem')
            .populate('lostItem')
            .sort({ createdAt: -1 });
        res.json(claims);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 3. GET INCOMING CLAIMS (Optional) ---
exports.getIncomingClaims = async (req, res) => {
    try {
        const claims = await Claim.find({ finder: req.user.id })
            .populate('foundItem').populate('lostItem').populate('claimer', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(claims);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 4. ADMIN GET ALL ---
exports.getAllClaimsAdmin = async (req, res) => {
    try {
        const claims = await Claim.find()
            .populate('foundItem').populate('lostItem').populate('claimer', 'name email phone')
            .sort({ createdAt: -1 });
        res.json(claims);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- 5. UPDATE STATUS (SMART EMAIL LOGIC) ---
exports.updateClaimStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const claim = await Claim.findById(req.params.id)
            .populate('foundItem') 
            .populate('lostItem')
            .populate('claimer'); // User 1 (Loser) data

        if (!claim) return res.status(404).json({ message: "Claim not found" });

        claim.status = status;
        await claim.save();

        if (status === 'Accepted') {
            await FoundItem.findByIdAndUpdate(claim.foundItem._id, { status: 'Claimed' });
            if (claim.lostItem) await LostItem.findByIdAndUpdate(claim.lostItem._id, { status: 'Found' });

            // --- 🧠 SMART EMAIL LOGIC START ---
            
            // 1. Loser Email (Jisme request bheji thi)
            const loserEmail = claim.claimer.email; 

            // 2. Finder Email Logic
            // Pehle hum form wala email try karenge
            let finderEmail = claim.foundItem.contactEmail;
            
            // Agar Form wala email aur Loser email SAME hain (Galti se), 
            // To hum Finder ke ACCOUNT ka asli email fetch karenge.
            if (finderEmail === loserEmail) {
                console.log("⚠️ WARNING: Contact Email same as Loser Email. Fetching Account Email...");
                const finderAccount = await User.findById(claim.finder); // Finder User DB se nikalo
                if (finderAccount) {
                    finderEmail = finderAccount.email; // Account wala email use karo
                }
            }

            console.log(`📧 Sending to Loser: ${loserEmail}`);
            console.log(`📧 Sending to Finder: ${finderEmail}`);

            const emailPromises = [
                // Mail to LOSER
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: loserEmail,
                    subject: '🎉 Claim Approved!',
                    html: `
                        <h3>Your item is found!</h3>
                        <p><b>Contact Finder:</b></p>
                        <p>Name: ${claim.foundItem.contactName}</p>
                        <p>Phone: ${claim.foundItem.contactPhone}</p>
                        <p>Email: ${claim.foundItem.contactEmail} (or try ${finderEmail})</p>
                    `
                }),
                // Mail to FINDER
                transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: finderEmail, // Ab ye sahi jagah jayega
                    subject: '✅ Claim Approved',
                    html: `
                        <h3>Action Required</h3>
                        <p>Someone claimed your found item: <b>${claim.foundItem.name}</b></p>
                        <p><b>Please return to Owner:</b></p>
                        <p>Name: ${claim.claimer.name}</p>
                        <p>Email: ${loserEmail}</p>
                        <p>Phone: ${claim.claimer.phone}</p>
                    `
                })
            ];
            await Promise.allSettled(emailPromises);
        }
        res.json({ message: `Claim ${status}`, claim });
    } catch (err) { res.status(500).json({ error: err.message }); }
};