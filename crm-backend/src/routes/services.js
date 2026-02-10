// src/routes/services.js
const express = require('express');
const router = express.Router();
const { getServices, getServicesByDoctorSpecialty, createService, updateService, deleteService } = require('../controllers/serviceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getServices);
router.get('/by-specialty', authenticateToken, requireRole(['doctor']), getServicesByDoctorSpecialty);
router.post('/', authenticateToken, requireRole(['admin', 'doctor']), createService);
router.put('/:id', authenticateToken, requireRole(['admin', 'doctor']), updateService);
router.delete('/:id', authenticateToken, requireRole(['admin', 'doctor']), deleteService);

module.exports = router;
