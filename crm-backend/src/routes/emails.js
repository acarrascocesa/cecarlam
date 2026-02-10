// src/routes/emails.js
const express = require('express');
const router = express.Router();
const { 
  sendAppointmentReminder,
  sendPrescriptionEmail,
  sendMedicalResults,
  sendInvoiceEmail,
  getEmailHistory
} = require('../controllers/emailController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Enviar recordatorio de cita
router.post('/send-appointment-reminder/:appointmentId', 
  authenticateToken, 
  requireRole(['doctor', 'secretary']), 
  sendAppointmentReminder
);

// Enviar receta médica
router.post('/send-prescription/:prescriptionId', 
  authenticateToken, 
  requireRole(['doctor']), 
  sendPrescriptionEmail
);

// Enviar resultados médicos
router.post('/send-results/:recordId', 
  authenticateToken, 
  requireRole(['doctor']), 
  sendMedicalResults
);

// Enviar factura
router.post('/send-invoice/:invoiceId', 
  authenticateToken, 
  requireRole(['doctor', 'secretary', 'admin']), 
  sendInvoiceEmail
);

// Obtener historial de emails
router.get('/history/:patientId?', 
  authenticateToken, 
  getEmailHistory
);

module.exports = router;
