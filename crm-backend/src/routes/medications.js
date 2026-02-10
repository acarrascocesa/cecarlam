// src/routes/medications.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  getMedicationsByCategory,
  searchMedications
} = require('../controllers/medicationController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Buscar medicamentos (debe ir antes que /:id)
router.get('/search', searchMedications);

// Obtener categorías de medicamentos
router.get('/categories', getMedicationsByCategory);

// Obtener todos los medicamentos
router.get('/', requireRole(['doctor', 'secretary']), getMedications);

// Crear nuevo medicamento (solo doctores)
router.post('/', requireRole(['doctor']), createMedication);

// Obtener medicamento por ID
router.get('/:id', requireRole(['doctor', 'secretary']), getMedicationById);

// Actualizar medicamento (solo el doctor que lo creó)
router.put('/:id', requireRole(['doctor']), updateMedication);

// Eliminar medicamento (solo el doctor que lo creó)
router.delete('/:id', requireRole(['doctor']), deleteMedication);

module.exports = router;
