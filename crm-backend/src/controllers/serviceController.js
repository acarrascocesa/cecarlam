// src/controllers/serviceController.js
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

const getServices = async (req, res) => {
  try {
    const { clinicId, category, insuranceType, specialty } = req.query;
    let query = 'SELECT ms.*, c.name as clinic_name FROM medical_services ms LEFT JOIN clinics c ON ms.clinic_id = c.id WHERE ms.is_active = true';
    let params = [];
    let paramCount = 0;

    if (clinicId) {
      paramCount++;
      query += ` AND ms.clinic_id = $${paramCount}`;
      params.push(clinicId);
    }

    if (category) {
      paramCount++;
      query += ` AND ms.category = $${paramCount}`;
      params.push(category);
    }

    if (insuranceType) {
      paramCount++;
      query += ` AND ms.insurance_type = $${paramCount}`;
      params.push(insuranceType);
    }

    if (specialty) {
      paramCount++;
      query += ` AND ms.specialty = $${paramCount}`;
      params.push(specialty);
    }

    query += ' ORDER BY ms.name';

    const result = await pool.query(query, params);
    
    // Convertir los resultados a camelCase
    const services = result.rows.map(convertToCamelCase);
    res.json(services);

  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Nuevo endpoint para obtener servicios filtrados por especialidad del doctor
const getServicesByDoctorSpecialty = async (req, res) => {
  try {
    const { clinicId, insuranceType } = req.query;
    const userId = req.user.userId || req.user.id; // ID del doctor logueado
    
    // Obtener la especialidad del doctor
    const userResult = await pool.query('SELECT specialty FROM users WHERE id = $1', [userId]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    const userSpecialty = userResult.rows[0].specialty;
    
    if (!userSpecialty) {
      return res.status(400).json({ error: 'Doctor no tiene especialidad asignada' });
    }

    let query = 'SELECT ms.*, c.name as clinic_name FROM medical_services ms LEFT JOIN clinics c ON ms.clinic_id = c.id WHERE ms.is_active = true AND ms.specialty = $1';
    let params = [userSpecialty];
    let paramCount = 1;

    if (clinicId) {
      paramCount++;
      query += ` AND ms.clinic_id = $${paramCount}`;
      params.push(clinicId);
    }

    if (insuranceType) {
      paramCount++;
      query += ` AND ms.insurance_type = $${paramCount}`;
      params.push(insuranceType);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    
    // Convertir los resultados a camelCase
    const services = result.rows.map(convertToCamelCase);
    res.json(services);

  } catch (error) {
    console.error('Error obteniendo servicios por especialidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createService = async (req, res) => {
  try {
    const {
      clinicId,
      name,
      category,
      description,
      basePrice,
      insuranceCoveragePercentage,
      insuranceType,
      specialty,
      isActive
    } = req.body;

    const result = await pool.query(
      `INSERT INTO medical_services (
        clinic_id, name, category, description, base_price,
        insurance_coverage_percentage, insurance_type, specialty, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        clinicId, name, category, description, basePrice,
        insuranceCoveragePercentage, insuranceType, specialty, isActive !== false
      ]
    );

    const service = convertToCamelCase(result.rows[0]);
    res.status(201).json(service);

  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    
    // Convertir camelCase a snake_case para la consulta SQL
    const snakeCaseFields = {};
    for (const [key, value] of Object.entries(updateFields)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      snakeCaseFields[snakeKey] = value;
    }
    
    const setClause = Object.keys(snakeCaseFields)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    
    const values = [id, ...Object.values(snakeCaseFields)];

    const result = await pool.query(
      `UPDATE medical_services SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    const service = convertToCamelCase(result.rows[0]);
    res.json(service);

  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM medical_services WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }

    res.json({ message: 'Servicio eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getServices,
  getServicesByDoctorSpecialty,
  createService,
  updateService,
  deleteService
};
