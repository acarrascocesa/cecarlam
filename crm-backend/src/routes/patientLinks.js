// src/routes/patientLinks.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  findPatientByCedula,
  linkPatientToClinic,
  getPatientClinics,
  getMultiClinicPatients
} = require('../controllers/patientLinkController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /api/patient-links/search/:cedula - Buscar paciente por cédula
router.get('/search/:cedula', findPatientByCedula);

// POST /api/patient-links/link - Vincular paciente a clínica
router.post('/link', linkPatientToClinic);

// GET /api/patient-links/patient/:patientId/clinics - Clínicas del paciente
router.get('/patient/:patientId/clinics', getPatientClinics);

// GET /api/patient-links/multi-clinic - Pacientes multi-clínica
router.get('/multi-clinic', getMultiClinicPatients);

module.exports = router;
