const express = require('express');
const router = express.Router();
const { login, verifyToken, changePassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/login', login);
router.get('/verify', authenticateToken, verifyToken);
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
