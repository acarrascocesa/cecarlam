// src/routes/attachments.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadAttachments,
  getAttachmentsByRecord,
  downloadAttachment,
  deleteAttachment
} = require('../controllers/attachmentController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// POST /api/attachments/upload - Subir archivos adjuntos
// Usa multer para manejar hasta 5 archivos con el nombre 'files'
router.post('/upload', upload.array('files', 5), uploadAttachments);

// GET /api/attachments/record/:medical_record_id - Obtener attachments de un registro
router.get('/record/:medical_record_id', getAttachmentsByRecord);

// GET /api/attachments/download/:filename - Descargar un archivo
router.get('/download/:filename', downloadAttachment);

// DELETE /api/attachments/:id - Eliminar un attachment
router.delete('/:id', deleteAttachment);

module.exports = router;
