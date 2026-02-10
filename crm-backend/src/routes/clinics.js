// src/routes/clinics.js
const express = require('express');
const router = express.Router();
const { getClinics, getClinicById } = require('../controllers/clinicController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getClinics);
router.get('/:id', authenticateToken, getClinicById);

module.exports = router;