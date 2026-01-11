const express = require('express');
const router = express.Router();
const multer = require('multer');
const { addLostItem, getLostItems, addFoundItem, getFoundItems, getMatches, deleteItem } = require('../controller/item.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Multer Config (Temp storage)
const upload = multer({ dest: 'uploads/' });

// --- ROUTES ---

// 1. Report Lost Item
// 🔥 FIX 1: Path '/report-lost' kiya (Frontend se match karne ke liye)
// 🔥 FIX 2: upload.single('file') kiya (Kyunki Frontend me humne "file" naam bheja hai)
router.post('/report-lost', authMiddleware, upload.single('file'), addLostItem);

router.get('/lost/all', getLostItems); 

// 2. Report Found Item
// 🔥 FIX: Path '/report-found' aur field 'file'
router.post('/report-found', authMiddleware, upload.single('file'), addFoundItem);

router.get('/found/all', getFoundItems);

// 3. Other Routes
router.get('/match-results', authMiddleware, getMatches);
router.delete('/delete/:id', authMiddleware, deleteItem);

module.exports = router;