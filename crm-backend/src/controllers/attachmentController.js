// src/controllers/attachmentController.js
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Subir archivos adjuntos a un registro médico
const uploadAttachments = async (req, res) => {
  try {
    const { medical_record_id } = req.body;
    
    // Validar que se proporcionó medical_record_id
    if (!medical_record_id) {
      return res.status(400).json({ 
        error: 'medical_record_id es requerido' 
      });
    }
    
    // Validar que se subieron archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No se seleccionaron archivos' 
      });
    }
    
    // Verificar que el registro médico existe y pertenece al usuario
    const medicalRecordCheck = await pool.query(
      'SELECT id FROM medical_records WHERE id = $1 AND doctor_id = $2',
      [medical_record_id, req.user.id]
    );
    
    if (medicalRecordCheck.rows.length === 0) {
      // Si hay error, eliminar los archivos subidos
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({ 
        error: 'Registro médico no encontrado o no autorizado' 
      });
    }
    
    const uploadedAttachments = [];
    
    // Procesar cada archivo subido
    for (const file of req.files) {
      // Construir URL del archivo
      const fileUrl = `/api/attachments/download/${file.filename}`;
      
      // Guardar información del archivo en la base de datos
      const result = await pool.query(`
        INSERT INTO medical_record_attachments (
          medical_record_id, file_name, file_type, file_url, file_size
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [
        medical_record_id,
        file.originalname,
        file.mimetype,
        fileUrl,
        file.size
      ]);
      
      uploadedAttachments.push(result.rows[0]);
    }
    
    res.status(201).json({
      message: 'Archivos subidos exitosamente',
      attachments: uploadedAttachments
    });
    
  } catch (error) {
    console.error('Error subiendo archivos:', error);
    
    // En caso de error, limpiar archivos subidos
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener attachments de un registro médico
const getAttachmentsByRecord = async (req, res) => {
  try {
    const { medical_record_id } = req.params;
    
    // Verificar que el registro médico existe y el usuario tiene acceso
    const medicalRecordCheck = await pool.query(`
      SELECT mr.id 
      FROM medical_records mr 
      WHERE mr.id = $1 AND mr.doctor_id = $2
    `, [medical_record_id, req.user.id]);
    
    if (medicalRecordCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Registro médico no encontrado o no autorizado' 
      });
    }
    
    const result = await pool.query(`
      SELECT * FROM medical_record_attachments 
      WHERE medical_record_id = $1 
      ORDER BY created_at DESC
    `, [medical_record_id]);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error obteniendo attachments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Descargar un archivo
const downloadAttachment = async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Buscar el attachment en la base de datos
    const result = await pool.query(`
      SELECT a.*, mr.doctor_id 
      FROM medical_record_attachments a
      JOIN medical_records mr ON a.medical_record_id = mr.id
      WHERE a.file_url LIKE $1
    `, [`%${filename}`]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }
    
    const attachment = result.rows[0];
    
    // Verificar autorización (solo el doctor que creó el registro puede descargar)
    if (attachment.doctor_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para acceder a este archivo' });
    }
    
    // Construir la ruta completa del archivo
    const filePath = path.join('/var/www/uploads/medical-attachments', filename);
    
    // Verificar que el archivo existe físicamente
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo físico no encontrado' });
    }
    
    // Establecer headers apropiados para la descarga
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.file_name}"`);
    res.setHeader('Content-Type', attachment.file_type);
    
    // Enviar el archivo
    res.sendFile(filePath);
    
  } catch (error) {
    console.error('Error descargando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un attachment
const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información del attachment y verificar autorización
    const result = await pool.query(`
      SELECT a.*, mr.doctor_id 
      FROM medical_record_attachments a
      JOIN medical_records mr ON a.medical_record_id = mr.id
      WHERE a.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment no encontrado' });
    }
    
    const attachment = result.rows[0];
    
    // Verificar autorización
    if (attachment.doctor_id !== req.user.id) {
      return res.status(403).json({ error: 'No autorizado para eliminar este archivo' });
    }
    
    // Extraer el nombre del archivo de la URL
    const filename = attachment.file_url.split('/').pop();
    const filePath = path.join('/var/www/uploads/medical-attachments', filename);
    
    // Eliminar el archivo físico si existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Eliminar registro de la base de datos
    await pool.query('DELETE FROM medical_record_attachments WHERE id = $1', [id]);
    
    res.json({ message: 'Attachment eliminado exitosamente' });
    
  } catch (error) {
    console.error('Error eliminando attachment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  uploadAttachments,
  getAttachmentsByRecord,
  downloadAttachment,
  deleteAttachment
};
