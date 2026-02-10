// src/controllers/userClinicController.js
const pool = require('../config/database');

const getCurrentUserClinics = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT 
        uc.id,
        uc.user_id,
        uc.clinic_id,
        uc.role,
        uc.created_at,
        c.name as clinic_name,
        c.address as clinic_address,
        c.phone as clinic_phone,
        c.email as clinic_email,
        c.is_active as clinic_is_active,
        u.name as doctor_name
      FROM user_clinics uc
      JOIN clinics c ON uc.clinic_id = c.id
      LEFT JOIN users u ON c.doctor_id = u.id
      WHERE uc.user_id = $1
      ORDER BY c.name
    `, [userId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo clínicas del usuario actual:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getUserClinicsList = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT 
        uc.id,
        uc.user_id,
        uc.clinic_id,
        uc.role,
        uc.created_at,
        c.name as clinic_name,
        c.address as clinic_address,
        c.phone as clinic_phone,
        c.email as clinic_email,
        c.is_active as clinic_is_active
      FROM user_clinics uc
      JOIN clinics c ON uc.clinic_id = c.id
      WHERE uc.user_id = $1
      ORDER BY c.name
    `, [userId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo clínicas del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getClinicUsers = async (req, res) => {
  try {
    const { clinicId } = req.params;
    
    // Verificar que el usuario tiene acceso a esta clínica
    const accessCheck = await pool.query(
      'SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
      [req.user.id, clinicId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'No tienes acceso a esta clínica' });
    }

    const result = await pool.query(`
      SELECT 
        uc.id,
        uc.user_id,
        uc.clinic_id,
        uc.role,
        uc.created_at,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role,
        u.license_number,
        u.is_active as user_is_active
      FROM user_clinics uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.clinic_id = $1
      ORDER BY uc.role DESC, u.name
    `, [clinicId]);

    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo usuarios de la clínica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const assignUserToClinic = async (req, res) => {
  try {
    const { userId, clinicId, role } = req.body;

    if (!userId || !clinicId) {
      return res.status(400).json({ error: 'userId y clinicId son requeridos' });
    }

    // Verificar permisos del usuario que hace la asignación
    const currentUserRole = await pool.query(
      'SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
      [req.user.id, clinicId]
    );

    if (currentUserRole.rows.length === 0 || !['owner', 'admin'].includes(currentUserRole.rows[0].role)) {
      return res.status(403).json({ error: 'No tienes permisos para asignar usuarios a esta clínica' });
    }

    // Verificar que el usuario y la clínica existan
    const userCheck = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const clinicCheck = await pool.query('SELECT * FROM clinics WHERE id = $1', [clinicId]);

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (clinicCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Clínica no encontrada' });
    }

    // Verificar que la relación no exista ya
    const existingRelation = await pool.query(
      'SELECT * FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
      [userId, clinicId]
    );

    if (existingRelation.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario ya está asignado a esta clínica' });
    }

    // Insertar relación
    const result = await pool.query(`
      INSERT INTO user_clinics (user_id, clinic_id, role, created_at) 
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
    `, [userId, clinicId, role || 'staff']);

    // Obtener información completa para la respuesta
    const completeResult = await pool.query(`
      SELECT 
        uc.id,
        uc.user_id,
        uc.clinic_id,
        uc.role,
        uc.created_at,
        u.name as user_name,
        u.email as user_email,
        c.name as clinic_name
      FROM user_clinics uc
      JOIN users u ON uc.user_id = u.id
      JOIN clinics c ON uc.clinic_id = c.id
      WHERE uc.id = $1
    `, [result.rows[0].id]);

    res.status(201).json(completeResult.rows[0]);

  } catch (error) {
    console.error('Error asignando usuario a clínica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateUserClinicRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['owner', 'staff', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rol inválido. Valores permitidos: owner, staff, admin' });
    }

    // Verificar que la relación existe y obtener información
    const relationCheck = await pool.query(
      'SELECT * FROM user_clinics WHERE id = $1',
      [id]
    );

    if (relationCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Relación usuario-clínica no encontrada' });
    }

    const relation = relationCheck.rows[0];

    // Verificar permisos del usuario que hace el cambio
    const currentUserRole = await pool.query(
      'SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
      [req.user.id, relation.clinic_id]
    );

    if (currentUserRole.rows.length === 0 || !['owner', 'admin'].includes(currentUserRole.rows[0].role)) {
      return res.status(403).json({ error: 'No tienes permisos para cambiar roles en esta clínica' });
    }

    const result = await pool.query(`
      UPDATE user_clinics 
      SET role = $1 
      WHERE id = $2
      RETURNING *
    `, [role, id]);

    // Obtener información completa para la respuesta
    const completeResult = await pool.query(`
      SELECT 
        uc.id,
        uc.user_id,
        uc.clinic_id,
        uc.role,
        uc.created_at,
        u.name as user_name,
        u.email as user_email,
        c.name as clinic_name
      FROM user_clinics uc
      JOIN users u ON uc.user_id = u.id
      JOIN clinics c ON uc.clinic_id = c.id
      WHERE uc.id = $1
    `, [id]);

    res.json(completeResult.rows[0]);

  } catch (error) {
    console.error('Error actualizando rol de usuario en clínica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const removeUserFromClinic = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la relación existe y obtener información
    const relationCheck = await pool.query(
      'SELECT * FROM user_clinics WHERE id = $1',
      [id]
    );

    if (relationCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Relación usuario-clínica no encontrada' });
    }

    const relation = relationCheck.rows[0];

    // Verificar permisos del usuario que hace la remoción
    const currentUserRole = await pool.query(
      'SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
      [req.user.id, relation.clinic_id]
    );

    if (currentUserRole.rows.length === 0 || !['owner', 'admin'].includes(currentUserRole.rows[0].role)) {
      return res.status(403).json({ error: 'No tienes permisos para remover usuarios de esta clínica' });
    }

    // No permitir que el usuario se remueva a sí mismo si es el único owner
    if (relation.user_id === req.user.id && relation.role === 'owner') {
      const ownerCount = await pool.query(
        'SELECT COUNT(*) FROM user_clinics WHERE clinic_id = $1 AND role = $2',
        [relation.clinic_id, 'owner']
      );

      if (ownerCount.rows[0].count === '1') {
        return res.status(400).json({ 
          error: 'No puedes removerte como el único propietario de la clínica' 
        });
      }
    }

    const result = await pool.query('DELETE FROM user_clinics WHERE id = $1 RETURNING *', [id]);

    res.json({ 
      message: 'Usuario removido de la clínica exitosamente',
      removed_relation: result.rows[0]
    });

  } catch (error) {
    console.error('Error removiendo usuario de clínica:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAvailableUsers = async (req, res) => {
  try {
    const { clinicId } = req.query;

    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.license_number,
        CASE 
          WHEN uc.user_id IS NOT NULL THEN true 
          ELSE false 
        END as is_assigned
      FROM users u
      LEFT JOIN user_clinics uc ON u.id = uc.user_id AND uc.clinic_id = $1
      WHERE u.is_active = true
      ORDER BY u.name
    `;

    const result = await pool.query(query, [clinicId]);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo usuarios disponibles:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getCurrentUserClinics,
  getUserClinicsList,
  getClinicUsers,
  assignUserToClinic,
  updateUserClinicRole,
  removeUserFromClinic,
  getAvailableUsers
};
