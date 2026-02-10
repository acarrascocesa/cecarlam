// src/routes/prescriptions.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionsByPatient
} = require('../controllers/prescriptionController');

const {
  getPrescriptionMedications,
  addMedicationToPrescription,
  updatePrescriptionMedication,
  removeMedicationFromPrescription,
  getPrescriptionWithMedications
} = require('../controllers/prescriptionMedicationController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de prescripciones
router.get('/', requireRole(['doctor', 'secretary']), getPrescriptions);
router.post('/', requireRole(['doctor']), createPrescription);

// Rutas específicas para medicamentos en prescripciones (deben ir antes que /:id)
router.get('/:prescriptionId/medications', requireRole(['doctor', 'secretary']), getPrescriptionMedications);
router.post('/:prescriptionId/medications', requireRole(['doctor']), addMedicationToPrescription);
router.put('/:prescriptionId/medications/:medicationId', requireRole(['doctor']), updatePrescriptionMedication);
router.delete('/:prescriptionId/medications/:medicationId', requireRole(['doctor']), removeMedicationFromPrescription);

// Obtener prescripción completa con medicamentos
router.get('/:prescriptionId/complete', requireRole(['doctor', 'secretary']), getPrescriptionWithMedications);

// Obtener prescripciones por paciente (debe ir antes que /:id)
router.get('/patient/:patientId', requireRole(['doctor', 'secretary']), getPrescriptionsByPatient);

// Rutas CRUD básicas de prescripciones
router.get('/:id', requireRole(['doctor', 'secretary']), getPrescriptionById);
router.put('/:id', requireRole(['doctor']), updatePrescription);
router.delete('/:id', requireRole(['doctor']), deletePrescription);

module.exports = router;
