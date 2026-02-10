// src/controllers/analyticsController.js
const pool = require('../config/database');

const getAnalytics = async (req, res) => {
  try {
    const { doctorId, category, search } = req.query;
    let query = `
      SELECT 
        a.*,
        u.name as doctor_name
      FROM analytics a
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    if (doctorId) {
      paramCount++;
      query += ` AND a.doctor_id = $${paramCount}`;
      params.push(doctorId);
    }

    if (category) {
      paramCount++;
      query += ` AND a.category ILIKE $${paramCount}`;
      params.push(`%${category}%`);
    }

    if (search) {
      paramCount++;
      query += ` AND (a.name ILIKE $${paramCount} OR a.generic_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ' ORDER BY a.name ASC';

    const result = await pool.query(query, params);
    
    // Transformar los campos de snake_case a camelCase para el frontend
    const transformedRows = result.rows.map(row => ({
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      genericName: row.generic_name,
      category: row.category,
      description: row.description,
      instructions: row.instructions,
      preparation: row.preparation,
      contraindications: row.contraindications,
      notes: row.notes,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      doctorName: row.doctor_name
    }));
    
    res.json(transformedRows);

  } catch (error) {
    console.error('Error obteniendo analíticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAnalyticById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        a.*,
        u.name as doctor_name
      FROM analytics a
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analítica no encontrada' });
    }

    // Transformar los campos de snake_case a camelCase para el frontend
    const row = result.rows[0];
    const transformedRow = {
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      genericName: row.generic_name,
      category: row.category,
      description: row.description,
      instructions: row.instructions,
      preparation: row.preparation,
      contraindications: row.contraindications,
      notes: row.notes,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      doctorName: row.doctor_name
    };

    res.json(transformedRow);

  } catch (error) {
    console.error('Error obteniendo analítica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createAnalytic = async (req, res) => {
  try {
    const {
      name,
      generic_name,
      category,
      description,
      instructions,
      preparation,
      contraindications,
      notes,
      is_active = true
    } = req.body;

    const doctor_id = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'El nombre de la analítica es requerido' });
    }

    const result = await pool.query(`
      INSERT INTO analytics (
        doctor_id, name, generic_name, category, description, instructions,
        preparation, contraindications, notes, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      doctor_id, name, generic_name, category, description, instructions,
      preparation, contraindications, notes, is_active
    ]);

    // Transformar los campos de snake_case a camelCase para el frontend
    const row = result.rows[0];
    const transformedRow = {
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      genericName: row.generic_name,
      category: row.category,
      description: row.description,
      instructions: row.instructions,
      preparation: row.preparation,
      contraindications: row.contraindications,
      notes: row.notes,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.status(201).json(transformedRow);

  } catch (error) {
    console.error('Error creando analítica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateAnalytic = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      generic_name,
      category,
      description,
      instructions,
      preparation,
      contraindications,
      notes,
      is_active
    } = req.body;

    const result = await pool.query(`
      UPDATE analytics 
      SET name = COALESCE($1, name),
          generic_name = COALESCE($2, generic_name),
          category = COALESCE($3, category),
          description = COALESCE($4, description),
          instructions = COALESCE($5, instructions),
          preparation = COALESCE($6, preparation),
          contraindications = COALESCE($7, contraindications),
          notes = COALESCE($8, notes),
          is_active = COALESCE($9, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $10 AND doctor_id = $11
      RETURNING *
    `, [
      name, generic_name, category, description, instructions,
      preparation, contraindications, notes, is_active, id, req.user.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analítica no encontrada o no tienes permisos para editarla' });
    }

    // Transformar los campos de snake_case a camelCase para el frontend
    const row = result.rows[0];
    const transformedRow = {
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      genericName: row.generic_name,
      category: row.category,
      description: row.description,
      instructions: row.instructions,
      preparation: row.preparation,
      contraindications: row.contraindications,
      notes: row.notes,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json(transformedRow);

  } catch (error) {
    console.error('Error actualizando analítica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteAnalytic = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      DELETE FROM analytics 
      WHERE id = $1 AND doctor_id = $2
      RETURNING id
    `, [id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Analítica no encontrada o no tienes permisos para eliminarla' });
    }

    res.json({ message: 'Analítica eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando analítica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAnalyticsByCategory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT category 
      FROM analytics 
      WHERE is_active = true 
      ORDER BY category ASC
    `);

    const categories = result.rows.map(row => row.category);
    res.json(categories);

  } catch (error) {
    console.error('Error obteniendo categorías de analíticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const searchAnalytics = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Término de búsqueda requerido' });
    }

    const result = await pool.query(`
      SELECT 
        a.*,
        u.name as doctor_name
      FROM analytics a
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.is_active = true 
        AND (a.name ILIKE $1 OR a.generic_name ILIKE $1 OR a.category ILIKE $1)
      ORDER BY a.name ASC
      LIMIT 20
    `, [`%${q}%`]);

    // Transformar los campos de snake_case a camelCase para el frontend
    const transformedRows = result.rows.map(row => ({
      id: row.id,
      doctorId: row.doctor_id,
      name: row.name,
      genericName: row.generic_name,
      category: row.category,
      description: row.description,
      instructions: row.instructions,
      preparation: row.preparation,
      contraindications: row.contraindications,
      notes: row.notes,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      doctorName: row.doctor_name
    }));

    res.json(transformedRows);

  } catch (error) {
    console.error('Error buscando analíticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAnalytics,
  getAnalyticById,
  createAnalytic,
  updateAnalytic,
  deleteAnalytic,
  getAnalyticsByCategory,
  searchAnalytics
};
