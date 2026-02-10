// src/routes/reports.js
const express = require('express');
const router = express.Router();
const { 
  getReports, 
  generateReport, 
  getReportById, 
  deleteReport,
  downloadReport,
  getReportTemplates,
  createReportTemplate
} = require('../controllers/reportController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Rutas principales de reportes
router.get('/', authenticateToken, getReports);
router.post('/', authenticateToken, requireRole(['doctor', 'secretary']), generateReport);

// Rutas de plantillas (DEBEN IR ANTES de /:id)
router.get('/templates', authenticateToken, getReportTemplates);
router.post('/templates', authenticateToken, requireRole(['doctor']), createReportTemplate);

// Rutas de reportes específicos (DEBEN IR DESPUÉS de /templates)
router.get('/:id/download', authenticateToken, downloadReport);
router.get('/:id', authenticateToken, getReportById);
router.delete('/:id', authenticateToken, requireRole(['doctor', 'secretary']), deleteReport);

module.exports = router;
