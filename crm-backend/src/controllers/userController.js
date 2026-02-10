// src/controllers/userController.js
const pool = require('../config/database');
const { hashPassword } = require('../middleware/auth');

const getUsers = async (req, res) => {
  try {
    const { clinicId } = req.query;
    let query = 'SELECT id, name, email, role, avatar_url, license_number, is_active FROM users';
    let params = [];

    if (clinicId) {
      query += ' WHERE id IN (SELECT user_id FROM user_clinics WHERE clinic_id = $1)';
      params.push(clinicId);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, name, email, role, avatar_url, license_number, is_active FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, avatar_url, license_number } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, role = $3, avatar_url = $4, license_number = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, email, role, avatar_url, license_number, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser
};