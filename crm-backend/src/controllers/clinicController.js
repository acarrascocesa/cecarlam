// src/controllers/clinicController.js
const pool = require('../config/database');

const getClinics = async (req, res) => {
  try {
    // Siempre filtrar por el usuario logueado
    const userId = req.user.id;
    
    const query = `
      SELECT c.*, u.name as doctor_name 
      FROM clinics c 
      LEFT JOIN users u ON c.doctor_id = u.id
      WHERE c.is_active = true 
      AND c.id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $1)
      ORDER BY c.name
    `;

    const result = await pool.query(query, [userId]);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo clínicas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getClinicById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT c.*, u.name as doctor_name FROM clinics c LEFT JOIN users u ON c.doctor_id = u.id WHERE c.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Clínica no encontrada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error obteniendo clínica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getClinics,
  getClinicById
};