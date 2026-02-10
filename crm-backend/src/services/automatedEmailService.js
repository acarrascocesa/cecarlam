// src/services/automatedEmailService.js
const cron = require('node-cron');
const pool = require('../config/database');
const emailService = require('./emailService');

// Configuración de automatización (puede ser modificada desde la base de datos)
let automationConfig = {
  appointmentReminders: {
    enabled: true,
    schedule: '0 8 * * *', // Diario a las 8:00 AM
    daysInAdvance: 7, // 1 semana antes
    templateType: 'appointment_reminder',
    maxRetries: 3
  }
};

// Variable para controlar si la automatización está activa
let isAutomationActive = false;

// Función para obtener configuración desde la base de datos
const loadAutomationConfig = async () => {
  try {
    // Verificar si la tabla system_config existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_config'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('ℹ️ Tabla system_config no existe, usando configuración por defecto');
      return;
    }
    
    const result = await pool.query(
      'SELECT config_data FROM system_config WHERE config_key = $1',
      ['automation_settings']
    );
    
    if (result.rows.length > 0) {
      const savedConfig = JSON.parse(result.rows[0].config_data);
      automationConfig = { ...automationConfig, ...savedConfig };
      console.log('✅ Configuración de automatización cargada desde BD');
    }
  } catch (error) {
    console.log('ℹ️ Usando configuración por defecto de automatización:', error.message);
  }
};

// Función para guardar configuración en la base de datos
const saveAutomationConfig = async (config) => {
  try {
    // Verificar si la tabla system_config existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'system_config'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('ℹ️ Tabla system_config no existe, creando...');
      await pool.query(`
        CREATE TABLE system_config (
          id SERIAL PRIMARY KEY,
          config_key VARCHAR(100) UNIQUE NOT NULL,
          config_data JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
    }
    
    await pool.query(
      `INSERT INTO system_config (config_key, config_data, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (config_key) 
       DO UPDATE SET config_data = $2, updated_at = NOW()`,
      ['automation_settings', JSON.stringify(config)]
    );
    automationConfig = { ...automationConfig, ...config };
    console.log('✅ Configuración de automatización guardada');
  } catch (error) {
    console.error('❌ Error guardando configuración de automatización:', error);
    throw error;
  }
};

// Función para enviar recordatorios automáticos
const sendAppointmentReminders = async () => {
  if (!automationConfig.appointmentReminders.enabled) {
    console.log('ℹ️ Automatización de recordatorios deshabilitada');
    return;
  }

  try {
    console.log('🔄 Iniciando envío de recordatorios automáticos...');
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + automationConfig.appointmentReminders.daysInAdvance);
    const targetDateStr = targetDate.toISOString().split('T')[0];
    
    console.log(`📅 Buscando citas para: ${targetDateStr} (${automationConfig.appointmentReminders.daysInAdvance} días adelante)`);
    
    // Buscar citas para recordatorio
    const query = `
      SELECT 
        a.*,
        p.name as patient_name,
        p.email as patient_email,
        p.id as patient_id,
        c.name as clinic_name,
        c.address as clinic_address,
        c.phone as clinic_phone,
        c.id as clinic_id,
        u.name as doctor_name,
        u.id as doctor_id
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN clinics c ON a.clinic_id = c.id
      LEFT JOIN users u ON a.doctor_id = u.id
      WHERE a.appointment_date = $1
      AND a.status = 'Pendiente'
      AND p.email IS NOT NULL
      AND p.email != ''
      AND p.email != 'sin-email@example.com'
    `;
    
    const result = await pool.query(query, [targetDateStr]);
    
    console.log(`📊 Encontradas ${result.rows.length} citas para recordatorio`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const appointment of result.rows) {
      try {
        // Verificar si ya se envió un recordatorio para esta cita
        const existingReminder = await pool.query(
          `SELECT id FROM messages 
           WHERE patient_id = $1 
           AND message_type = 'Recordatorio' 
           AND metadata->>'appointment_id' = $2
           AND message_date >= $3`,
          [appointment.patient_id, appointment.id, new Date(Date.now() - 24 * 60 * 60 * 1000)] // Últimas 24 horas
        );
        
        if (existingReminder.rows.length > 0) {
          console.log(`⏭️ Recordatorio ya enviado para: ${appointment.patient_name}`);
          continue;
        }
        
        // Enviar recordatorio
        const emailResult = await emailService.sendAppointmentReminderEmail(
          appointment,
          { 
            id: appointment.patient_id,
            name: appointment.patient_name, 
            email: appointment.patient_email 
          },
          { 
            id: appointment.doctor_id,
            name: appointment.doctor_name 
          },
          {
            id: appointment.clinic_id,
            name: appointment.clinic_name,
            address: appointment.clinic_address,
            phone: appointment.clinic_phone
          }
        );
        
        if (emailResult.success) {
          // Registrar el envío exitoso
          await pool.query(
            `INSERT INTO messages (clinic_id, patient_id, sender_id, message_type, sender_type, content, status, message_date, metadata) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              appointment.clinic_id,
              appointment.patient_id,
              appointment.doctor_id,
              'Recordatorio',
              'system',
              `Recordatorio automático enviado para cita del ${targetDateStr}`,
              'Enviado',
              new Date(),
              JSON.stringify({ 
                appointment_id: appointment.id, 
                doctor_id: appointment.doctor_id,
                automated: true,
                days_in_advance: automationConfig.appointmentReminders.daysInAdvance
              })
            ]
          );
          
          successCount++;
          console.log(`✅ Recordatorio enviado para: ${appointment.patient_name} (${appointment.patient_email})`);
        } else {
          errorCount++;
          console.error(`❌ Error enviando recordatorio para ${appointment.patient_name}:`, emailResult.error);
        }
        
        // Pequeña pausa para no sobrecargar el servidor de email
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error procesando recordatorio para ${appointment.patient_name}:`, error);
      }
    }
    
    console.log(`📈 Resumen de recordatorios: ${successCount} enviados, ${errorCount} errores`);
    
    // Registrar estadísticas de la ejecución (solo si la tabla existe)
    try {
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'automation_logs'
        );
      `);
      
      if (tableExists.rows[0].exists) {
        await pool.query(
          `INSERT INTO automation_logs (automation_type, execution_date, success_count, error_count, total_processed, config_used) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'appointment_reminders',
            new Date(),
            successCount,
            errorCount,
            result.rows.length,
            JSON.stringify(automationConfig.appointmentReminders)
          ]
        );
      }
    } catch (error) {
      console.log('ℹ️ No se pudo registrar en automation_logs:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error en automatización de recordatorios:', error);
    
    // Registrar error en logs (solo si la tabla existe)
    try {
      const tableExists = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'automation_logs'
        );
      `);
      
      if (tableExists.rows[0].exists) {
        await pool.query(
          `INSERT INTO automation_logs (automation_type, execution_date, success_count, error_count, total_processed, error_message) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'appointment_reminders',
            new Date(),
            0,
            0,
            0,
            error.message
          ]
        );
      }
    } catch (logError) {
      console.log('ℹ️ No se pudo registrar error en automation_logs:', logError.message);
    }
  }
};

// Función para obtener estadísticas de automatización
const getAutomationStats = async () => {
  try {
    // Verificar si la tabla automation_logs existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'automation_logs'
      );
    `);
    
    let statsResult = { rows: [] };
    
    if (tableExists.rows[0].exists) {
      // Estadísticas de los últimos 30 días
      const statsQuery = `
        SELECT 
          automation_type,
          COUNT(*) as total_executions,
          SUM(success_count) as total_success,
          SUM(error_count) as total_errors,
          MAX(execution_date) as last_execution,
          AVG(success_count) as avg_success_per_run
        FROM automation_logs 
        WHERE execution_date >= NOW() - INTERVAL '30 days'
        GROUP BY automation_type
      `;
      
      statsResult = await pool.query(statsQuery);
    }
    
    // Próxima ejecución programada
    const nextRun = new Date();
    if (automationConfig.appointmentReminders.enabled) {
      // Calcular próxima ejecución basada en el cron
      const scheduleParts = automationConfig.appointmentReminders.schedule.split(' ');
      const minute = scheduleParts[0];
      const hour = scheduleParts[1];
      nextRun.setHours(parseInt(hour), parseInt(minute), 0, 0);
      if (nextRun <= new Date()) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    }
    
    return {
      stats: statsResult.rows,
      config: automationConfig,
      nextRun: automationConfig.appointmentReminders.enabled ? nextRun : null,
      isActive: isAutomationActive
    };
    
  } catch (error) {
    console.error('Error obteniendo estadísticas de automatización:', error);
    throw error;
  }
};

// Función para iniciar la automatización
const startAutomation = async () => {
  try {
    await loadAutomationConfig();
    
    if (automationConfig.appointmentReminders.enabled) {
      cron.schedule(automationConfig.appointmentReminders.schedule, async () => {
        await sendAppointmentReminders();
      }, {
        scheduled: true,
        timezone: "America/Santo_Domingo" // Zona horaria de República Dominicana
      });
      
      isAutomationActive = true;
      console.log(`✅ Automatización de recordatorios iniciada - Horario: ${automationConfig.appointmentReminders.schedule}`);
      console.log(`📅 Recordatorios se enviarán ${automationConfig.appointmentReminders.daysInAdvance} días antes de las citas`);
    } else {
      console.log('ℹ️ Automatización de recordatorios deshabilitada en configuración');
    }
    
  } catch (error) {
    console.error('❌ Error iniciando automatización:', error);
  }
};

// Función para detener la automatización
const stopAutomation = () => {
  cron.getTasks().forEach(task => task.stop());
  isAutomationActive = false;
  console.log('⏹️ Automatización detenida');
};

// Función para ejecutar manualmente (para testing)
const runManualReminders = async () => {
  console.log('🔧 Ejecutando recordatorios manualmente...');
  await sendAppointmentReminders();
};

module.exports = {
  startAutomation,
  stopAutomation,
  sendAppointmentReminders,
  getAutomationStats,
  saveAutomationConfig,
  loadAutomationConfig,
  runManualReminders,
  automationConfig: () => automationConfig,
  isActive: () => isAutomationActive
};
