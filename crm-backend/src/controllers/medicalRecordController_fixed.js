// src/controllers/medicalRecordController.js
const pool = require('../config/database');

// Función para convertir snake_case a camelCase
const convertToCamelCase = (obj) => {
  const converted = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    converted[camelKey] = value;
  }
  return converted;
};

const getMedicalRecords = async (req, res) => {
  try {
    const { clinicId, search } = req.query;
    const userId = req.user.id;
    
    let query = `
      SELECT mr.* FROM medical_records mr
      INNER JOIN user_clinics uc ON mr.clinic_id = uc.clinic_id
      WHERE uc.user_id = $1
    `;
    let params = [userId];
    let paramCount = 1;

    if (clinicId) {
      paramCount++;
      query += ` AND mr.clinic_id = $${paramCount}`;
      params.push(clinicId);
    }

    if (search) {
      paramCount++;
      query += ` AND (mr.diagnosis ILIKE $${paramCount} OR mr.notes ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY mr.record_date DESC';

    const result = await pool.query(query, params);
    const records = result.rows.map(convertToCamelCase);
    res.json(records);

  } catch (error) {
    console.error('Error obteniendo historiales médicos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMedicalRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM medical_records WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Historial médico no encontrado' });
    }

    const record = convertToCamelCase(result.rows[0]);
    res.json(record);

  } catch (error) {
    console.error('Error obteniendo historial médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createMedicalRecord = async (req, res) => {
  try {
    const {
      clinicId,
      patientId,
      recordDate,
      recordType,
      diagnosis,
      status,
      notes
    } = req.body;

    const result = await pool.query(
      `INSERT INTO medical_records (
        clinic_id, patient_id, doctor_id, record_date, record_type,
        diagnosis, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        clinicId, patientId, req.user.id, recordDate, recordType,
        diagnosis, status || 'Completo', notes
      ]
    );

    const record = convertToCamelCase(result.rows[0]);
    res.status(201).json(record);

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
      recordType,
      notes,
      status
    } = req.body;

    const result = await pool.query(`
      UPDATE medical_records 
      SET diagnosis = $1, record_type = $2, notes = $3, status = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND doctor_id = $6
      RETURNING *
    `, [diagnosis, recordType, notes, status, id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Historial médico no encontrado' });
    }

    const record = convertToCamelCase(result.rows[0]);
    res.json(record);

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
      return res.status(404).json({ error: 'Historial médico no encontrado' });
    }

    res.json({ message: 'Historial médico eliminado correctamente' });

  } catch (error) {
    console.error('Error eliminando historial médico:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMedicalRecordsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT mr.* FROM medical_records mr
      INNER JOIN user_clinics uc ON mr.clinic_id = uc.clinic_id
      WHERE mr.patient_id = $1 AND uc.user_id = $2
      ORDER BY mr.record_date DESC
    `, [patientId, userId]);

    const records = result.rows.map(convertToCamelCase);
    res.json(records);

  } catch (error) {
    console.error('Error obteniendo historiales del paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPatientHistory = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        mr.id, mr.record_date, mr.record_type, mr.diagnosis, 
        mr.status, mr.notes, mr.created_at,
        c.name as clinic_name,
        u.name as doctor_name
      FROM medical_records mr
      JOIN clinics c ON mr.clinic_id = c.id
      JOIN users u ON mr.doctor_id = u.id
      JOIN user_clinics uc ON mr.clinic_id = uc.clinic_id
      WHERE mr.patient_id = $1 AND uc.user_id = $2
      ORDER BY mr.record_date DESC, mr.created_at DESC
    `, [patientId, userId]);

    const history = result.rows.map(convertToCamelCase);
    res.json(history);

  } catch (error) {
    console.error('Error obteniendo historial completo del paciente:', error);
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
