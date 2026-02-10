const pool = require('../config/database');

const configController = {
  // Obtener configuraciones básicas del usuario
  getBasicSettings: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const query = `
        SELECT clinic_name, timezone, language, clinic_id
        FROM system_settings 
        WHERE user_id = $1
        ORDER BY updated_at DESC
        LIMIT 1
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        // Retornar valores por defecto si no hay configuraciones
        return res.json({
          clinicName: "CECARLAM CRM",
          timezone: "America/Santo_Domingo",
          language: "es",
          clinicId: null
        });
      }
      
      const settings = result.rows[0];
      
      res.json({
        clinicName: settings.clinic_name || "CECARLAM CRM",
        timezone: settings.timezone || "America/Santo_Domingo",
        language: settings.language || "es",
        clinicId: settings.clinic_id
      });
      
    } catch (error) {
      console.error('Error al obtener configuraciones básicas:', error);
      res.status(500).json({ 
        message: 'Error al obtener configuraciones', 
        error: error.message 
      });
    }
  },

  // Guardar configuraciones básicas
  saveBasicSettings: async (req, res) => {
    try {
      const userId = req.user.id;
      const { clinicName, timezone, language } = req.body;
      
      // Validaciones básicas
      if (!clinicName || clinicName.trim() === '') {
        return res.status(400).json({ 
          message: 'El nombre de la clínica es obligatorio' 
        });
      }
      
      if (!timezone) {
        return res.status(400).json({ 
          message: 'La zona horaria es obligatoria' 
        });
      }
      
      if (!language) {
        return res.status(400).json({ 
          message: 'El idioma es obligatorio' 
        });
      }
      
      // Verificar si ya existen configuraciones para este usuario
      const existingQuery = `
        SELECT id FROM system_settings WHERE user_id = $1 LIMIT 1
      `;
      const existingResult = await pool.query(existingQuery, [userId]);
      
      let query;
      let values;
      
      if (existingResult.rows.length > 0) {
        // Actualizar configuraciones existentes
        query = `
          UPDATE system_settings 
          SET clinic_name = $2, timezone = $3, language = $4, updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $1
          RETURNING clinic_name, timezone, language, clinic_id
        `;
        values = [userId, clinicName.trim(), timezone, language];
      } else {
        // Crear nuevas configuraciones
        query = `
          INSERT INTO system_settings (user_id, clinic_name, timezone, language)
          VALUES ($1, $2, $3, $4)
          RETURNING clinic_name, timezone, language, clinic_id
        `;
        values = [userId, clinicName.trim(), timezone, language];
      }
      
      const result = await pool.query(query, values);
      const savedSettings = result.rows[0];
      
      res.json({
        message: 'Configuraciones guardadas exitosamente',
        settings: {
          clinicName: savedSettings.clinic_name,
          timezone: savedSettings.timezone,
          language: savedSettings.language,
          clinicId: savedSettings.clinic_id
        }
      });
      
    } catch (error) {
      console.error('Error al guardar configuraciones básicas:', error);
      res.status(500).json({ 
        message: 'Error al guardar configuraciones', 
        error: error.message 
      });
    }
  },

  // Obtener perfil del doctor
  getDoctorProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      
      const query = `
        SELECT name, specialty, license_number
        FROM users 
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Usuario no encontrado' 
        });
      }
      
      const user = result.rows[0];
      
      res.json({
        fullName: user.name || "",
        specialty: user.specialty || "Cardiología",
        licenseNumber: user.license_number || "",
        phone: "", // Este campo se puede agregar a la tabla users si es necesario
        consultationHours: "8:00 AM - 5:00 PM" // Valor por defecto
      });
      
    } catch (error) {
      console.error('Error al obtener perfil del doctor:', error);
      res.status(500).json({ 
        message: 'Error al obtener perfil del doctor', 
        error: error.message 
      });
    }
  },

  // Guardar perfil del doctor
  saveDoctorProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { fullName, specialty, licenseNumber, phone, consultationHours } = req.body;
      
      // Validaciones básicas
      if (!fullName || fullName.trim() === '') {
        return res.status(400).json({ 
          message: 'El nombre completo es obligatorio' 
        });
      }
      
      if (!specialty || specialty.trim() === '') {
        return res.status(400).json({ 
          message: 'La especialidad es obligatoria' 
        });
      }
      
      const query = `
        UPDATE users 
        SET name = $2, specialty = $3, license_number = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING name, specialty, license_number
      `;
      
      const values = [
        userId, 
        fullName.trim(), 
        specialty.trim(), 
        licenseNumber ? licenseNumber.trim() : null
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          message: 'Usuario no encontrado' 
        });
      }
      
      const updatedUser = result.rows[0];
      
      res.json({
        message: 'Perfil actualizado exitosamente',
        profile: {
          fullName: updatedUser.name,
          specialty: updatedUser.specialty,
          licenseNumber: updatedUser.license_number,
          phone: phone || "", // Por ahora mantenemos el valor enviado
          consultationHours: consultationHours || "8:00 AM - 5:00 PM"
        }
      });
      
    } catch (error) {
      console.error('Error al guardar perfil del doctor:', error);
      res.status(500).json({ 
        message: 'Error al guardar perfil del doctor', 
        error: error.message 
      });
    }
  }
};

module.exports = configController;
