// src/controllers/medicationController.js
const pool = require('../config/database');

const getMedications = async (req, res) => {
  try {
    const { doctorId, category, search } = req.query;
    let query = `
      SELECT 
        m.*,
        u.name as doctor_name
      FROM medications m
      LEFT JOIN users u ON m.doctor_id = u.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    if (doctorId) {
      paramCount++;
      query += ` AND m.doctor_id = $${paramCount}`;
      params.push(doctorId);
    }

    if (category) {
      paramCount++;
      query += ` AND m.category ILIKE $${paramCount}`;
      params.push(`%${category}%`);
    }

    if (search) {
      paramCount++;
      query += ` AND (m.name ILIKE $${paramCount} OR m.generic_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY m.name ASC';

    const result = await pool.query(query, params);
    
    // Transformar los campos de snake_case a camelCase para el frontend
    const transformedRows = result.rows.map(row => ({
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      genericName: row.generic_name,
      category: row.category,
      dosage: row.dosage,
      frequency: row.frequency,
      typicalDuration: row.typical_duration,
      instructions: row.instructions,
      contraindications: row.contraindications,
      sideEffects: row.side_effects,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      doctorName: row.doctor_name
    }));
    
    res.json(transformedRows);

  } catch (error) {
    console.error('Error obteniendo medicamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMedicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        m.*,
        u.name as doctor_name
      FROM medications m
      LEFT JOIN users u ON m.doctor_id = u.id
      WHERE m.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado' });
    }

    // Transformar los campos de snake_case a camelCase para el frontend
    const row = result.rows[0];
    const transformedRow = {
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      genericName: row.generic_name,
      category: row.category,
      dosage: row.dosage,
      frequency: row.frequency,
      typicalDuration: row.typical_duration,
      instructions: row.instructions,
      contraindications: row.contraindications,
      sideEffects: row.side_effects,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      doctorName: row.doctor_name
    };

    res.json(transformedRow);

  } catch (error) {
    console.error('Error obteniendo medicamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createMedication = async (req, res) => {
  try {
    const {
      name,
      generic_name,
      category,
      dosage,
      frequency,
      typical_duration,
      instructions,
      contraindications,
      side_effects,
      is_active = true
    } = req.body;

    const doctor_id = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'El nombre del medicamento es requerido' });
    }

    const result = await pool.query(`
      INSERT INTO medications (
        doctor_id, name, generic_name, category, dosage, frequency,
        typical_duration, instructions, contraindications, side_effects,
        is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      doctor_id, name, generic_name, category, dosage, frequency,
      typical_duration, instructions, contraindications, side_effects, is_active
    ]);

    // Transformar los campos de snake_case a camelCase para el frontend
    const row = result.rows[0];
    const transformedRow = {
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      genericName: row.generic_name,
      category: row.category,
      dosage: row.dosage,
      frequency: row.frequency,
      typicalDuration: row.typical_duration,
      instructions: row.instructions,
      contraindications: row.contraindications,
      sideEffects: row.side_effects,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.status(201).json(transformedRow);

  } catch (error) {
    console.error('Error creando medicamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      generic_name,
      category,
      dosage,
      frequency,
      typical_duration,
      instructions,
      contraindications,
      side_effects,
      is_active
    } = req.body;

    const result = await pool.query(`
      UPDATE medications 
      SET name = COALESCE($1, name),
          generic_name = COALESCE($2, generic_name),
          category = COALESCE($3, category),
          dosage = COALESCE($4, dosage),
          frequency = COALESCE($5, frequency),
          typical_duration = COALESCE($6, typical_duration),
          instructions = COALESCE($7, instructions),
          contraindications = COALESCE($8, contraindications),
          side_effects = COALESCE($9, side_effects),
          is_active = COALESCE($10, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11 AND doctor_id = $12
      RETURNING *
    `, [
      name, generic_name, category, dosage, frequency, typical_duration,
      instructions, contraindications, side_effects, is_active, id, req.user.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado o no autorizado' });
    }

    // Transformar los campos de snake_case a camelCase para el frontend
    const row = result.rows[0];
    const transformedRow = {
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      genericName: row.generic_name,
      category: row.category,
      dosage: row.dosage,
      frequency: row.frequency,
      typicalDuration: row.typical_duration,
      instructions: row.instructions,
      contraindications: row.contraindications,
      sideEffects: row.side_effects,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json(transformedRow);

  } catch (error) {
    console.error('Error actualizando medicamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si el medicamento está en uso en prescripciones
    const prescriptionCheck = await pool.query(
      'SELECT id FROM prescription_medications WHERE medication_id = $1 LIMIT 1',
      [id]
    );

    if (prescriptionCheck.rows.length > 0) {
      // En lugar de eliminar, desactivar el medicamento
      const result = await pool.query(
        'UPDATE medications SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND doctor_id = $2 RETURNING *',
        [id, req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Medicamento no encontrado o no autorizado' });
      }

      // Transformar los campos de snake_case a camelCase para el frontend
      const row = result.rows[0];
      const transformedRow = {
        id: row.id,
        doctorId: row.doctor_id,
        name: row.name,
        genericName: row.generic_name,
        category: row.category,
        dosage: row.dosage,
        frequency: row.frequency,
        typicalDuration: row.typical_duration,
        instructions: row.instructions,
        contraindications: row.contraindications,
        sideEffects: row.side_effects,
        isActive: row.is_active,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };

      return res.json({ 
        message: 'Medicamento desactivado (está en uso en prescripciones)',
        medication: transformedRow
      });
    }

    // Si no está en uso, eliminar completamente
    const result = await pool.query(
      'DELETE FROM medications WHERE id = $1 AND doctor_id = $2 RETURNING *',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Medicamento no encontrado o no autorizado' });
    }

    res.json({ message: 'Medicamento eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando medicamento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMedicationsByCategory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*) as count
      FROM medications 
      WHERE is_active = true
      GROUP BY category
      ORDER BY category
    `);

    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo categorías de medicamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const searchMedications = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term || term.length < 2) {
      return res.status(400).json({ error: 'El término de búsqueda debe tener al menos 2 caracteres' });
    }

    const result = await pool.query(`
      SELECT id, name, generic_name, category, dosage, frequency
      FROM medications 
      WHERE is_active = true 
      AND (name ILIKE $1 OR generic_name ILIKE $1 OR category ILIKE $1)
      ORDER BY 
        CASE 
          WHEN name ILIKE $2 THEN 1
          WHEN generic_name ILIKE $2 THEN 2
          ELSE 3
        END,
        name ASC
      LIMIT 20
    `, [`%${term}%`, `${term}%`]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error buscando medicamentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  getMedicationsByCategory,
  searchMedications
};
