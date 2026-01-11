const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getDashboardStats, getAllUsers, deleteUser, changePassword } = require('../controller/admin.controller');

// Prefix: /api/admin
router.get('/stats', authMiddleware, getDashboardStats);
router.get('/users', authMiddleware, getAllUsers);
router.delete('/user/:id', authMiddleware, deleteUser);
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;