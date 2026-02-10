const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Rutas para configuraciones básicas
router.get('/basic', configController.getBasicSettings);
router.post('/basic', configController.saveBasicSettings);

// Rutas para perfil del doctor
router.get('/profile', configController.getDoctorProfile);
router.post('/profile', configController.saveDoctorProfile);

module.exports = router;
