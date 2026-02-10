// src/controllers/prescriptionMedicationController.js
const pool = require('../config/database');

const getPrescriptionMedications = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
    const result = await pool.query(`
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
    `, [prescriptionId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo medicamentos de prescripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const addMedicationToPrescription = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const {
      medication_id,
      dosage,
      frequency,
      duration,
      instructions
    } = req.body;

    if (!medication_id || !dosage || !frequency) {
      return res.status(400).json({ 
        error: 'medication_id, dosage y frequency son requeridos' 
      });
    }

    // Verificar que la prescripción existe y pertenece al doctor
    const prescriptionCheck = await pool.query(
      'SELECT * FROM prescriptions WHERE id = $1 AND doctor_id = $2',
      [prescriptionId, req.user.id]
    );

    if (prescriptionCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Prescripción no encontrada o no autorizada' 
      });
    }

    // Verificar que el medicamento existe y está activo
    const medicationCheck = await pool.query(
      'SELECT * FROM medications WHERE id = $1 AND is_active = true',
      [medication_id]
    );

    if (medicationCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Medicamento no encontrado o inactivo' 
      });
    }

    // Verificar que no esté ya agregado a esta prescripción
    const existingCheck = await pool.query(
      'SELECT id FROM prescription_medications WHERE prescription_id = $1 AND medication_id = $2',
      [prescriptionId, medication_id]
    );

    if (existingCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Este medicamento ya está agregado a la prescripción' 
      });
    }

    const result = await pool.query(`
      INSERT INTO prescription_medications (
        prescription_id, medication_id, dosage, frequency, duration, instructions, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING *
    `, [prescriptionId, medication_id, dosage, frequency, duration, instructions]);

    // Obtener el medicamento completo para la respuesta
    const medicationResult = await pool.query(`
      SELECT 
        pm.*,
        m.name as medication_name,
        m.generic_name,
        m.category
      FROM prescription_medications pm
      JOIN medications m ON pm.medication_id = m.id
      WHERE pm.id = $1
    `, [result.rows[0].id]);

    res.status(201).json(medicationResult.rows[0]);

  } catch (error) {
    console.error('Error agregando medicamento a prescripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updatePrescriptionMedication = async (req, res) => {
  try {
    const { prescriptionId, medicationId } = req.params;
    const {
      dosage,
      frequency,
      duration,
      instructions
    } = req.body;

    // Verificar que la prescripción pertenece al doctor
    const prescriptionCheck = await pool.query(
      'SELECT * FROM prescriptions WHERE id = $1 AND doctor_id = $2',
      [prescriptionId, req.user.id]
    );

    if (prescriptionCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Prescripción no encontrada o no autorizada' 
      });
    }

    const result = await pool.query(`
      UPDATE prescription_medications 
      SET dosage = COALESCE($1, dosage),
          frequency = COALESCE($2, frequency),
          duration = COALESCE($3, duration),
          instructions = COALESCE($4, instructions)
      WHERE prescription_id = $5 AND medication_id = $6
      RETURNING *
    `, [dosage, frequency, duration, instructions, prescriptionId, medicationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Medicamento no encontrado en esta prescripción' 
      });
    }

    // Obtener el medicamento completo para la respuesta
    const medicationResult = await pool.query(`
      SELECT 
        pm.*,
        m.name as medication_name,
        m.generic_name,
        m.category
      FROM prescription_medications pm
      JOIN medications m ON pm.medication_id = m.id
      WHERE pm.prescription_id = $1 AND pm.medication_id = $2
    `, [prescriptionId, medicationId]);

    res.json(medicationResult.rows[0]);

  } catch (error) {
    console.error('Error actualizando medicamento de prescripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const removeMedicationFromPrescription = async (req, res) => {
  try {
    const { prescriptionId, medicationId } = req.params;

    // Verificar que la prescripción pertenece al doctor
    const prescriptionCheck = await pool.query(
      'SELECT * FROM prescriptions WHERE id = $1 AND doctor_id = $2',
      [prescriptionId, req.user.id]
    );

    if (prescriptionCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Prescripción no encontrada o no autorizada' 
      });
    }

    const result = await pool.query(
      'DELETE FROM prescription_medications WHERE prescription_id = $1 AND medication_id = $2 RETURNING *',
      [prescriptionId, medicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Medicamento no encontrado en esta prescripción' 
      });
    }

    res.json({ message: 'Medicamento removido de la prescripción exitosamente' });

  } catch (error) {
    console.error('Error removiendo medicamento de prescripción:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPrescriptionWithMedications = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    
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
    `, [prescriptionId]);

    if (prescriptionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Prescripción no encontrada' });
    }

    // Obtener los medicamentos de la prescripción
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
    `, [prescriptionId]);

    const prescription = prescriptionResult.rows[0];
    prescription.medications = medicationsResult.rows;

    res.json(prescription);

  } catch (error) {
    console.error('Error obteniendo prescripción con medicamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getPrescriptionMedications,
  addMedicationToPrescription,
  updatePrescriptionMedication,
  removeMedicationFromPrescription,
  getPrescriptionWithMedications
};
