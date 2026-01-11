const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); 
const { 
    createClaim, 
    getMyClaims, 
    getAllClaimsAdmin, 
    updateClaimStatus 
} = require('../controller/claim.controller');

// --- ROUTES ---

// 1. Claim Request Bhejna (User Button Click)
// URL: http://localhost:5000/api/claims/create
router.post('/create', authMiddleware, createClaim);

// 2. Apne Claims dekhna (My Claims Page)
// URL: http://localhost:5000/api/claims/my-claims
router.get('/my-claims', authMiddleware, getMyClaims);

// 3. Admin ke liye sare Claims (Admin Panel)
// URL: http://localhost:5000/api/claims/admin/all
router.get('/admin/all', authMiddleware, getAllClaimsAdmin);

// 4. Admin Status Update karega (Approve/Reject)
// URL: http://localhost:5000/api/claims/update-status/:id
router.put('/update-status/:id', authMiddleware, updateClaimStatus);

module.exports = router;