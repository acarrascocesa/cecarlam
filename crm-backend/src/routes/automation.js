// src/routes/automation.js
const express = require('express');
const router = express.Router();
const { 
  getAutomationConfig,
  updateAutomationConfig,
  getAutomationStats,
  runManualReminders,
  startAutomation,
  stopAutomation
} = require('../controllers/automationController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Obtener configuración de automatización
router.get('/config', 
  authenticateToken, 
  requireRole(['doctor', 'admin']), 
  getAutomationConfig
);

// Actualizar configuración de automatización
router.put('/config', 
  authenticateToken, 
  requireRole(['doctor', 'admin']), 
  updateAutomationConfig
);

// Obtener estadísticas de automatización
router.get('/stats', 
  authenticateToken, 
  requireRole(['doctor', 'admin']), 
  getAutomationStats
);

// Ejecutar recordatorios manualmente
router.post('/run-manual', 
  authenticateToken, 
  requireRole(['doctor', 'admin']), 
  runManualReminders
);

// Iniciar automatización
router.post('/start', 
  authenticateToken, 
  requireRole(['doctor', 'admin']), 
  startAutomation
);

// Detener automatización
router.post('/stop', 
  authenticateToken, 
  requireRole(['doctor', 'admin']), 
  stopAutomation
);

module.exports = router;
