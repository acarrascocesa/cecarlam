// src/routes/patientAttachments.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadPatientAttachments,
  getAttachmentsByPatient,
  downloadPatientAttachment,
  deletePatientAttachment,
  updatePatientAttachment
} = require('../controllers/patientAttachmentController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// POST /api/patient-attachments/upload - Subir archivos adjuntos de paciente
// Usa multer para manejar hasta 5 archivos con el nombre 'files'
router.post('/upload', upload.array('files', 5), uploadPatientAttachments);

// GET /api/patient-attachments/download/:filename(*) - Descargar un archivo
// El parámetro (*) captura todo incluyendo puntos y barras
router.get('/download/:filename(*)', (req, res, next) => {
  console.log('=== RUTA DOWNLOAD CAPTURADA ===');
  console.log('req.path:', req.path);
  console.log('req.params:', req.params);
  console.log('filename:', req.params.filename);
  downloadPatientAttachment(req, res, next);
});

// GET /api/patient-attachments/patient/:patient_id - Obtener attachments de un paciente
router.get('/patient/:patient_id', getAttachmentsByPatient);

// PUT /api/patient-attachments/:id - Actualizar attachment (categoria/descripción)
router.put('/:id', updatePatientAttachment);

// DELETE /api/patient-attachments/:id - Eliminar un attachment
router.delete('/:id', deletePatientAttachment);

module.exports = router;
