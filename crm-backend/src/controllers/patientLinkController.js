// src/controllers/patientLinkController.js
const pool = require('../config/database');

// Buscar paciente por cédula en todas las clínicas del doctor
const findPatientByCedula = async (req, res) => {
  try {
    const { cedula } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM find_patient_by_cedula($1, $2)`,
      [cedula, userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Error buscando paciente por cédula:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Vincular paciente existente a nueva clínica
const linkPatientToClinic = async (req, res) => {
  try {
    const { patientId, clinicId, notes } = req.body;
    const userId = req.user.id;

    // Verificar que el usuario tenga acceso a la clínica destino
    const clinicCheck = await pool.query(
      `SELECT 1 FROM user_clinics WHERE user_id = $1 AND clinic_id = $2`,
      [userId, clinicId]
    );

    if (clinicCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Sin permisos para esta clínica' });
    }

    // Llamar función para vincular
    const result = await pool.query(
      `SELECT link_patient_to_clinic($1, $2, $3, $4) as success`,
      [patientId, clinicId, userId, notes]
    );

    if (result.rows[0].success) {
      res.json({ 
        message: 'Paciente vinculado exitosamente',
        success: true 
      });
    } else {
      res.status(400).json({ 
        error: 'El paciente ya está vinculado a esta clínica' 
      });
    }

  } catch (error) {
    console.error('Error vinculando paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todas las clínicas donde está un paciente
const getPatientClinics = async (req, res) => {
  try {
    const { patientId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        c.id, c.name, pcl.is_primary, pcl.linked_at, pcl.notes
      FROM patient_clinic_links pcl
      JOIN clinics c ON pcl.clinic_id = c.id
      JOIN user_clinics uc ON c.id = uc.clinic_id
      WHERE pcl.patient_id = $1 
        AND uc.user_id = $2 
        AND pcl.status = 'active'
      ORDER BY pcl.is_primary DESC, c.name
    `, [patientId, userId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo clínicas del paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener pacientes vinculados a múltiples clínicas
const getMultiClinicPatients = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT 
        pmcv.*,
        COUNT(pmcv.patient_id) OVER (PARTITION BY pmcv.patient_id) as clinic_count
      FROM patient_multi_clinic_view pmcv
      JOIN user_clinics uc ON pmcv.clinic_id = uc.clinic_id
      WHERE uc.user_id = $1
      ORDER BY pmcv.patient_name, pmcv.is_primary DESC
    `, [userId]);

    // Agrupar por paciente
    const grouped = {};
    result.rows.forEach(row => {
      if (!grouped[row.patient_id]) {
        grouped[row.patient_id] = {
          patient: {
            id: row.patient_id,
            name: row.patient_name,
            email: row.email,
            phone: row.phone,
            cedula: row.cedula,
            dateOfBirth: row.date_of_birth,
            gender: row.gender
          },
          clinics: [],
          isMultiClinic: row.clinic_count > 1
        };
      }
      
      grouped[row.patient_id].clinics.push({
        id: row.clinic_id,
        name: row.clinic_name,
        isPrimary: row.is_primary,
        linkedAt: row.linked_at,
        notes: row.link_notes
      });
    });

    res.json(Object.values(grouped));

  } catch (error) {
    console.error('Error obteniendo pacientes multi-clínica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  findPatientByCedula,
  linkPatientToClinic,
  getPatientClinics,
  getMultiClinicPatients
};
