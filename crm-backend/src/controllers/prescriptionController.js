// src/controllers/prescriptionController.js
const pool = require('../config/database');

const getPrescriptions = async (req, res) => {
  try {
    const { clinicId, patientId, doctorId } = req.query;
    let query = `
      SELECT 
        p.*,
        u.name as doctor_name,
        pat.name as patient_name,
        c.name as clinic_name
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      JOIN patients pat ON p.patient_id = pat.id
      JOIN clinics c ON p.clinic_id = c.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    if (clinicId) {
      paramCount++;
      query += ` AND p.clinic_id = $${paramCount}`;
      params.push(clinicId);
    }

    if (patientId) {
      paramCount++;
      query += ` AND p.patient_id = $${paramCount}`;
      params.push(patientId);
    }

    if (doctorId) {
      paramCount++;
      query += ` AND p.doctor_id = $${paramCount}`;
      params.push(doctorId);
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo prescripciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener la prescripción
    const prescriptionResult = await pool.query(`
      SELECT 
        p.*,
        u.name as doctor_name,
        pat.name as patient_name,
        c.name as clinic_name
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      JOIN patients pat ON p.patient_id = pat.id
      JOIN clinics c ON p.clinic_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (prescriptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Prescripción no encontrada' });
    }

    // Obtener los medicamentos asociados
    const medicationsResult = await pool.query(`
      SELECT 
        pm.*,
        m.name as medication_name,
        m.generic_name,
        m.category,
        m.contraindications,
        m.side_effects
      FROM prescription_medications pm
      JOIN medications m ON pm.medication_id = m.id
      WHERE pm.prescription_id = $1
      ORDER BY pm.created_at ASC
    `, [id]);

    const prescription = prescriptionResult.rows[0];
    prescription.medications = medicationsResult.rows;

    res.json(prescription);

  } catch (error) {
    console.error('Error obteniendo prescripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createPrescription = async (req, res) => {
  try {
    const {
      patient_id,
      clinic_id,
      prescription_date,
      prescription_text,
      notes,
      medications = [] // Array de medicamentos a agregar
    } = req.body;

    const doctor_id = req.user.id;

    if (!patient_id || !clinic_id) {
      return res.status(400).json({ 
        error: 'patient_id y clinic_id son requeridos' 
      });
    }

    // Crear la prescripción
    const prescriptionResult = await pool.query(`
      INSERT INTO prescriptions (
        patient_id, doctor_id, clinic_id, prescription_date, 
        prescription_text, notes, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      patient_id, doctor_id, clinic_id, 
      prescription_date || new Date().toISOString().split('T')[0],
      prescription_text, notes, 'Activa'
    ]);

    const prescription = prescriptionResult.rows[0];

    // Agregar medicamentos si se proporcionaron
    if (medications.length > 0) {
      for (const med of medications) {
        if (med.medication_id && med.dosage && med.frequency) {
          await pool.query(`
            INSERT INTO prescription_medications (
              prescription_id, medication_id, dosage, frequency, 
              duration, instructions, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
          `, [
            prescription.id, med.medication_id, med.dosage, 
            med.frequency, med.duration, med.instructions
          ]);
        }
      }
    }

    // Obtener la prescripción completa con medicamentos
    const completeResult = await pool.query(`
      SELECT 
        p.*,
        u.name as doctor_name,
        pat.name as patient_name,
        c.name as clinic_name
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      JOIN patients pat ON p.patient_id = pat.id
      JOIN clinics c ON p.clinic_id = c.id
      WHERE p.id = $1
    `, [prescription.id]);

    const medicationsResult = await pool.query(`
      SELECT 
        pm.*,
        m.name as medication_name,
        m.generic_name,
        m.category
      FROM prescription_medications pm
      JOIN medications m ON pm.medication_id = m.id
      WHERE pm.prescription_id = $1
    `, [prescription.id]);

    const completePrescription = completeResult.rows[0];
    completePrescription.medications = medicationsResult.rows;

    res.status(201).json(completePrescription);

  } catch (error) {
    console.error('Error creando prescripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      prescription_date,
      prescription_text,
      notes,
      status
    } = req.body;

    const result = await pool.query(`
      UPDATE prescriptions 
      SET prescription_date = COALESCE($1, prescription_date),
          prescription_text = COALESCE($2, prescription_text),
          notes = COALESCE($3, notes),
          status = COALESCE($4, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5 AND doctor_id = $6
      RETURNING *
    `, [prescription_date, prescription_text, notes, status, id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prescripción no encontrada o no autorizada' });
    }

    // Obtener la prescripción completa con medicamentos
    const medicationsResult = await pool.query(`
      SELECT 
        pm.*,
        m.name as medication_name,
        m.generic_name,
        m.category
      FROM prescription_medications pm
      JOIN medications m ON pm.medication_id = m.id
      WHERE pm.prescription_id = $1
    `, [id]);

    const prescription = result.rows[0];
    prescription.medications = medicationsResult.rows;

    res.json(prescription);

  } catch (error) {
    console.error('Error actualizando prescripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deletePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Eliminar primero los medicamentos asociados
    await pool.query(
      'DELETE FROM prescription_medications WHERE prescription_id = $1',
      [id]
    );

    // Eliminar la prescripción
    const result = await pool.query(
      'DELETE FROM prescriptions WHERE id = $1 AND doctor_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prescripción no encontrada o no autorizada' });
    }

    res.json({ message: 'Prescripción eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando prescripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPrescriptionsByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const result = await pool.query(`
      SELECT 
        p.*,
        u.name as doctor_name,
        c.name as clinic_name
      FROM prescriptions p
      JOIN users u ON p.doctor_id = u.id
      JOIN clinics c ON p.clinic_id = c.id
      WHERE p.patient_id = $1
      ORDER BY p.created_at DESC
    `, [patientId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo prescripciones del paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionsByPatient
};
