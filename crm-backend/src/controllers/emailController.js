// src/controllers/emailController.js
const pool = require('../config/database');
const emailService = require('../services/emailService');

// Función para enviar recordatorio de cita
const sendAppointmentReminder = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    
    // Obtener datos completos de la cita
    const appointmentQuery = `
      SELECT 
        a.*,
        p.name as patient_name,
        p.email as patient_email,
        c.name as clinic_name,
        c.address as clinic_address,
        c.phone as clinic_phone,
        u.name as doctor_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN clinics c ON a.clinic_id = c.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.id = $1
    `;
    
    const appointmentResult = await pool.query(appointmentQuery, [appointmentId]);
    
    if (appointmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }
    
    const appointment = appointmentResult.rows[0];
    
    if (!appointment.patient_email) {
      return res.status(400).json({ error: 'El paciente no tiene email registrado' });
    }
    
    // Enviar email
    const result = await emailService.sendAppointmentReminderEmail(
      appointment,
      { id: appointment.patient_id, name: appointment.patient_name, email: appointment.patient_email },
      { id: appointment.doctor_id, name: appointment.doctor_name },
      {
        id: appointment.clinic_id,
        name: appointment.clinic_name,
        address: appointment.clinic_address,
        phone: appointment.clinic_phone
      }
    );
    
    if (result.success) {
      // Registrar el envío en la base de datos
      await pool.query(
        `INSERT INTO messages (clinic_id, patient_id, sender_id, message_type, sender_type, content, status, message_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          appointment.clinic_id,
          appointment.patient_id,
          req.user.userId,
          'Recordatorio',
          'doctor',
          'Recordatorio de cita enviado por email',
          'Enviado',
          new Date()
        ]
      );
      
      res.json({ 
        success: true, 
        message: 'Recordatorio enviado exitosamente',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Error enviando recordatorio',
        details: result.error
      });
    }
    
  } catch (error) {
    console.error('Error enviando recordatorio de cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para enviar receta por email
const sendPrescriptionEmail = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
    // Obtener datos completos de la prescripción
    const prescriptionQuery = `
      SELECT 
        pr.*,
        p.name as patient_name,
        p.email as patient_email,
        c.name as clinic_name,
        c.address as clinic_address,
        c.phone as clinic_phone,
        u.name as doctor_name,
        u.license_number,
        u.specialty
      FROM prescriptions pr
      JOIN patients p ON pr.patient_id = p.id
      JOIN clinics c ON pr.clinic_id = c.id
      LEFT JOIN users u ON pr.doctor_id = u.id
      WHERE pr.id = $1
    `;
    
    const prescriptionResult = await pool.query(prescriptionQuery, [prescriptionId]);
    
    if (prescriptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Prescripción no encontrada' });
    }
    
    const prescription = prescriptionResult.rows[0];
    
    if (!prescription.patient_email) {
      return res.status(400).json({ error: 'El paciente no tiene email registrado' });
    }
    
    // Enviar email
    const result = await emailService.sendPrescriptionEmail(
      prescription,
      { id: prescription.patient_id, name: prescription.patient_name, email: prescription.patient_email },
      { 
        id: prescription.doctor_id,
        name: prescription.doctor_name, 
        licenseNumber: prescription.license_number,
        specialty: prescription.specialty
      },
      {
        id: prescription.clinic_id,
        name: prescription.clinic_name,
        address: prescription.clinic_address,
        phone: prescription.clinic_phone
      }
    );
    
    if (result.success) {
      // Registrar el envío
      await pool.query(
        `INSERT INTO messages (clinic_id, patient_id, sender_id, message_type, sender_type, content, status, message_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          prescription.clinic_id,
          prescription.patient_id,
          req.user.userId,
          'Consulta',
          'doctor',
          'Receta médica enviada por email',
          'Enviado',
          new Date()
        ]
      );
      
      res.json({ 
        success: true, 
        message: 'Receta enviada exitosamente',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Error enviando receta',
        details: result.error
      });
    }
    
  } catch (error) {
    console.error('Error enviando receta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para enviar resultados médicos
const sendMedicalResults = async (req, res) => {
  try {
    const { recordId } = req.params;
    
    // Obtener datos completos del registro médico
    const recordQuery = `
      SELECT 
        mr.*,
        p.name as patient_name,
        p.email as patient_email,
        c.name as clinic_name,
        c.address as clinic_address,
        c.phone as clinic_phone,
        u.name as doctor_name
      FROM medical_records mr
      JOIN patients p ON mr.patient_id = p.id
      JOIN clinics c ON mr.clinic_id = c.id
      LEFT JOIN users u ON mr.doctor_id = u.id
      WHERE mr.id = $1
    `;
    
    const recordResult = await pool.query(recordQuery, [recordId]);
    
    if (recordResult.rows.length === 0) {
      return res.status(404).json({ error: 'Registro médico no encontrado' });
    }
    
    const record = recordResult.rows[0];
    
    if (!record.patient_email) {
      return res.status(400).json({ error: 'El paciente no tiene email registrado' });
    }
    
    // Enviar email
    const result = await emailService.sendMedicalResultsEmail(
      record,
      { id: record.patient_id, name: record.patient_name, email: record.patient_email },
      { id: record.doctor_id, name: record.doctor_name },
      {
        id: record.clinic_id,
        name: record.clinic_name,
        address: record.clinic_address,
        phone: record.clinic_phone
      }
    );
    
    if (result.success) {
      // Registrar el envío
      await pool.query(
        `INSERT INTO messages (clinic_id, patient_id, sender_id, message_type, sender_type, content, status, message_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          record.clinic_id,
          record.patient_id,
          req.user.userId,
          'Resultado',
          'doctor',
          'Resultados médicos enviados por email',
          'Enviado',
          new Date()
        ]
      );
      
      res.json({ 
        success: true, 
        message: 'Resultados enviados exitosamente',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Error enviando resultados',
        details: result.error
      });
    }
    
  } catch (error) {
    console.error('Error enviando resultados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para enviar factura
const sendInvoiceEmail = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    
    // Obtener datos completos de la factura
    const invoiceQuery = `
      SELECT 
        i.id,
        i.patient_id,
        i.clinic_id,
        i.total_services,
        i.insurance_covers,
        i.patient_pays,
        i.invoice_date,
        i.status,
        p.name as patient_name,
        p.email as patient_email,
        c.name as clinic_name,
        c.address as clinic_address,
        c.phone as clinic_phone
      FROM invoices i
      JOIN patients p ON i.patient_id = p.id
      JOIN clinics c ON i.clinic_id = c.id
      WHERE i.id = $1
    `;
    
    const invoiceResult = await pool.query(invoiceQuery, [invoiceId]);
    
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    const invoice = invoiceResult.rows[0];
    
    console.log('📧 Invoice data for email:', {
      id: invoice.id,
      invoice_number: invoice.invoice_number,
      total_services: invoice.total_services,
      insurance_covers: invoice.insurance_covers,
      patient_pays: invoice.patient_pays,
      patient_email: invoice.patient_email
    });
    
    if (!invoice.patient_email) {
      return res.status(400).json({ error: 'El paciente no tiene email registrado' });
    }
    
    // Enviar email
    const result = await emailService.sendInvoiceEmail(
      invoice,
      { id: invoice.patient_id, name: invoice.patient_name, email: invoice.patient_email },
      { id: req.user.userId, name: req.user.name, email: req.user.email },
      {
        id: invoice.clinic_id,
        name: invoice.clinic_name,
        address: invoice.clinic_address,
        phone: invoice.clinic_phone
      }
    );
    
    if (result.success) {
      // Registrar el envío
      await pool.query(
        `INSERT INTO messages (clinic_id, patient_id, sender_id, message_type, sender_type, content, status, message_date) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          invoice.clinic_id,
          invoice.patient_id,
          req.user.userId,
          'General',
          'doctor',
          'Factura enviada por email',
          'Enviado',
          new Date()
        ]
      );
      
      res.json({ 
        success: true, 
        message: 'Factura enviada exitosamente',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Error enviando factura',
        details: result.error
      });
    }
    
  } catch (error) {
    console.error('Error enviando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Función para obtener historial de emails enviados
const getEmailHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    let query = `
      SELECT 
        m.id,
        m.patient_id,
        m.message_type as email_type,
        m.status,
        m.message_date as created_at,
        m.message_date as sent_at,
        m.content as error_message,
        p.name as patient_name,
        p.email as patient_email,
        u.name as sender_name
      FROM messages m
      JOIN patients p ON m.patient_id = p.id
      LEFT JOIN users u ON m.sender_id = u.id
      WHERE m.message_type IN ('Recordatorio', 'Consulta', 'Resultado', 'General')
    `;
    
    let params = [];
    let paramCount = 0;
    
    if (patientId) {
      paramCount++;
      query += ` AND m.patient_id = $${paramCount}`;
      params.push(patientId);
    }
    
    // Para usuarios sin vista multiclínica, filtrar por su clínica específica
    if (!req.user.multiClinicView) {
      // Obtener la clínica del usuario
      const userClinicQuery = `
        SELECT clinic_id FROM user_clinics 
        WHERE user_id = $1 AND role = 'doctor' 
        LIMIT 1
      `;
      const userClinicResult = await pool.query(userClinicQuery, [req.user.id]);
      
      if (userClinicResult.rows.length > 0) {
        paramCount++;
        query += ` AND m.clinic_id = $${paramCount}`;
        params.push(userClinicResult.rows[0].clinic_id);
      }
    }
    
    query += ` ORDER BY m.message_date DESC`;
    
    console.log('Query ejecutada:', query);
    console.log('Parámetros:', params);
    console.log('Usuario multiClinicView:', req.user.multiClinicView);
    
    const result = await pool.query(query, params);
    
    console.log('Resultados encontrados:', result.rows.length);
    
    // Transformar los datos para que coincidan con la estructura esperada por el frontend
    const transformedData = result.rows.map(row => ({
      id: row.id,
      patient_id: row.patient_id,
      patient: {
        name: row.patient_name,
        email: row.patient_email
      },
      email_type: row.email_type,
      status: row.status === 'Enviado' ? 'sent' : row.status === 'Entregado' ? 'delivered' : 'failed',
      created_at: row.created_at,
      sent_at: row.sent_at,
      error_message: row.status === 'Enviado' ? null : row.error_message, // Solo mostrar error_message si no fue enviado exitosamente
      template_id: null,
      metadata: {}
    }));
    
    res.json(transformedData);
    
  } catch (error) {
    console.error('Error obteniendo historial de emails:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  sendAppointmentReminder,
  sendPrescriptionEmail,
  sendMedicalResults,
  sendInvoiceEmail,
  getEmailHistory
};
