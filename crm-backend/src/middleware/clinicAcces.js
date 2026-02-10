// src/middleware/clinicAcces.js
const pool = require('../config/database');

const requireClinicAccess = (req, res, next) => {
  const { clinicId } = req.params;
  if (!clinicId) {
    return res.status(400).json({ error: 'ID de clínica requerido' });
  }

  const userId = req.user.id;
  pool.query('SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2', [userId, clinicId])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes acceso a esta clínica' });
      }

      // Adicionalmente, puedes pasar el rol al request si es necesario
      req.userRoleInClinic = result.rows[0].role;
      next();
    })
    .catch(error => {
      console.error('Error verificando acceso a clínica:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    });
};

const filterByClinic = (req, res, next) => {
  const { clinicId } = req.query;
  if (!clinicId) {
    return res.status(400).json({ error: 'ID de clínica requerido' });
  }

  const userId = req.user.id;
  pool.query('SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2', [userId, clinicId])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes acceso a esta clínica' });
      }
      next();
    })
    .catch(error => {
      console.error('Error filtrando por clínica:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    });
};

const getUserClinics = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`
      SELECT c.*
      FROM clinics c
      JOIN user_clinics uc ON c.id = uc.clinic_id
      WHERE uc.user_id = $1
      ORDER BY c.name
    `, [userId]);

    req.userClinics = result.rows;
    next();

  } catch (error) {
    console.error('Error obteniendo clínicas del usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const requireClinicRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const { clinicId } = req.params || req.body;
      const userId = req.user.id;

      if (!clinicId) {
        return res.status(400).json({ error: 'ID de clínica requerido' });
      }

      const result = await pool.query(
        'SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
        [userId, clinicId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes acceso a esta clínica' });
      }

      const userRole = result.rows[0].role;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: `Acceso denegado. Rol requerido: ${allowedRoles.join(' o ')}` 
        });
      }

      req.userRoleInClinic = userRole;
      next();

    } catch (error) {
      console.error('Error verificando rol en clínica:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
};

module.exports = {
  requireClinicAccess,
  filterByClinic,
  getUserClinics,
  requireClinicRole
};
