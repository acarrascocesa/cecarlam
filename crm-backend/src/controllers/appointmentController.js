// src/controllers/appointmentController.js
const pool = require('../config/database');

const getAppointments = async (req, res) => {
  try {
    const { clinicId, patientId, doctorId, date, status } = req.query;
    let query = `
      SELECT 
        a.*,
        u.name as doctor_name,
        pat.name as patient_name,
        c.name as clinic_name
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN patients pat ON a.patient_id = pat.id
      JOIN clinics c ON a.clinic_id = c.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    if (clinicId) {
      paramCount++;
      query += ` AND a.clinic_id = $${paramCount}`;
      params.push(clinicId);
    } else {
      // Si no viene clinicId específico, filtrar por las clínicas del usuario
      const userId = req.user.id;
      
      const userClinicsResult = await pool.query(`
        SELECT clinic_id FROM user_clinics WHERE user_id = $1
      `, [userId]);
      
      if (userClinicsResult.rows.length === 0) {
        return res.json([]);
      }
      
      const clinicIds = userClinicsResult.rows.map(row => row.clinic_id);
      const placeholders = clinicIds.map((_, index) => `$${paramCount + index + 1}`).join(',');
      query += ` AND a.clinic_id IN (${placeholders})`;
      params.push(...clinicIds);
      paramCount += clinicIds.length;
    }

    if (patientId) {
      paramCount++;
      query += ` AND a.patient_id = $${paramCount}`;
      params.push(patientId);
    }

    if (doctorId) {
      paramCount++;
      query += ` AND a.doctor_id = $${paramCount}`;
      params.push(doctorId);
    }

    if (date) {
      paramCount++;
      query += ` AND DATE(a.appointment_date) = $${paramCount}`;
      params.push(date);
    }

    if (status) {
      paramCount++;
      query += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY a.appointment_date ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo citas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        a.*,
        u.name as doctor_name,
        pat.name as patient_name,
        c.name as clinic_name
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN patients pat ON a.patient_id = pat.id
      JOIN clinics c ON a.clinic_id = c.id
      WHERE a.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error obteniendo cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createAppointment = async (req, res) => {
  console.log("DEBUG - req.body:", JSON.stringify(req.body, null, 2));
  try {
    const {
      patient_id,
      clinic_id,
      appointment_date,
      appointment_time,
      reason,
      appointment_type,
      notes,
      status = 'scheduled',
      doctor_id
    } = req.body;

    // Si no viene doctor_id, usar el usuario logueado
    const final_doctor_id = doctor_id || req.user.id;

    // Verificar disponibilidad del doctor
    const conflictCheck = await pool.query(`
      SELECT id FROM appointments 
      WHERE doctor_id = $1 AND clinic_id = $2 
      AND appointment_date = $3 AND appointment_time = $4
      AND status != 'cancelled'
    `, [final_doctor_id, clinic_id, appointment_date, appointment_time]);

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El doctor ya tiene una cita programada en ese horario' });
    }

    const result = await pool.query(`
      INSERT INTO appointments (
        patient_id, doctor_id, clinic_id, appointment_date, appointment_time,
        reason, appointment_type, notes, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [patient_id, final_doctor_id, clinic_id, appointment_date, appointment_time, reason, appointment_type, notes, status]);

    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error creando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      appointment_date,
      appointment_time,
      reason,
      appointment_type,
      notes,
      status,
      arrival_timestamp  // ✅ AÑADIDO: Campo arrival_timestamp
    } = req.body;

    // Verificar que la cita existe
    const existingAppointment = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (existingAppointment.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const appointment = existingAppointment.rows[0];

    // Verificar permisos: el usuario puede ser el doctor asignado o una secretaria de la clínica
    let hasPermission = false;
    
    // Si es el doctor asignado a la cita
    if (appointment.doctor_id === req.user.id) {
      hasPermission = true;
    } else {
      // Si es secretaria, verificar que pertenece a la clínica de la cita
      if (req.user.role === 'secretary') {
        const userClinicCheck = await pool.query(
          'SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
          [req.user.id, appointment.clinic_id]
        );
        
        if (userClinicCheck.rows.length > 0) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar esta cita' });
    }

    // Si se está cambiando la fecha/hora, verificar conflictos
    if (appointment_date && appointment_time) {
      const conflictCheck = await pool.query(`
        SELECT id FROM appointments 
        WHERE doctor_id = $1 AND clinic_id = $2 
        AND appointment_date = $3 AND appointment_time = $4
        AND status != 'cancelled' AND id != $5
      `, [req.user.id, existingAppointment.rows[0].clinic_id, appointment_date, appointment_time, id]);

      if (conflictCheck.rows.length > 0) {
        return res.status(400).json({ error: 'El doctor ya tiene una cita programada en ese horario' });
      }
    }

    const result = await pool.query(`
      UPDATE appointments 
      SET appointment_date = COALESCE($1, appointment_date),
          appointment_time = COALESCE($2, appointment_time),
          reason = COALESCE($3, reason),
          appointment_type = COALESCE($4, appointment_type),
          notes = COALESCE($5, notes),
          status = COALESCE($6, status),
          arrival_timestamp = COALESCE($7, arrival_timestamp),  -- ✅ AÑADIDO: Campo arrival_timestamp
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [appointment_date, appointment_time, reason, appointment_type, notes, status, arrival_timestamp, id]);

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error actualizando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la cita existe
    const existingAppointment = await pool.query(
      'SELECT * FROM appointments WHERE id = $1',
      [id]
    );

    if (existingAppointment.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada' });
    }

    const appointment = existingAppointment.rows[0];

    // Verificar permisos: el usuario puede ser el doctor asignado o una secretaria de la clínica
    let hasPermission = false;
    
    // Si es el doctor asignado a la cita
    if (appointment.doctor_id === req.user.id) {
      hasPermission = true;
    } else {
      // Si es secretaria, verificar que pertenece a la clínica de la cita
      if (req.user.role === 'secretary') {
        const userClinicCheck = await pool.query(
          'SELECT role FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
          [req.user.id, appointment.clinic_id]
        );
        
        if (userClinicCheck.rows.length > 0) {
          hasPermission = true;
        }
      }
    }

    if (!hasPermission) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar esta cita' });
    }

    const result = await pool.query(
      'DELETE FROM appointments WHERE id = $1 RETURNING *',
      [id]
    );

    res.json({ message: 'Cita eliminada exitosamente' });

  } catch (error) {
    console.error('Error eliminando cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAppointmentsByDate = async (req, res) => {
  try {
    const { date, clinicId } = req.query;
    let query = `
      SELECT 
        a.*,
        u.name as doctor_name,
        pat.name as patient_name,
        c.name as clinic_name
      FROM appointments a
      JOIN users u ON a.doctor_id = u.id
      JOIN patients pat ON a.patient_id = pat.id
      JOIN clinics c ON a.clinic_id = c.id
      WHERE DATE(a.appointment_date) = $1
    `;
    let params = [date];
    let paramCount = 1;

    if (clinicId) {
      paramCount++;
      query += ` AND a.clinic_id = $${paramCount}`;
      params.push(clinicId);
    } else {
      // Si no viene clinicId específico, filtrar por las clínicas del usuario
      const userId = req.user.id;
      
      const userClinicsResult = await pool.query(`
        SELECT clinic_id FROM user_clinics WHERE user_id = $1
      `, [userId]);
      
      if (userClinicsResult.rows.length > 0) {
        const clinicIds = userClinicsResult.rows.map(row => row.clinic_id);
        const placeholders = clinicIds.map((_, index) => `$${paramCount + index + 1}`).join(',');
        query += ` AND a.clinic_id IN (${placeholders})`;
        params.push(...clinicIds);
      }
    }

    query += ' ORDER BY a.appointment_time ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo citas por fecha:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getDoctorSchedule = async (req, res) => {
  try {
    const { doctorId, date, clinicId } = req.query;
    let query = `
      SELECT 
        a.*,
        pat.name as patient_name,
        c.name as clinic_name
      FROM appointments a
      JOIN patients pat ON a.patient_id = pat.id
      JOIN clinics c ON a.clinic_id = c.id
      WHERE a.doctor_id = $1
    `;
    let params = [doctorId];
    let paramCount = 1;

    if (date) {
      paramCount++;
      query += ` AND DATE(a.appointment_date) = $${paramCount}`;
      params.push(date);
    }

    if (clinicId) {
      paramCount++;
      query += ` AND a.clinic_id = $${paramCount}`;
      params.push(clinicId);
    }

    query += ' ORDER BY a.appointment_date ASC, a.appointment_time ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo agenda del doctor:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Estado de cita inválido' });
    }

    const result = await pool.query(`
      UPDATE appointments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND doctor_id = $3
      RETURNING *
    `, [status, id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cita no encontrada o no autorizada' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error actualizando estado de cita:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDate,
  getDoctorSchedule,
  updateAppointmentStatus
};
