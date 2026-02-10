// src/middleware/upload.js
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Configuración de almacenamiento
const storage = multer.diskStorage({
  // Destination: donde se guardará el archivo
  destination: function (req, file, cb) {
    const uploadPath = '/app/uploads/medical-attachments/';
    // Crear directorio si no existe con permisos correctos
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true, mode: 0o755 });
    }
    cb(null, uploadPath);
  },
  
  // Filename: cómo se llamará el archivo guardado
  filename: function (req, file, cb) {
    // Generar un nombre único para evitar conflictos
    // Formato: timestamp-randomstring-originalname
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);
    
    cb(null, `${uniqueSuffix}-${basename}${extension}`);
  }
});

// Función para filtrar tipos de archivos permitidos
const fileFilter = (req, file, cb) => {
  // Tipos MIME permitidos para archivos médicos
  const allowedMimes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo se permiten: JPG, PNG, PDF, DOC, DOCX, TXT'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 5 // Máximo 5 archivos por solicitud
  }
});

module.exports = upload;
