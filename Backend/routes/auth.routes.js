const express = require('express');
const router = express.Router();
const { register, login } = require('../controller/auth.controller');
const { changePassword } = require('../controller/auth.controller');
const authMiddleware = require('../middleware/authMiddleware'); 

// URL Endpoints
router.post('/register', register);
router.post('/login', login);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;