// src/routes/userClinics.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole, requireClinicRole } = require('../middleware/auth');
const {
  getCurrentUserClinics,
  getUserClinicsList,
  getClinicUsers,
  assignUserToClinic,
  updateUserClinicRole,
  removeUserFromClinic,
  getAvailableUsers
} = require('../controllers/userClinicController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener usuarios disponibles para asignar a clínica
router.get('/available-users', requireRole(['admin', 'owner']), getAvailableUsers);

// Obtener clínicas del usuario actual
router.get('/my-clinics', getCurrentUserClinics);

// Obtener clínicas de un usuario específico (solo admin)
router.get('/user/:userId', requireRole(['admin']), getUserClinicsList);

// Obtener usuarios de una clínica específica
router.get('/clinic/:clinicId', requireClinicRole(['admin', 'owner', 'staff']), getClinicUsers);

// Asignar usuario a clínica
router.post('/', requireRole(['admin', 'owner']), assignUserToClinic);

// Actualizar rol de usuario en clínica
router.put('/:id/role', requireRole(['admin', 'owner']), updateUserClinicRole);

// Remover usuario de clínica
router.delete('/:id', requireRole(['admin', 'owner']), removeUserFromClinic);

module.exports = router;
