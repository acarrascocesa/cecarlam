// src/routes/emailTemplates.js
const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Mapear tipos de plantilla de base de datos a frontend
const mapTemplateType = (dbType) => {
  const typeMap = {
    'appointment_reminder': 'appointment_reminder',
    'prescription_sent': 'prescription',
    'results_ready': 'results',
    'invoice_sent': 'invoice'
  };
  return typeMap[dbType] || dbType;
};

// Mapear tipos de frontend a base de datos
const mapToDbType = (frontendType) => {
  const typeMap = {
    'appointment_reminder': 'appointment_reminder',
    'prescription': 'prescription_sent',
    'results': 'results_ready',
    'invoice': 'invoice_sent'
  };
  return typeMap[frontendType] || frontendType;
};

// Obtener todas las plantillas de email
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = `
      SELECT 
        id,
        name,
        template_type,
        subject_template as subject,
        html_template as html_content,
        is_active,
        created_at
      FROM email_templates 
      WHERE 1=1
    `;
    const values = [];
    
    if (type) {
      const dbType = mapToDbType(type);
      query += ' AND template_type = $1';
      values.push(dbType);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, values);
    
    // Mapear tipos para el frontend
    const mappedRows = result.rows.map(row => ({
      ...row,
      type: mapTemplateType(row.template_type),
      template_type: undefined // Remover campo original
    }));
    
    res.json(mappedRows);
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener una plantilla específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        id,
        name,
        template_type,
        subject_template as subject,
        html_template as html_content,
        is_active,
        created_at
      FROM email_templates 
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    const row = result.rows[0];
    const mappedRow = {
      ...row,
      type: mapTemplateType(row.template_type),
      template_type: undefined
    };
    
    res.json(mappedRow);
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nueva plantilla de email
router.post('/', authenticateToken, requireRole(['doctor', 'admin']), async (req, res) => {
  try {
    const { name, type, subject, html_content } = req.body;
    
    if (!name || !type || !subject || !html_content) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    const dbType = mapToDbType(type);
    
    const result = await pool.query(`
      INSERT INTO email_templates (name, template_type, subject_template, html_template, is_active) 
      VALUES ($1, $2, $3, $4, true) 
      RETURNING 
        id,
        name,
        template_type,
        subject_template as subject,
        html_template as html_content,
        is_active,
        created_at
    `, [name, dbType, subject, html_content]);
    
    const row = result.rows[0];
    const mappedRow = {
      ...row,
      type: mapTemplateType(row.template_type),
      template_type: undefined
    };
    
    res.status(201).json(mappedRow);
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar plantilla de email
router.put('/:id', authenticateToken, requireRole(['doctor', 'admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, html_content, is_active } = req.body;
    
    if (!name || !subject || !html_content) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    const result = await pool.query(`
      UPDATE email_templates 
      SET 
        name = $1, 
        subject_template = $2, 
        html_template = $3, 
        is_active = $4, 
        updated_at = NOW() 
      WHERE id = $5 
      RETURNING 
        id,
        name,
        template_type,
        subject_template as subject,
        html_template as html_content,
        is_active,
        created_at
    `, [name, subject, html_content, is_active !== undefined ? is_active : true, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    const row = result.rows[0];
    const mappedRow = {
      ...row,
      type: mapTemplateType(row.template_type),
      template_type: undefined
    };
    
    res.json(mappedRow);
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar plantilla de email
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM email_templates WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plantilla no encontrada' });
    }
    
    res.json({ message: 'Plantilla eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
