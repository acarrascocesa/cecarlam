// src/routes/patients.js
const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', authenticateToken, getPatients);
router.get('/:id', authenticateToken, getPatientById);
router.post('/', authenticateToken, requireRole(['doctor', 'secretary']), createPatient);
router.put('/:id', authenticateToken, requireRole(['doctor', 'secretary']), updatePatient);
router.delete('/:id', authenticateToken, requireRole(['doctor', 'secretary']), deletePatient);

module.exports = router;