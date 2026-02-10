// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // Los admins tienen acceso a todo
    if (req.user.role === 'admin' || roles.includes(req.user.role)) {
      return next();
    }
    
    return res.status(403).json({ error: 'Acceso denegado' });
  };
};

const requireClinicRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    // Los admins globales tienen acceso a todo
    if (req.user.role === 'admin') {
      return next();
    }
    
    const clinicId = req.params.clinicId;
    if (!clinicId) {
      return res.status(400).json({ error: 'ID de clínica requerido' });
    }
    
    try {
      const pool = require('../config/database');
      const result = await pool.query(
        'SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
        [req.user.id, clinicId]
      );
      
      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes acceso a esta clínica' });
      }
      
      const userClinicRole = result.rows[0].role;
      if (!roles.includes(userClinicRole)) {
        return res.status(403).json({ error: 'Acceso denegado' });
      }
      
      next();
    } catch (error) {
      console.error('Error verificando rol de clínica:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
};

const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  authenticateToken,
  requireRole,
  requireClinicRole,
  hashPassword,
  verifyPassword
};