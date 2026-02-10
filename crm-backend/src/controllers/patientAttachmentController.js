// src/controllers/patientAttachmentController.js
const pool = require('../config/database');
const fs = require('fs');
const path = require('path');

// Subir archivos adjuntos a un paciente
const uploadPatientAttachments = async (req, res) => {
  try {
    const { patient_id, category = 'general', description = '' } = req.body;
    
    // Validar que se proporcionó patient_id
    if (!patient_id) {
      return res.status(400).json({ 
        error: 'patient_id es requerido' 
      });
    }
    
    // Validar que se subieron archivos
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No se seleccionaron archivos' 
      });
    }
    
    // Verificar que el paciente existe y el usuario tiene acceso
    // (Para simplificar, asumimos que todos los doctores pueden agregar documentos a cualquier paciente de su clínica)
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1',
      [patient_id]
    );
    
    if (patientCheck.rows.length === 0) {
      // Si hay error, eliminar los archivos subidos
      req.files.forEach(file => {
        fs.unlinkSync(file.path);
      });
      return res.status(404).json({ 
        error: 'Paciente no encontrado' 
      });
    }
    
    const uploadedAttachments = [];
    
    // Procesar cada archivo subido
    for (const file of req.files) {
      // Construir URL del archivo
      const fileUrl = `/api/patient-attachments/download/${file.filename}`;
      
      // Guardar información del archivo en la base de datos
      const result = await pool.query(`
        INSERT INTO patient_attachments (
          patient_id, file_name, file_type, file_url, file_size, category, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        patient_id,
        file.originalname,
        file.mimetype,
        fileUrl,
        file.size,
        category,
        description
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

// Obtener attachments de un paciente
const getAttachmentsByPatient = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const { category } = req.query;
    
    // Validar que patient_id no sea undefined o null
    if (!patient_id || patient_id === 'undefined') {
      return res.status(400).json({ 
        error: 'ID de paciente requerido' 
      });
    }
    
    // Verificar que el paciente existe
    const patientCheck = await pool.query(
      'SELECT id FROM patients WHERE id = $1',
      [patient_id]
    );
    
    if (patientCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Paciente no encontrado' 
      });
    }
    
    let query = `
      SELECT * FROM patient_attachments 
      WHERE patient_id = $1
    `;
    let params = [patient_id];
    
    // Filtro por categoría si se proporciona
    if (category && category !== 'all') {
      query += ` AND category = $2`;
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error obteniendo attachments:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Descargar un archivo de paciente
const downloadPatientAttachment = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({ error: 'Nombre de archivo requerido' });
    }
    
    console.log('[DOWNLOAD] Buscando archivo:', filename);
    
    // Buscar el attachment en la base de datos
    // El file_url se guarda como: /api/patient-attachments/download/FILENAME
    const exactUrl = `/api/patient-attachments/download/${filename}`;
    const likePattern = `%/${filename}`;
    
    console.log('[DOWNLOAD] Buscando con URL exacta:', exactUrl);
    console.log('[DOWNLOAD] Buscando con patrón LIKE:', likePattern);
    
    const result = await pool.query(`
      SELECT * 
      FROM patient_attachments
      WHERE file_url = $1 OR file_url LIKE $2
    `, [exactUrl, likePattern]);
    
    console.log('[DOWNLOAD] Resultados encontrados:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.error('[DOWNLOAD] Archivo no encontrado en BD para filename:', filename);
      return res.status(404).json({ error: 'Archivo no encontrado en la base de datos' });
    }
    
    const attachment = result.rows[0];
    console.log('[DOWNLOAD] Attachment encontrado:', {
      id: attachment.id,
      file_name: attachment.file_name,
      file_url: attachment.file_url
    });
    
    // Construir la ruta completa del archivo usando el filename del parámetro
    const filePath = path.join('/app/uploads/medical-attachments', filename);
    console.log('[DOWNLOAD] Ruta del archivo físico:', filePath);
    
    // Verificar que el archivo existe físicamente
    if (!fs.existsSync(filePath)) {
      console.error('[DOWNLOAD] Archivo físico NO existe en:', filePath);
      return res.status(404).json({ error: 'Archivo físico no encontrado' });
    }
    
    console.log('[DOWNLOAD] Archivo físico existe, enviando...');
    
    // Establecer headers apropiados para la descarga
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.file_name}"`);
    res.setHeader('Content-Type', attachment.file_type);
    
    // Enviar el archivo
    res.sendFile(filePath, { root: '/' });
    
  } catch (error) {
    console.error('[DOWNLOAD] Error descargando archivo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un attachment de paciente
const deletePatientAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener información del attachment
    const result = await pool.query(`
      SELECT * FROM patient_attachments WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment no encontrado' });
    }
    
    const attachment = result.rows[0];
    
    // Extraer el nombre del archivo de la URL
    const filename = attachment.file_url.split('/').pop();
    const filePath = path.join('/app/uploads/medical-attachments', filename);
    
    // Eliminar el archivo físico si existe
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    // Eliminar registro de la base de datos
    await pool.query('DELETE FROM patient_attachments WHERE id = $1', [id]);
    
    res.json({ message: 'Attachment eliminado exitosamente' });
    
  } catch (error) {
    console.error('Error eliminando attachment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un attachment (solo descripción y categoría)
const updatePatientAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description } = req.body;
    
    const result = await pool.query(`
      UPDATE patient_attachments 
      SET category = $1, description = $2
      WHERE id = $3
      RETURNING *
    `, [category, description, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attachment no encontrado' });
    }
    
    res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error actualizando attachment:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  uploadPatientAttachments,
  getAttachmentsByPatient,
  downloadPatientAttachment,
  deletePatientAttachment,
  updatePatientAttachment
};
