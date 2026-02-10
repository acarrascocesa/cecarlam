// src/controllers/medicalRecordController.js
const pool = require('../config/database');

const getMedicalRecords = async (req, res) => {
  try {
    const { clinicId, patientId } = req.query;
    let query = `
      SELECT 
        mr.*,
        u.name as doctor_name,
        pat.name as patient_name,
        c.name as clinic_name
      FROM medical_records mr
      JOIN users u ON mr.doctor_id = u.id
      JOIN patients pat ON mr.patient_id = pat.id
      JOIN clinics c ON mr.clinic_id = c.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    if (clinicId) {
      paramCount++;
      query += ` AND mr.clinic_id = $${paramCount}`;
      params.push(clinicId);
    }

    if (patientId) {
      paramCount++;
      query += ` AND mr.patient_id = $${paramCount}`;
      params.push(patientId);
    }

    query += ' ORDER BY mr.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo historiales médicos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        mr.*,
        u.name as doctor_name,
        pat.name as patient_name,
        c.name as clinic_name
      FROM medical_records mr
      JOIN users u ON mr.doctor_id = u.id
      JOIN patients pat ON mr.patient_id = pat.id
      JOIN clinics c ON mr.clinic_id = c.id
      WHERE mr.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Historial médico no encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error obteniendo historial médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createMedicalRecord = async (req, res) => {
  try {
    const {
      patient_id,
      clinic_id,
      record_date,
      record_type,
      diagnosis,
      status,
      notes
    } = req.body;

    const doctor_id = req.user.id;

    if (!patient_id || !clinic_id) {
      return res.status(400).json({ 
        error: 'patient_id y clinic_id son requeridos' 
      });
    }

    const result = await pool.query(`
      INSERT INTO medical_records (
        patient_id, doctor_id, clinic_id, record_date, record_type,
        diagnosis, status, notes, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      patient_id, doctor_id, clinic_id, 
      record_date || new Date().toISOString().split('T')[0],
      record_type || 'Consulta General',
      diagnosis, status || 'Completo', notes
    ]);

    // Obtener el registro completo con información relacionada
    const fullRecord = await pool.query(`
      SELECT 
        mr.*,
        u.name as doctor_name,
        pat.name as patient_name,
        c.name as clinic_name
      FROM medical_records mr
      JOIN users u ON mr.doctor_id = u.id
      JOIN patients pat ON mr.patient_id = pat.id
      JOIN clinics c ON mr.clinic_id = c.id
      WHERE mr.id = $1
    `, [result.rows[0].id]);

    res.status(201).json(fullRecord.rows[0]);

  } catch (error) {
    console.error('Error creando historial médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      diagnosis,
      status,
      notes
    } = req.body;

    // Obtener registro actual
    const currentRecord = await pool.query(
      'SELECT * FROM medical_records WHERE id = $1 AND doctor_id = $2',
      [id, req.user.id]
    );

    if (currentRecord.rows.length === 0) {
      return res.status(404).json({ error: 'Historial médico no encontrado o no autorizado' });
    }

    const current = currentRecord.rows[0];

    // Usar COALESCE para mantener valores originales si no se envían
    const result = await pool.query(`
      UPDATE medical_records 
      SET diagnosis = COALESCE($1, diagnosis),
          status = COALESCE($2, status),
          notes = COALESCE($3, notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4 AND doctor_id = $5
      RETURNING *
    `, [
      diagnosis !== undefined ? diagnosis : null,
      status !== undefined ? status : null, 
      notes !== undefined ? notes : null,
      id, 
      req.user.id
    ]);

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error actualizando historial médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM medical_records WHERE id = $1 AND doctor_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Historial médico no encontrado o no autorizado' });
    }

    res.json({ message: 'Historial médico eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando historial médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(`
      SELECT 
        mr.*,
        u.name as doctor_name,
        c.name as clinic_name
      FROM medical_records mr
      JOIN users u ON mr.doctor_id = u.id
      JOIN clinics c ON mr.clinic_id = c.id
      WHERE mr.patient_id = $1
      ORDER BY mr.created_at DESC
    `, [patientId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo historiales médicos del paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Obtener historiales médicos
    const medicalRecords = await pool.query(`
      SELECT mr.*, u.name as doctor_name, c.name as clinic_name
      FROM medical_records mr
      JOIN users u ON mr.doctor_id = u.id
      JOIN clinics c ON mr.clinic_id = c.id
      WHERE mr.patient_id = $1
      ORDER BY mr.created_at DESC
    `, [patientId]);

    // Obtener prescripciones
    const prescriptions = await pool.query(`
      SELECT p.*, u.name as doctor_name, c.name as clinic_name
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      JOIN clinics c ON p.clinic_id = c.id
      WHERE p.patient_id = $1
      ORDER BY p.created_at DESC
    `, [patientId]);

    // Obtener citas
    const appointments = await pool.query(`
      SELECT a.*, u.name as doctor_name, c.name as clinic_name
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN clinics c ON a.clinic_id = c.id
      WHERE a.patient_id = $1
      ORDER BY a.appointment_date DESC
    `, [patientId]);

    res.json({
      medicalRecords: medicalRecords.rows,
      prescriptions: prescriptions.rows,
      appointments: appointments.rows
    });

  } catch (error) {
    console.error('Error obteniendo historial del paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getMedicalRecords,
  getMedicalRecordById,
  createMedicalRecord,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordsByPatient,
  getPatientHistory
};

