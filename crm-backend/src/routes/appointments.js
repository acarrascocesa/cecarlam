// src/routes/appointments.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDate,
  getDoctorSchedule,
  updateAppointmentStatus
} = require('../controllers/appointmentController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todas las citas (filtradas por clínica)
router.get('/', requireRole(['doctor', 'secretary']), getAppointments);

// Obtener citas por fecha (debe ir antes que /:id)
router.get('/date/:date', requireRole(['doctor', 'secretary']), getAppointmentsByDate);

// Obtener agenda de un doctor específico (debe ir antes que /:id)
router.get('/doctor/:doctorId/schedule', requireRole(['doctor', 'secretary']), getDoctorSchedule);

// Crear nueva cita (doctores y secretarias)
router.post('/', requireRole(['doctor', 'secretary']), createAppointment);

// Obtener cita por ID
router.get('/:id', requireRole(['doctor', 'secretary']), getAppointmentById);

// Actualizar cita (solo el doctor que la creó o secretarias)
router.put('/:id', requireRole(['doctor', 'secretary']), updateAppointment);

// Eliminar cita (solo el doctor que la creó o secretarias)
router.delete('/:id', requireRole(['doctor', 'secretary']), deleteAppointment);

// Actualizar estado de cita (solo doctores)
router.patch('/:id/status', requireRole(['doctor']), updateAppointmentStatus);

module.exports = router; 