// src/controllers/invoiceController.js
const pool = require('../config/database');

const getInvoices = async (req, res) => {
  try {
    const { clinicId, status, patientId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query = `
      SELECT i.*, p.name as patient_name, p.insurance_provider, u.name as doctor_name,
             ii.provider as insurance_provider, ii.policy_number, ii.coverage_verified,
             ii.verified_by, ii.verified_date, ii.notes as verification_notes,
             uv.name as verified_by_name
      FROM invoices i
      LEFT JOIN patients p ON i.patient_id = p.id
      LEFT JOIN users u ON i.doctor_id = u.id
      LEFT JOIN invoice_insurance ii ON i.id = ii.invoice_id
      LEFT JOIN users uv ON ii.verified_by = uv.id
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    // FILTRO DE SEGURIDAD: Solo mostrar facturas apropiadas según el rol
    if (userRole === 'admin') {
      // Los admins ven todas las facturas (no se aplica filtro adicional)
    } else if (userRole === 'doctor') {
      // Los doctores ven sus propias facturas Y las facturas de sus secretarias en sus clínicas
      paramCount++;
      query += ` AND (i.doctor_id = $${paramCount} OR i.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $${paramCount} AND role = 'owner'))`;
      params.push(userId);
    } else if (userRole === 'secretary' || userRole === 'cajera') {
      // Secretarias y cajeras ven facturas de las clínicas donde trabajan
      paramCount++;
      query += ` AND i.clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = $${paramCount})`;
      params.push(userId);
    }

    // Filtros adicionales opcionales
    if (clinicId) {
      paramCount++;
      query += ` AND i.clinic_id = $${paramCount}`;
      params.push(clinicId);
    }

    if (status) {
      paramCount++;
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
    }

    if (patientId) {
      paramCount++;
      query += ` AND i.patient_id = $${paramCount}`;
      params.push(patientId);
    }

    query += ' ORDER BY i.invoice_date DESC';

    const result = await pool.query(query, params);
    
    // Para cada factura, obtener sus items con información del servicio
    const invoicesWithItems = await Promise.all(
      result.rows.map(async (invoice) => {
        const itemsResult = await pool.query(
          `SELECT ii.*, ms.name as service_name, ms.category, ms.specialty 
           FROM invoice_items ii 
           LEFT JOIN medical_services ms ON ii.service_id = ms.id 
           WHERE ii.invoice_id = $1`,
          [invoice.id]
        );
        
        return {
          ...invoice,
          items: itemsResult.rows
        };
      })
    );
    
    res.json(invoicesWithItems);

  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createInvoice = async (req, res) => {
  try {
    const {
      clinicId,
      patientId,
      doctorId,
      invoiceDate,
      totalServices,
      insuranceCovers,
      patientPays,
      status,
      paymentMethod,
      notes,
      authorizationNumber,
      items,
      insurance
    } = req.body;

    const userId = req.user.id;
    const userRole = req.user.role;

    // Determinar el doctor_id correcto
    let finalDoctorId = doctorId;
    
    // Si es una secretaria, obtener el doctor de la clínica
    if (userRole === 'secretary' && clinicId) {
      const doctorResult = await pool.query(
        `SELECT user_id FROM user_clinics 
         WHERE clinic_id = $1 AND role = 'owner' 
         LIMIT 1`,
        [clinicId]
      );
      
      if (doctorResult.rows.length > 0) {
        finalDoctorId = doctorResult.rows[0].user_id;
      }
    }

    // Crear factura
    const invoiceResult = await pool.query(
      `INSERT INTO invoices (
        clinic_id, patient_id, doctor_id, invoice_date, total_services,
        insurance_covers, patient_pays, status, payment_method, notes, authorization_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        clinicId, patientId, finalDoctorId, invoiceDate, totalServices,
        insuranceCovers, patientPays, status || 'Pendiente', paymentMethod, notes, authorizationNumber
      ]
    );

    const invoice = invoiceResult.rows[0];

    // Crear información de seguro si existe
    if (insurance) {
      await pool.query(
        `INSERT INTO invoice_insurance (
          invoice_id, provider, policy_number, coverage_verified,
          verified_by, verified_date, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          invoice.id, insurance.provider, insurance.policyNumber,
          insurance.coverageVerified, req.user.id,
          insurance.verifiedDate, insurance.notes
        ]
      );
    }

    // Crear items de factura si existen
    if (items && items.length > 0) {
      for (const item of items) {
        await pool.query(
          `INSERT INTO invoice_items (
            invoice_id, service_id, description, amount,
            insurance_covers, patient_pays, authorization_number
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            invoice.id, item.serviceId || null, item.description, item.totalPrice || item.amount,
            item.insuranceCovers, item.patientPays, item.authorizationNumber || null
          ]
        );
      }
    }

    res.status(201).json(invoice);

  } catch (error) {
    console.error('Error creando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener factura con información relacionada
    const invoiceResult = await pool.query(
      `SELECT i.*, p.name as patient_name, u.name as doctor_name
       FROM invoices i
       LEFT JOIN patients p ON i.patient_id = p.id
       LEFT JOIN users u ON i.doctor_id = u.id
       WHERE i.id = $1`,
      [id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const invoice = invoiceResult.rows[0];

    // Obtener información de seguro
    const insuranceResult = await pool.query(
      'SELECT * FROM invoice_insurance WHERE invoice_id = $1',
      [id]
    );

    // Obtener items de factura con información del servicio
    const itemsResult = await pool.query(
      `SELECT ii.*, ms.name as service_name, ms.category, ms.specialty 
       FROM invoice_items ii 
       LEFT JOIN medical_services ms ON ii.service_id = ms.id 
       WHERE ii.invoice_id = $1`,
      [id]
    );

    res.json({
      ...invoice,
      insurance: insuranceResult.rows[0] || null,
      items: itemsResult.rows
    });

  } catch (error) {
    console.error('Error obteniendo factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      paymentMethod,
      notes,
      paymentDate,
      totalServices,
      insuranceCovers,
      patientPays,
      invoice_date,
      total_services,
      insurance_covers,
      patient_pays,
      authorization_number,
      authorizationNumber,
      items
    } = req.body;

    // Verificar que la factura existe
    const existingInvoiceResult = await pool.query(
      'SELECT id FROM invoices WHERE id = $1',
      [id]
    );

    if (existingInvoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Construir la consulta de actualización dinámicamente
    const updateFields = [];
    const values = [];
    let paramCount = 0;

    if (status !== undefined) {
      paramCount++;
      updateFields.push(`status = $${paramCount}`);
      values.push(status);
    }

    const validPaymentMethods = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque'];
    const hasValidPaymentMethod = paymentMethod && paymentMethod !== 'no-especificado' && validPaymentMethods.includes(paymentMethod);
    if (paymentMethod !== undefined && hasValidPaymentMethod) {
      paramCount++;
      updateFields.push(`payment_method = $${paramCount}`);
      values.push(paymentMethod);
    }

    if (notes !== undefined) {
      paramCount++;
      updateFields.push(`notes = $${paramCount}`);
      values.push(notes);
    }

    if (paymentDate !== undefined) {
      paramCount++;
      updateFields.push(`payment_date = $${paramCount}`);
      values.push(paymentDate);
    }

    const ts = total_services !== undefined ? total_services : totalServices;
    if (ts !== undefined) {
      paramCount++;
      updateFields.push(`total_services = $${paramCount}`);
      values.push(ts);
    }

    const ic = insurance_covers !== undefined ? insurance_covers : insuranceCovers;
    if (ic !== undefined) {
      paramCount++;
      updateFields.push(`insurance_covers = $${paramCount}`);
      values.push(ic);
    }

    const pp = patient_pays !== undefined ? patient_pays : patientPays;
    if (pp !== undefined) {
      paramCount++;
      updateFields.push(`patient_pays = $${paramCount}`);
      values.push(pp);
    }

    if (invoice_date !== undefined) {
      paramCount++;
      updateFields.push(`invoice_date = $${paramCount}`);
      values.push(invoice_date);
    }

    const authNum = authorization_number !== undefined ? authorization_number : authorizationNumber;
    if (authNum !== undefined) {
      paramCount++;
      updateFields.push(`authorization_number = $${paramCount}`);
      values.push(authNum || null);
    }

    // Siempre actualizar updated_at
    paramCount++;
    updateFields.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    if (updateFields.length > 1) {
      paramCount++;
      values.push(id);
      const updateQuery = `
        UPDATE invoices 
        SET ${updateFields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `;
      await pool.query(updateQuery, values);
    }

    // Actualizar items si se envían
    if (items && Array.isArray(items)) {
      await pool.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);
      for (const item of items) {
        const desc = item.description;
        const amount = Number(item.totalPrice ?? item.amount ?? item.unit_price ?? 0);
        const insCovers = Number(item.insuranceCovers ?? item.insurance_covers ?? 0);
        const patPays = Number(item.patientPays ?? item.patient_pays ?? 0);
        const authItem = item.authorizationNumber ?? item.authorization_number ?? null;
        if (desc) {
          await pool.query(
            `INSERT INTO invoice_items (
              invoice_id, service_id, description, amount,
              insurance_covers, patient_pays, authorization_number
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              id, item.serviceId ?? item.service_id ?? null, desc, amount,
              insCovers, patPays, authItem
            ]
          );
        }
      }
    }

    // Obtener información completa de la factura actualizada con items
    const completeInvoiceResult = await pool.query(
      `SELECT i.*, p.name as patient_name, u.name as doctor_name
       FROM invoices i
       LEFT JOIN patients p ON i.patient_id = p.id
       LEFT JOIN users u ON i.doctor_id = u.id
       WHERE i.id = $1`,
      [id]
    );
    const invoiceData = completeInvoiceResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT ii.*, ms.name as service_name, ms.category, ms.specialty 
       FROM invoice_items ii 
       LEFT JOIN medical_services ms ON ii.service_id = ms.id 
       WHERE ii.invoice_id = $1`,
      [id]
    );
    invoiceData.items = itemsResult.rows;

    res.json(invoiceData);

  } catch (error) {
    console.error('Error actualizando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


const deleteInvoice = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verificar que la factura existe y obtener información
    const invoiceResult = await pool.query(
      'SELECT * FROM invoices WHERE id = $1',
      [id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    const invoice = invoiceResult.rows[0];

    // Validaciones de permisos
    // Solo el doctor que creó la factura o secretarias de la misma clínica pueden eliminar
    if (userRole === 'doctor' && invoice.doctor_id !== userId) {
      return res.status(403).json({ 
        error: 'No tienes permisos para eliminar esta factura' 
      });
    }

    if (userRole === 'secretary') {
      // Verificar que la secretaria pertenece a la misma clínica
      const secretaryClinicResult = await pool.query(
        'SELECT clinic_id FROM user_clinics WHERE user_id = $1',
        [userId]
      );
      
      const secretaryClinicIds = secretaryClinicResult.rows.map(row => row.clinic_id);
      
      if (!secretaryClinicIds.includes(invoice.clinic_id)) {
        return res.status(403).json({ 
          error: 'No tienes permisos para eliminar facturas de esta clínica' 
        });
      }
    }

    // Validación de negocio: no permitir eliminar facturas ya pagadas
    if (invoice.status === 'Pagada') {
      return res.status(400).json({ 
        error: 'No se puede eliminar una factura que ya ha sido pagada' 
      });
    }

    // Eliminar items de factura primero (por referencia de clave foránea)
    await pool.query('DELETE FROM invoice_items WHERE invoice_id = $1', [id]);

    // Eliminar información de seguro si existe
    await pool.query('DELETE FROM invoice_insurance WHERE invoice_id = $1', [id]);

    // Eliminar la factura
    await pool.query('DELETE FROM invoices WHERE id = $1', [id]);

    res.json({ 
      message: 'Factura eliminada exitosamente',
      deletedInvoiceId: id 
    });

  } catch (error) {
    console.error('Error eliminando factura:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
module.exports = {
  deleteInvoice,
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice
};
