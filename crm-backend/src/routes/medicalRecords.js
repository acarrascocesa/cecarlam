// src/routes/medicalRecords.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordsByPatient,
  getPatientHistory
} = require('../controllers/medicalRecordController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los historiales médicos (filtrados por clínica)
router.get('/', requireRole(['doctor', 'secretary']), getMedicalRecords);

// Obtener historiales médicos de un paciente específico (debe ir antes que /:id)
router.get('/patient/:patientId', requireRole(['doctor', 'secretary']), getMedicalRecordsByPatient);

// Obtener historial completo del paciente (médicos, prescripciones, citas) (debe ir antes que /:id)
router.get('/patient/:patientId/history', requireRole(['doctor', 'secretary']), getPatientHistory);

// Crear nuevo historial médico (solo doctores)
router.post('/', requireRole(['doctor']), createMedicalRecord);

// Obtener historial médico por ID
router.get('/:id', requireRole(['doctor', 'secretary']), getMedicalRecordById);

// Actualizar historial médico (solo el doctor que lo creó)
router.put('/:id', requireRole(['doctor']), updateMedicalRecord);

// Eliminar historial médico (solo el doctor que lo creó)
router.delete('/:id', requireRole(['doctor']), deleteMedicalRecord);

module.exports = router;
