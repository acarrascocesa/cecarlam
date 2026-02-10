// src/controllers/authController.js
const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const { verifyPassword, hashPassword } = require('../middleware/auth');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const isValidPassword = await verifyPassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        multiClinicView: user.multi_clinic_view
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url,
        licenseNumber: user.license_number,
        multiClinicView: user.multi_clinic_view
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const verifyToken = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, role, avatar_url, license_number, multi_clinic_view FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url,
        licenseNumber: user.license_number,
        multiClinicView: user.multi_clinic_view
      }
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validaciones básicas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'La contraseña actual y nueva son obligatorias' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 8 caracteres' 
      });
    }

    // Verificar que la contraseña actual sea correcta
    const userResult = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const user = userResult.rows[0];
    const isValidCurrentPassword = await verifyPassword(currentPassword, user.password_hash);

    if (!isValidCurrentPassword) {
      return res.status(400).json({ 
        error: 'La contraseña actual es incorrecta' 
      });
    }

    // Verificar que la nueva contraseña sea diferente a la actual
    const isSamePassword = await verifyPassword(newPassword, user.password_hash);
    if (isSamePassword) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe ser diferente a la actual' 
      });
    }

    // Encriptar la nueva contraseña
    const hashedNewPassword = await hashPassword(newPassword);

    // Actualizar la contraseña en la base de datos
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedNewPassword, userId]
    );

    res.json({ 
      message: 'Contraseña cambiada exitosamente' 
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor al cambiar la contraseña' 
    });
  }
};

module.exports = {
  login,
  verifyToken,
  changePassword
};
