// src/controllers/reportController.js
const pool = require('../config/database');
const ReportGenerator = require('../utils/reportGenerator');
const fs = require('fs');
const path = require('path');

// GET /api/reports - Listar reportes generados
const getReports = async (req, res) => {
  try {
    const { clinicId, type, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query = `
      SELECT r.*, u.name as generated_by_name, c.name as clinic_name
      FROM reports r
      LEFT JOIN users u ON r.generated_by = u.id
      LEFT JOIN clinics c ON r.clinic_id = c.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    // FILTRO DE SEGURIDAD: Solo mostrar reportes apropiados según el rol
    if (userRole === 'admin') {
      // Los admins ven todos los reportes (no se aplica filtro adicional)
    } else if (userRole === 'doctor') {
      // Los doctores ven reportes de sus clínicas O reportes generales (clinic_id = null)
      paramCount++;
      query += ` AND (r.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $${paramCount}) OR r.clinic_id IS NULL)`;
      params.push(userId);
    } else if (userRole === 'secretary') {
      // Las secretarias ven reportes de las clínicas donde trabajan
      paramCount++;
      query += ` AND r.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $${paramCount})`;
      params.push(userId);
    }

    // Filtros adicionales opcionales
    if (clinicId) {
      paramCount++;
      query += ` AND r.clinic_id = $${paramCount}`;
      params.push(clinicId);
    }

    if (type) {
      paramCount++;
      query += ` AND r.type = $${paramCount}`;
      params.push(type);
    }

    if (status) {
      paramCount++;
      query += ` AND r.status = $${paramCount}`;
      params.push(status);
    }

    query += ' ORDER BY r.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/reports - Generar nuevo reporte
const generateReport = async (req, res) => {
  try {
    const {
      name,
      type,
      format,
      filters,
      clinicId
    } = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    // Validar que el usuario tenga acceso a la clínica (solo si se especifica una clínica específica)
    if (clinicId && clinicId !== 'all' && clinicId !== null) {
      const clinicAccess = await pool.query(
        'SELECT 1 FROM user_clinics WHERE user_id = $1 AND clinic_id = $2',
        [userId, clinicId]
      );
      
      if (clinicAccess.rows.length === 0) {
        return res.status(403).json({ error: 'No tienes acceso a esta clínica' });
      }
    }

    // Generar datos del reporte según el tipo
    let reportData = {};
    

    
    switch (type) {
      case 'financial':
        reportData = await generateFinancialReport(filters, clinicId, userId);
        break;
      case 'appointments':
        reportData = await generateAppointmentsReport(filters, clinicId, userId);
        break;
      case 'patients':
        reportData = await generatePatientsReport(filters, clinicId, userId);
        break;
      case 'medical':
        reportData = await generateMedicalReport(filters, clinicId, userId);
        break;
      case 'insurance_billing':
        reportData = await generateInsuranceBillingReport(filters, clinicId, userId);
        break;
      default:
        return res.status(400).json({ error: 'Tipo de reporte no válido' });
    }

    // Obtener información del usuario que genera el reporte
    const userResult = await pool.query('SELECT name FROM users WHERE id = $1', [userId]);
    const doctorName = userResult.rows[0]?.name || 'Usuario';

    // Generar archivo según el formato
    const reportGenerator = new ReportGenerator();
    let fileInfo = null;
    
    try {
      const reportInfo = { name, type, format, doctorName };
      
      
      
      switch (format) {
        case 'pdf':
          fileInfo = await reportGenerator.generatePDF(reportData, reportInfo);
          break;
        case 'excel':
          fileInfo = await reportGenerator.generateExcel(reportData, reportInfo);
          break;
        case 'csv':
          fileInfo = await reportGenerator.generateCSV(reportData, reportInfo);
          break;
        default:
          throw new Error('Formato no soportado');
      }
      

    } catch (fileError) {
      console.error('Error generando archivo:', fileError);
      // Continuar sin archivo si hay error
    }

    // Guardar reporte en la base de datos
    const reportResult = await pool.query(
      `INSERT INTO reports (name, type, format, filters, data, generated_by, clinic_id, status, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name, 
        type, 
        format, 
        JSON.stringify(filters), 
        JSON.stringify(reportData), 
        userId, 
        (clinicId && clinicId !== 'all' && clinicId !== null) ? clinicId : null, 
        'completed',
        fileInfo ? fileInfo.fileName : null
      ]
    );

    res.json({
      message: 'Reporte generado exitosamente',
      report: reportResult.rows[0],
      data: reportData,
      fileInfo: fileInfo
    });

  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/reports/:id - Obtener reporte específico
const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT r.*, u.name as generated_by_name, c.name as clinic_name
      FROM reports r
      LEFT JOIN users u ON r.generated_by = u.id
      LEFT JOIN clinics c ON r.clinic_id = c.id
      WHERE r.id = $1
    `;
    let params = [id];

    // FILTRO DE SEGURIDAD
    if (userRole === 'doctor') {
      // Para doctores: permitir acceso si el reporte es de sus clínicas O si es un reporte general (clinic_id = null)
      query += ` AND (r.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $2) OR r.clinic_id IS NULL)`;
      params.push(userId);
    } else if (userRole === 'secretary') {
      query += ` AND r.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $2)`;
      params.push(userId);
    }

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Error obteniendo reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/reports/:id/download - Descargar archivo del reporte
const downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar acceso al reporte
    let query = `
      SELECT r.* FROM reports r
      WHERE r.id = $1
    `;
    let params = [id];

    if (userRole === 'doctor') {
      // Para doctores: permitir acceso si el reporte es de sus clínicas O si es un reporte general (clinic_id = null)
      query += ` AND (r.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $2) OR r.clinic_id IS NULL)`;
      params.push(userId);
    } else if (userRole === 'secretary') {
      query += ` AND r.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $2)`;
      params.push(userId);
    }

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const report = result.rows[0];
    
    if (!report.file_path) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const filePath = path.join(__dirname, '../../uploads/reports', report.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado en el servidor' });
    }

    // Configurar headers para descarga
    const ext = path.extname(report.file_path).toLowerCase();
    let contentType = 'application/octet-stream';
    

    
    switch (ext) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.xlsx':
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case '.csv':
        contentType = 'text/csv';
        break;
    }
    


    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${report.file_path}"`);
    
    // Enviar archivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error descargando reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// DELETE /api/reports/:id - Eliminar reporte
const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que el usuario tenga acceso al reporte
    let query = `
      SELECT r.* FROM reports r
      WHERE r.id = $1
    `;
    let params = [id];

    if (userRole === 'doctor') {
      // Para doctores: permitir acceso si el reporte es de sus clínicas O si es un reporte general (clinic_id = null)
      query += ` AND (r.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $2) OR r.clinic_id IS NULL)`;
      params.push(userId);
    } else if (userRole === 'secretary') {
      query += ` AND r.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $2)`;
      params.push(userId);
    }

    const checkResult = await pool.query(query, params);
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    const report = checkResult.rows[0];

    // Eliminar archivo si existe
    if (report.file_path) {
      const filePath = path.join(__dirname, '../../uploads/reports', report.file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Eliminar reporte de la base de datos
    await pool.query('DELETE FROM reports WHERE id = $1', [id]);
    
    res.json({ message: 'Reporte eliminado exitosamente' });

  } catch (error) {
    console.error('Error eliminando reporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// GET /api/reports/templates - Listar plantillas
const getReportTemplates = async (req, res) => {
  try {
    const { type, isActive } = req.query;
    const userId = req.user.id;
    
    let query = `
      SELECT rt.*, u.name as created_by_name
      FROM report_templates rt
      LEFT JOIN users u ON rt.created_by = u.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    // Solo mostrar plantillas activas por defecto
    if (isActive !== 'false') {
      paramCount++;
      query += ` AND rt.is_active = $${paramCount}`;
      params.push(true);
    }

    if (type) {
      paramCount++;
      query += ` AND rt.type = $${paramCount}`;
      params.push(type);
    }

    query += ' ORDER BY rt.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Error obteniendo plantillas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// POST /api/reports/templates - Crear plantilla
const createReportTemplate = async (req, res) => {
  try {
    const {
      name,
      description,
      type,
      templateConfig
    } = req.body;

    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO report_templates (name, description, type, template_config, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description, type, JSON.stringify(templateConfig), userId]
    );

    res.json({
      message: 'Plantilla creada exitosamente',
      template: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando plantilla:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Funciones auxiliares para generar reportes específicos
const generateFinancialReport = async (filters, clinicId, userId) => {
  const { startDate, endDate } = filters;
  

  
  let query = `
    SELECT 
      i.id,
      i.invoice_date,
      i.total_services,
      i.insurance_covers,
      i.patient_pays,
      i.status,
      i.payment_method,
      p.name as patient_name,
      u.name as doctor_name,
      c.name as clinic_name
    FROM invoices i
    LEFT JOIN patients p ON i.patient_id = p.id
    LEFT JOIN users u ON i.doctor_id = u.id
    LEFT JOIN clinics c ON i.clinic_id = c.id
    WHERE 1=1
  `;
  let params = [];
  let paramCount = 0;

  // Filtros de seguridad - igual que en facturación
  paramCount++;
  query += ` AND i.doctor_id = $${paramCount}`;
  params.push(userId);

  // Filtro adicional por clínica (solo si se especifica y no es 'all')
  if (clinicId && clinicId !== 'all' && clinicId !== null) {
    paramCount++;
    query += ` AND i.clinic_id = $${paramCount}`;
    params.push(clinicId);
  }

  if (startDate) {
    paramCount++;
    query += ` AND i.invoice_date >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    query += ` AND i.invoice_date <= $${paramCount}`;
    params.push(endDate);
  }

  query += ' ORDER BY i.invoice_date DESC';

  const result = await pool.query(query, params);
  
  // Calcular totales
  const totals = result.rows.reduce((acc, row) => {
    acc.totalServices += parseFloat(row.total_services) || 0;
    acc.totalInsurance += parseFloat(row.insurance_covers) || 0;
    acc.totalPatient += parseFloat(row.patient_pays) || 0;
    return acc;
  }, { totalServices: 0, totalInsurance: 0, totalPatient: 0 });

  return {
    invoices: result.rows,
    totals,
    summary: {
      totalInvoices: result.rows.length,
      paidInvoices: result.rows.filter(r => r.status === 'Pagada').length,
      pendingInvoices: result.rows.filter(r => r.status === 'Pendiente').length
    }
  };
};

const generateAppointmentsReport = async (filters, clinicId, userId) => {
  const { startDate, endDate, status } = filters;
  
  let query = `
    SELECT 
      a.id,
      a.appointment_date,
      a.appointment_time,
      a.status,
      a.reason,
      a.arrival_timestamp,
      p.name as patient_name,
      u.name as doctor_name,
      c.name as clinic_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN users u ON a.doctor_id = u.id
    LEFT JOIN clinics c ON a.clinic_id = c.id
    WHERE 1=1
  `;
  let params = [];
  let paramCount = 0;

  // Filtros de seguridad - igual que en facturación
  paramCount++;
  query += ` AND a.doctor_id = $${paramCount}`;
  params.push(userId);

  // Filtro adicional por clínica (solo si se especifica y no es 'all')
  if (clinicId && clinicId !== 'all' && clinicId !== null) {
    paramCount++;
    query += ` AND a.clinic_id = $${paramCount}`;
    params.push(clinicId);
  }

  if (startDate) {
    paramCount++;
    query += ` AND a.appointment_date >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    query += ` AND a.appointment_date <= $${paramCount}`;
    params.push(endDate);
  }

  if (status) {
    paramCount++;
    query += ` AND a.status = $${paramCount}`;
    params.push(status);
  }

  query += ' ORDER BY a.appointment_date DESC, a.appointment_time ASC';

  const result = await pool.query(query, params);
  
  // Calcular estadísticas
  const stats = result.rows.reduce((acc, row) => {
    acc.total++;
    if (row.status === 'Confirmada') acc.confirmed++;
    if (row.status === 'Pendiente') acc.pending++;
    if (row.status === 'Cancelada') acc.cancelled++;
    if (row.status === 'Completada') acc.completed++;
    if (row.arrival_timestamp) acc.withArrival++;
    return acc;
  }, { total: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0, withArrival: 0 });

  return {
    appointments: result.rows,
    statistics: stats,
    summary: {
      attendanceRate: stats.total > 0 ? ((stats.confirmed + stats.completed) / stats.total * 100).toFixed(2) : 0,
      averageWaitTime: stats.withArrival > 0 ? '15 min' : 'N/A' // Placeholder
    }
  };
};

const generatePatientsReport = async (filters, clinicId, userId) => {
  const { status, insuranceProvider } = filters;
  
  let query = `
    SELECT 
      p.id,
      p.name,
      p.email,
      p.phone,
      p.cedula,
      p.date_of_birth,
      p.gender,
      p.insurance_provider,
      p.insurance_number,
      p.status,
      p.created_at,
      c.name as clinic_name
    FROM patients p
    LEFT JOIN clinics c ON p.clinic_id = c.id
    WHERE 1=1
  `;
  let params = [];
  let paramCount = 0;

  // Filtros de seguridad - pacientes de las clínicas del usuario
  paramCount++;
  query += ` AND p.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $${paramCount})`;
  params.push(userId);

  if (clinicId && clinicId !== 'all' && clinicId !== null) {
    paramCount++;
    query += ` AND p.clinic_id = $${paramCount}`;
    params.push(clinicId);
  }

  if (status) {
    paramCount++;
    query += ` AND p.status = $${paramCount}`;
    params.push(status);
  }

  if (insuranceProvider) {
    paramCount++;
    query += ` AND p.insurance_provider = $${paramCount}`;
    params.push(insuranceProvider);
  }

  query += ' ORDER BY p.created_at DESC';

  const result = await pool.query(query, params);
  
  // Calcular estadísticas
  const stats = result.rows.reduce((acc, row) => {
    acc.total++;
    if (row.status === 'Activo') acc.active++;
    if (row.status === 'Pendiente') acc.pending++;
    if (row.status === 'Inactivo') acc.inactive++;
    if (row.gender === 'Masculino') acc.male++;
    if (row.gender === 'Femenino') acc.female++;
    if (row.insurance_provider) acc.withInsurance++;
    return acc;
  }, { total: 0, active: 0, pending: 0, inactive: 0, male: 0, female: 0, withInsurance: 0 });

  return {
    patients: result.rows,
    statistics: stats,
    summary: {
      newThisMonth: result.rows.filter(p => {
        const created = new Date(p.created_at);
        const now = new Date();
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length
    }
  };
};

const generateMedicalReport = async (filters, clinicId, userId) => {
  const { startDate, endDate, type } = filters;
  
  let query = `
    SELECT 
      mr.id,
      mr.record_date,
      mr.type,
      mr.diagnosis,
      mr.status,
      p.name as patient_name,
      u.name as doctor_name,
      c.name as clinic_name
    FROM medical_records mr
    LEFT JOIN patients p ON mr.patient_id = p.id
    LEFT JOIN users u ON mr.doctor_id = u.id
    LEFT JOIN clinics c ON mr.clinic_id = c.id
    WHERE 1=1
  `;
  let params = [];
  let paramCount = 0;

  // Filtros de seguridad - igual que en facturación
  paramCount++;
  query += ` AND mr.doctor_id = $${paramCount}`;
  params.push(userId);

  if (clinicId && clinicId !== 'all' && clinicId !== null) {
    paramCount++;
    query += ` AND mr.clinic_id = $${paramCount}`;
    params.push(clinicId);
  }

  if (startDate) {
    paramCount++;
    query += ` AND mr.record_date >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    query += ` AND mr.record_date <= $${paramCount}`;
    params.push(endDate);
  }

  if (type) {
    paramCount++;
    query += ` AND mr.type = $${paramCount}`;
    params.push(type);
  }

  query += ' ORDER BY mr.record_date DESC';

  const result = await pool.query(query, params);
  
  // Calcular estadísticas
  const stats = result.rows.reduce((acc, row) => {
    acc.total++;
    if (row.status === 'Completo') acc.complete++;
    if (row.status === 'Pendiente') acc.pending++;
    return acc;
  }, { total: 0, complete: 0, pending: 0 });

  return {
    medicalRecords: result.rows,
    statistics: stats,
    summary: {
      completionRate: stats.total > 0 ? (stats.complete / stats.total * 100).toFixed(2) : 0
    }
  };
};

const generateInsuranceBillingReport = async (filters, clinicId, userId) => {
  const { startDate, endDate, insuranceProvider } = filters;
  
  let query = `
    SELECT
      ROW_NUMBER() OVER (ORDER BY i.invoice_date) as "No",
      p.name as "Afiliado",
      p.cedula as "NSS o Cédula",
      COALESCE(i.authorization_number, ii.authorization_number, 'N/A') as "No. Autorización",
      i.invoice_date as "Fecha del Servicio",
      COALESCE(ms.name, ii.description, 'Servicio General') as "Tipo de Servicio",
      COALESCE(ii.insurance_covers, i.insurance_covers) as "Valor Unitario",
      c.name as "Clínica",
      u.name as "Doctor",
      p.insurance_provider as "Proveedor de Seguro"
    FROM invoices i
    JOIN patients p ON i.patient_id = p.id
    JOIN users u ON i.doctor_id = u.id
    JOIN clinics c ON i.clinic_id = c.id
    LEFT JOIN invoice_items ii ON i.id = ii.invoice_id
    LEFT JOIN medical_services ms ON ii.service_id = ms.id
    WHERE 1=1
    AND p.insurance_provider IS NOT NULL 
    AND p.insurance_provider != ''
  `;
  let params = [];
  let paramCount = 0;

  // Filtros de seguridad - igual que en otros reportes
  paramCount++;
  query += ` AND i.doctor_id = $${paramCount}`;
  params.push(userId);

  // Filtro adicional por clínica (solo si se especifica y no es 'all')
  if (clinicId && clinicId !== 'all' && clinicId !== null) {
    paramCount++;
    query += ` AND i.clinic_id = $${paramCount}`;
    params.push(clinicId);
  }

  if (startDate) {
    paramCount++;
    query += ` AND i.invoice_date >= $${paramCount}`;
    params.push(startDate);
  }

  if (endDate) {
    paramCount++;
    query += ` AND i.invoice_date <= $${paramCount}`;
    params.push(endDate);
  }

  if (insuranceProvider) {
    paramCount++;
    query += ` AND p.insurance_provider = $${paramCount}`;
    params.push(insuranceProvider);
  }

  query += ' ORDER BY i.invoice_date ASC';

  const result = await pool.query(query, params);
  
  // Calcular estadísticas
  const stats = result.rows.reduce((acc, row) => {
    acc.total++;
    acc.totalValue += parseFloat(row["Valor Unitario"]) || 0;
    if (row["Proveedor de Seguro"]) {
      acc.byProvider[row["Proveedor de Seguro"]] = (acc.byProvider[row["Proveedor de Seguro"]] || 0) + 1;
    }
    return acc;
  }, { total: 0, totalValue: 0, byProvider: {} });

  return {
    insuranceBilling: result.rows,
    statistics: stats,
    summary: {
      totalServices: stats.total,
      totalValue: stats.totalValue.toFixed(2),
      totalValueSum: stats.totalValue.toFixed(2), // Suma específica para mostrar en el reporte
      providersCount: Object.keys(stats.byProvider).length,
      topProvider: Object.keys(stats.byProvider).reduce((a, b) => 
        stats.byProvider[a] > stats.byProvider[b] ? a : b, null)
    }
  };
};

module.exports = {
  getReports,
  generateReport,
  getReportById,
  downloadReport,
  deleteReport,
  getReportTemplates,
  createReportTemplate
};
