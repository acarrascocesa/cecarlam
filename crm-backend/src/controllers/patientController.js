const pool = require('../config/database');


const convertToCamelCase = (obj) => {
  const camelCaseObj = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
    camelCaseObj[camelKey] = obj[key];
  }
  return camelCaseObj;
};

const getPatients = async (req, res) => {
  try {
    const { clinicId } = req.query;
    
    let query = `
      SELECT p.*, c.name as clinic_name
      FROM patients p
      JOIN clinics c ON p.clinic_id = c.id
    `;
    let params = [];
    
    if (clinicId) {
      // Si viene un clinicId específico en el query, usarlo
      query += ' WHERE p.clinic_id = $1 ORDER BY p.created_at DESC';
      params = [clinicId];
    } else {
      // Obtener las clínicas asignadas al usuario
      const userId = req.user.id;
      
      const userClinicsResult = await pool.query(`
        SELECT clinic_id FROM user_clinics WHERE user_id = $1
      `, [userId]);
      
      if (userClinicsResult.rows.length === 0) {
        return res.json([]);
      }
      
      const clinicIds = userClinicsResult.rows.map(row => row.clinic_id);
      const placeholders = clinicIds.map((_, index) => `$${index + 1}`).join(',');
      query += ` WHERE p.clinic_id IN (${placeholders}) ORDER BY p.created_at DESC`;
      params = clinicIds;
    }

    const result = await pool.query(query, params);
    
    // Convertir a camelCase
    const patients = result.rows.map(convertToCamelCase);
    
    res.json(patients);
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT p.*, c.name as clinic_name
      FROM patients p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE p.id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    const patient = convertToCamelCase(result.rows[0]);
    res.json(patient);
  } catch (error) {
    console.error('Error obteniendo paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createPatient = async (req, res) => {
  try {
    const {
      clinicId,
      name,
      email,
      phone,
      cedula,
      dateOfBirth,
      gender,
      address,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      insuranceProvider,
      insuranceNumber,
      bloodType,
      allergies,
      chronicConditions,
      status
    } = req.body;

    // Validaciones de campos obligatorios: nombre, teléfono, fecha de nacimiento
    const errors = [];
    if (!name || !name.trim()) {
      errors.push("El nombre es obligatorio");
    }
    if (!phone || !phone.trim()) {
      errors.push("El teléfono es obligatorio");
    }
    if (!dateOfBirth) {
      errors.push("La fecha de nacimiento es obligatoria");
    }
    if (!clinicId) {
      errors.push("La clínica es obligatoria");
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    // Normalizar insuranceProvider - mantener "SIN SEGURO" como string
    const normalizedInsuranceProvider = insuranceProvider || null;

    const result = await pool.query(
      `INSERT INTO patients (
        clinic_id, name, email, phone, cedula, date_of_birth, gender, address,
        emergency_contact_name, emergency_contact_phone, emergency_contact_relationship,
        insurance_provider, insurance_number, blood_type, allergies, chronic_conditions, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        clinicId, name, email, phone, cedula, dateOfBirth, gender || null, address,
        emergencyContactName, emergencyContactPhone, emergencyContactRelationship,
        normalizedInsuranceProvider, insuranceNumber, bloodType, allergies, chronicConditions, status || 'Activo'
      ]
    );

    // Obtener el paciente recién creado con el nombre de la clínica
    const patientResult = await pool.query(`
      SELECT p.*, c.name as clinic_name
      FROM patients p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE p.id = $1
    `, [result.rows[0].id]);

    const patient = convertToCamelCase(patientResult.rows[0]);
    res.status(201).json(patient);
  } catch (error) {
    console.error('Error creando paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    
    // Filtrar campos vacíos o undefined para evitar actualizar con valores no deseados
    const filteredFields = {};
    for (const [key, value] of Object.entries(updateFields)) {
      // Solo incluir campos que no sean undefined y no sean strings vacíos, excepto para campos que pueden ser null
      if (value !== undefined) {
        if (key === 'gender' && value === '') {
          filteredFields[key] = null;
        } else if (value !== '' || key === 'gender') {
          filteredFields[key] = value;
        }
      }
    }
    
    // Si no hay campos para actualizar, devolver error
    if (Object.keys(filteredFields).length === 0) {
      return res.status(400).json({ error: 'No hay campos válidos para actualizar' });
    }
    
    // Validaciones de campos obligatorios si están siendo actualizados
    const errors = [];
    if (filteredFields.name !== undefined && (!filteredFields.name || !filteredFields.name.trim())) {
      errors.push("El nombre es obligatorio");
    }
    if (filteredFields.phone !== undefined && (!filteredFields.phone || !filteredFields.phone.trim())) {
      errors.push("El teléfono es obligatorio");
    }
    if (filteredFields.dateOfBirth !== undefined && !filteredFields.dateOfBirth) {
      errors.push("La fecha de nacimiento es obligatoria");
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }
    
    // Construir la consulta UPDATE dinámicamente
    const fields = Object.keys(filteredFields);
    const setClause = fields
      .map((key, index) => {
        // Convertir camelCase a snake_case para las columnas de la base de datos
        const dbColumn = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        return `${dbColumn} = $${index + 1}`;
      })
      .join(', ');
    
    const values = Object.values(filteredFields);
    
    const result = await pool.query(
      `UPDATE patients SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }

    // Obtener el paciente actualizado con el nombre de la clínica
    const patientResult = await pool.query(`
      SELECT p.*, c.name as clinic_name
      FROM patients p
      JOIN clinics c ON p.clinic_id = c.id
      WHERE p.id = $1
    `, [id]);

    const patient = convertToCamelCase(patientResult.rows[0]);
    res.json(patient);

  } catch (error) {
    console.error('Error actualizando paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente no encontrado' });
    }
    
    res.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando paciente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};
