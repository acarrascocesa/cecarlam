// src/utils/reportGenerator.js
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

// Código del prestador de servicio por proveedor de seguro (para reporte por seguros)
const PROVIDER_CODES = {
  'SENASA': '828033',
  'SEMMA': '14903',
  'APS': '70696',
  'FUTURO': '15786',
  'METASALUD': '12794',
  'RESERVAS': '10008864',
  'CMD': '90011255',
  'MONUMENTAL': '10976',
  'UASD': '6730',
  'PRIMERA HUMANO': '19979',
  'UNIVERSAL': '10950',
  'ASEMAP': '9007',
  'MAPFRE': '8277625'
};

function getProviderCodesText(insuranceBillingRows) {
  if (!insuranceBillingRows || insuranceBillingRows.length === 0) return '';
  const providerKey = 'Proveedor de Seguro';
  const seen = new Set();
  const codes = [];
  for (const row of insuranceBillingRows) {
    const name = (row[providerKey] || '').toString().trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const code = PROVIDER_CODES[name] || PROVIDER_CODES[name.toUpperCase()];
    if (code) codes.push(code);
  }
  return codes.join('; ') || '';
}

class ReportGenerator {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads');
    this.reportsDir = path.join(this.uploadsDir, 'reports');
    
    // Crear directorios si no existen
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  // Generar reporte PDF
  async generatePDF(reportData, reportInfo) {
    return new Promise((resolve, reject) => {
      try {
        const fileName = `report_${reportInfo.type}_${Date.now()}.pdf`;
        const filePath = path.join(this.reportsDir, fileName);
        
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50
        });

        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Encabezado
        this.addPDFHeader(doc, reportInfo);
        
        // Contenido según el tipo de reporte
        switch (reportInfo.type) {
          case 'financial':
            this.addFinancialContent(doc, reportData);
            break;
          case 'appointments':
            this.addAppointmentsContent(doc, reportData);
            break;
          case 'patients':
            this.addPatientsContent(doc, reportData);
            break;
          case 'medical':
            this.addMedicalContent(doc, reportData);
            break;
          case 'insurance_billing':
            this.addInsuranceBillingContent(doc, reportData);
            break;
          default:
            doc.text('Tipo de reporte no válido', { align: 'center' });
        }

        // Pie de página
        this.addPDFFooter(doc, reportInfo);

        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            fileSize: fs.statSync(filePath).size
          });
        });

        stream.on('error', (error) => {
          reject(error);
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  // Generar reporte Excel
  async generateExcel(reportData, reportInfo) {
    try {
      const fileName = `report_${reportInfo.type}_${Date.now()}.xlsx`;
      const filePath = path.join(this.reportsDir, fileName);
      

      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte');

      // Configurar encabezado
      this.addExcelHeader(worksheet, reportInfo);
      
      // Agregar contenido según el tipo
      switch (reportInfo.type) {
        case 'financial':
          this.addFinancialExcelContent(worksheet, reportData);
          break;
        case 'appointments':
          this.addAppointmentsExcelContent(worksheet, reportData);
          break;
        case 'patients':
          this.addPatientsExcelContent(worksheet, reportData);
          break;
        case 'medical':
          this.addMedicalExcelContent(worksheet, reportData);
          break;
        case 'insurance_billing':
          this.addInsuranceBillingExcelContent(worksheet, reportData);
          break;
      }

      // Guardar archivo
      await workbook.xlsx.writeFile(filePath);
      
      const result = {
        fileName,
        filePath,
        fileSize: fs.statSync(filePath).size
      };
      

      
      return result;

    } catch (error) {
      throw error;
    }
  }

  // Generar reporte CSV
  async generateCSV(reportData, reportInfo) {
    try {
      const fileName = `report_${reportInfo.type}_${Date.now()}.csv`;
      const filePath = path.join(this.reportsDir, fileName);
      
      let csvContent = '';
      
      // Agregar contenido según el tipo
      switch (reportInfo.type) {
        case 'financial':
          csvContent = this.generateFinancialCSV(reportData);
          break;
        case 'appointments':
          csvContent = this.generateAppointmentsCSV(reportData);
          break;
        case 'patients':
          csvContent = this.generatePatientsCSV(reportData);
          break;
        case 'medical':
          csvContent = this.generateMedicalCSV(reportData);
          break;
        case 'insurance_billing':
          csvContent = this.generateInsuranceBillingCSV(reportData);
          break;
      }

      fs.writeFileSync(filePath, csvContent, 'utf8');
      
      return {
        fileName,
        filePath,
        fileSize: fs.statSync(filePath).size
      };

    } catch (error) {
      throw error;
    }
  }

  // Métodos auxiliares para PDF
  addPDFHeader(doc, reportInfo) {
    doc.fontSize(20)
       .text('CECARLAM CRM', { align: 'center' })
       .fontSize(16)
       .text(`Reporte: ${reportInfo.name}`, { align: 'center' })
       .fontSize(12)
       .text(`Generado por: ${reportInfo.doctorName || 'Usuario'}`, { align: 'center' })
       .text(`Tipo: ${this.getTypeName(reportInfo.type)}`, { align: 'center' })
       .text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, { align: 'center' })
       .moveDown(2);
  }

  addPDFFooter(doc, reportInfo) {
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(10)
         .text(`Página ${i + 1} de ${pageCount}`, 50, doc.page.height - 50, { align: 'center' });
    }
  }

  addFinancialContent(doc, data) {
    doc.fontSize(14).text('Resumen Financiero', { underline: true }).moveDown();
    
    // Totales
    doc.fontSize(12)
       .text(`Total de Facturas: ${data.summary.totalInvoices}`)
       .text(`Facturas Pagadas: ${data.summary.paidInvoices}`)
       .text(`Facturas Pendientes: ${data.summary.pendingInvoices}`)
       .moveDown();

    // Tabla de facturas
    if (data.invoices && data.invoices.length > 0) {
      doc.fontSize(12).text('Detalle de Facturas:', { underline: true }).moveDown();
      
      data.invoices.slice(0, 10).forEach((invoice, index) => {
        doc.fontSize(10)
           .text(`${index + 1}. ${invoice.patient_name} - $${invoice.total_services} - ${invoice.status}`)
           .moveDown(0.5);
      });
    }
  }

  addAppointmentsContent(doc, data) {
    doc.fontSize(14).text('Resumen de Citas', { underline: true }).moveDown();
    
    // Estadísticas
    doc.fontSize(12)
       .text(`Total de Citas: ${data.statistics.total}`)
       .text(`Confirmadas: ${data.statistics.confirmed}`)
       .text(`Pendientes: ${data.statistics.pending}`)
       .text(`Completadas: ${data.statistics.completed}`)
       .text(`Canceladas: ${data.statistics.cancelled}`)
       .moveDown();

    // Tabla de citas
    if (data.appointments && data.appointments.length > 0) {
      doc.fontSize(12).text('Detalle de Citas:', { underline: true }).moveDown();
      
      data.appointments.slice(0, 10).forEach((appointment, index) => {
        doc.fontSize(10)
           .text(`${index + 1}. ${appointment.patient_name} - ${appointment.appointment_date} - ${appointment.status}`)
           .moveDown(0.5);
      });
    }
  }

  addPatientsContent(doc, data) {
    doc.fontSize(14).text('Resumen de Pacientes', { underline: true }).moveDown();
    
    // Estadísticas
    doc.fontSize(12)
       .text(`Total de Pacientes: ${data.statistics.total}`)
       .text(`Activos: ${data.statistics.active}`)
       .text(`Pendientes: ${data.statistics.pending}`)
       .text(`Inactivos: ${data.statistics.inactive}`)
       .text(`Con Seguro: ${data.statistics.withInsurance}`)
       .moveDown();

    // Tabla de pacientes
    if (data.patients && data.patients.length > 0) {
      doc.fontSize(12).text('Detalle de Pacientes:', { underline: true }).moveDown();
      
      data.patients.slice(0, 10).forEach((patient, index) => {
        doc.fontSize(10)
           .text(`${index + 1}. ${patient.name} - ${patient.cedula} - ${patient.status}`)
           .moveDown(0.5);
      });
    }
  }

  addMedicalContent(doc, data) {
    doc.fontSize(14).text('Resumen Médico', { underline: true }).moveDown();
    
    // Estadísticas
    doc.fontSize(12)
       .text(`Total de Registros: ${data.statistics.total}`)
       .text(`Completos: ${data.statistics.complete}`)
       .text(`Pendientes: ${data.statistics.pending}`)
       .text(`Tasa de Completitud: ${data.summary.completionRate}%`)
       .moveDown();

    // Tabla de registros médicos
    if (data.medicalRecords && data.medicalRecords.length > 0) {
      doc.fontSize(12).text('Detalle de Registros Médicos:', { underline: true }).moveDown();
      
      data.medicalRecords.slice(0, 10).forEach((record, index) => {
        doc.fontSize(10)
           .text(`${index + 1}. ${record.patient_name} - ${record.type} - ${record.status}`)
           .moveDown(0.5);
      });
    }
  }

  // Métodos auxiliares para Excel
  addExcelHeader(worksheet, reportInfo) {
    worksheet.mergeCells('A1:D1');
    worksheet.getCell('A1').value = 'CECARLAM CRM';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:D2');
    worksheet.getCell('A2').value = `Reporte: ${reportInfo.name}`;
    worksheet.getCell('A2').font = { size: 14, bold: true };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:D3');
    worksheet.getCell('A3').value = `Generado por: ${reportInfo.doctorName || 'Usuario'}`;
    worksheet.getCell('A3').font = { size: 12, bold: true };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A4:D4');
    worksheet.getCell('A4').value = `Tipo: ${this.getTypeName(reportInfo.type)}`;
    worksheet.getCell('A4').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A5:D5');
    worksheet.getCell('A5').value = `Generado: ${new Date().toLocaleDateString('es-ES')}`;
    worksheet.getCell('A5').alignment = { horizontal: 'center' };
  }

  addFinancialExcelContent(worksheet, data) {
    // Resumen
    worksheet.getCell('A7').value = 'Resumen Financiero';
    worksheet.getCell('A7').font = { bold: true, size: 14 };

    worksheet.getCell('A8').value = 'Total de Facturas:';
    worksheet.getCell('B8').value = data.summary.totalInvoices;

    worksheet.getCell('A9').value = 'Facturas Pagadas:';
    worksheet.getCell('B9').value = data.summary.paidInvoices;

    worksheet.getCell('A10').value = 'Facturas Pendientes:';
    worksheet.getCell('B10').value = data.summary.pendingInvoices;

    // Tabla de facturas
    if (data.invoices && data.invoices.length > 0) {
      const startRow = 12;
      worksheet.getCell(`A${startRow}`).value = 'Detalle de Facturas';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };

      const headers = ['Paciente', 'Fecha', 'Total', 'Estado', 'Método de Pago'];
      headers.forEach((header, index) => {
        worksheet.getCell(`${String.fromCharCode(65 + index)}${startRow + 1}`).value = header;
        worksheet.getCell(`${String.fromCharCode(65 + index)}${startRow + 1}`).font = { bold: true };
      });

      data.invoices.forEach((invoice, index) => {
        const row = startRow + 2 + index;
        worksheet.getCell(`A${row}`).value = invoice.patient_name;
        worksheet.getCell(`B${row}`).value = invoice.invoice_date;
        worksheet.getCell(`C${row}`).value = invoice.total_services;
        worksheet.getCell(`D${row}`).value = invoice.status;
        worksheet.getCell(`E${row}`).value = invoice.payment_method;
      });
    }
  }

  addAppointmentsExcelContent(worksheet, data) {
    // Resumen
    worksheet.getCell('A6').value = 'Resumen de Citas';
    worksheet.getCell('A6').font = { bold: true, size: 14 };

    worksheet.getCell('A7').value = 'Total de Citas:';
    worksheet.getCell('B7').value = data.statistics.total;

    worksheet.getCell('A8').value = 'Confirmadas:';
    worksheet.getCell('B8').value = data.statistics.confirmed;

    worksheet.getCell('A9').value = 'Pendientes:';
    worksheet.getCell('B9').value = data.statistics.pending;

    worksheet.getCell('A10').value = 'Completadas:';
    worksheet.getCell('B10').value = data.statistics.completed;

    // Tabla de citas
    if (data.appointments && data.appointments.length > 0) {
      const startRow = 13;
      worksheet.getCell(`A${startRow}`).value = 'Detalle de Citas';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };

      const headers = ['Paciente', 'Fecha', 'Hora', 'Estado', 'Motivo'];
      headers.forEach((header, index) => {
        worksheet.getCell(`${String.fromCharCode(65 + index)}${startRow + 1}`).value = header;
        worksheet.getCell(`${String.fromCharCode(65 + index)}${startRow + 1}`).font = { bold: true };
      });

      data.appointments.forEach((appointment, index) => {
        const row = startRow + 2 + index;
        worksheet.getCell(`A${row}`).value = appointment.patient_name;
        worksheet.getCell(`B${row}`).value = appointment.appointment_date;
        worksheet.getCell(`C${row}`).value = appointment.appointment_time;
        worksheet.getCell(`D${row}`).value = appointment.status;
        worksheet.getCell(`E${row}`).value = appointment.reason;
      });
    }
  }

  addPatientsExcelContent(worksheet, data) {
    // Resumen
    worksheet.getCell('A6').value = 'Resumen de Pacientes';
    worksheet.getCell('A6').font = { bold: true, size: 14 };

    worksheet.getCell('A7').value = 'Total de Pacientes:';
    worksheet.getCell('B7').value = data.statistics.total;

    worksheet.getCell('A8').value = 'Activos:';
    worksheet.getCell('B8').value = data.statistics.active;

    worksheet.getCell('A9').value = 'Pendientes:';
    worksheet.getCell('B9').value = data.statistics.pending;

    worksheet.getCell('A10').value = 'Con Seguro:';
    worksheet.getCell('B10').value = data.statistics.withInsurance;

    // Tabla de pacientes
    if (data.patients && data.patients.length > 0) {
      const startRow = 13;
      worksheet.getCell(`A${startRow}`).value = 'Detalle de Pacientes';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };

      const headers = ['Nombre', 'Cédula', 'Email', 'Teléfono', 'Estado', 'Seguro'];
      headers.forEach((header, index) => {
        worksheet.getCell(`${String.fromCharCode(65 + index)}${startRow + 1}`).value = header;
        worksheet.getCell(`${String.fromCharCode(65 + index)}${startRow + 1}`).font = { bold: true };
      });

      data.patients.forEach((patient, index) => {
        const row = startRow + 2 + index;
        worksheet.getCell(`A${row}`).value = patient.name;
        worksheet.getCell(`B${row}`).value = patient.cedula;
        worksheet.getCell(`C${row}`).value = patient.email;
        worksheet.getCell(`D${row}`).value = patient.phone;
        worksheet.getCell(`E${row}`).value = patient.status;
        worksheet.getCell(`F${row}`).value = patient.insurance_provider;
      });
    }
  }

  addMedicalExcelContent(worksheet, data) {
    // Resumen
    worksheet.getCell('A6').value = 'Resumen Médico';
    worksheet.getCell('A6').font = { bold: true, size: 14 };

    worksheet.getCell('A7').value = 'Total de Registros:';
    worksheet.getCell('B7').value = data.statistics.total;

    worksheet.getCell('A8').value = 'Completos:';
    worksheet.getCell('B8').value = data.statistics.complete;

    worksheet.getCell('A9').value = 'Pendientes:';
    worksheet.getCell('B9').value = data.statistics.pending;

    worksheet.getCell('A10').value = 'Tasa de Completitud:';
    worksheet.getCell('B10').value = `${data.summary.completionRate}%`;

    // Tabla de registros médicos
    if (data.medicalRecords && data.medicalRecords.length > 0) {
      const startRow = 13;
      worksheet.getCell(`A${startRow}`).value = 'Detalle de Registros Médicos';
      worksheet.getCell(`A${startRow}`).font = { bold: true, size: 12 };

      const headers = ['Paciente', 'Fecha', 'Tipo', 'Diagnóstico', 'Estado'];
      headers.forEach((header, index) => {
        worksheet.getCell(`${String.fromCharCode(65 + index)}${startRow + 1}`).value = header;
        worksheet.getCell(`${String.fromCharCode(65 + index)}${startRow + 1}`).font = { bold: true };
      });

      data.medicalRecords.forEach((record, index) => {
        const row = startRow + 2 + index;
        worksheet.getCell(`A${row}`).value = record.patient_name;
        worksheet.getCell(`B${row}`).value = record.record_date;
        worksheet.getCell(`C${row}`).value = record.type;
        worksheet.getCell(`D${row}`).value = record.diagnosis;
        worksheet.getCell(`E${row}`).value = record.status;
      });
    }
  }

  // Métodos auxiliares para CSV
  generateFinancialCSV(data) {
    let csv = 'Tipo,Reporte Financiero\n';
    csv += 'Total Facturas,Facturas Pagadas,Facturas Pendientes\n';
    csv += `${data.summary.totalInvoices},${data.summary.paidInvoices},${data.summary.pendingInvoices}\n\n`;
    
    if (data.invoices && data.invoices.length > 0) {
      csv += 'Paciente,Fecha,Total,Estado,Método de Pago\n';
      data.invoices.forEach(invoice => {
        csv += `"${invoice.patient_name}","${invoice.invoice_date}",${invoice.total_services},"${invoice.status}","${invoice.payment_method}"\n`;
      });
    }
    
    return csv;
  }

  generateAppointmentsCSV(data) {
    let csv = 'Tipo,Reporte de Citas\n';
    csv += 'Total,Confirmadas,Pendientes,Completadas,Canceladas\n';
    csv += `${data.statistics.total},${data.statistics.confirmed},${data.statistics.pending},${data.statistics.completed},${data.statistics.cancelled}\n\n`;
    
    if (data.appointments && data.appointments.length > 0) {
      csv += 'Paciente,Fecha,Hora,Estado,Motivo\n';
      data.appointments.forEach(appointment => {
        csv += `"${appointment.patient_name}","${appointment.appointment_date}","${appointment.appointment_time}","${appointment.status}","${appointment.reason}"\n`;
      });
    }
    
    return csv;
  }

  generatePatientsCSV(data) {
    let csv = 'Tipo,Reporte de Pacientes\n';
    csv += 'Total,Activos,Pendientes,Inactivos,Con Seguro\n';
    csv += `${data.statistics.total},${data.statistics.active},${data.statistics.pending},${data.statistics.inactive},${data.statistics.withInsurance}\n\n`;
    
    if (data.patients && data.patients.length > 0) {
      csv += 'Nombre,Cédula,Email,Teléfono,Estado,Seguro\n';
      data.patients.forEach(patient => {
        csv += `"${patient.name}","${patient.cedula}","${patient.email}","${patient.phone}","${patient.status}","${patient.insurance_provider}"\n`;
      });
    }
    
    return csv;
  }

  generateMedicalCSV(data) {
    let csv = 'Tipo,Reporte Médico\n';
    csv += 'Total,Completos,Pendientes,Tasa Completitud\n';
    csv += `${data.statistics.total},${data.statistics.complete},${data.statistics.pending},${data.summary.completionRate}%\n\n`;
    
    if (data.medicalRecords && data.medicalRecords.length > 0) {
      csv += 'Paciente,Fecha,Tipo,Diagnóstico,Estado\n';
      data.medicalRecords.forEach(record => {
        csv += `"${record.patient_name}","${record.record_date}","${record.type}","${record.diagnosis}","${record.status}"\n`;
      });
    }
    
    return csv;
  }

  // Métodos para reporte de facturación por seguros
  addInsuranceBillingContent(doc, data) {
    doc.fontSize(14).text('Reporte de Facturación por Seguros', { underline: true }).moveDown();
    const providerCodesText = getProviderCodesText(data.insuranceBilling);
    // Campos manuales (código del prestador se rellena según proveedores en el reporte)
    doc.fontSize(12)
       .text('Número comprobante fiscal: ____________________')
       .text(`Código del prestador de servicio: ${providerCodesText || '____________________'}`)
       .moveDown();
    
    // Resumen
    doc.fontSize(12)
       .text(`Total de Servicios: ${data.summary.totalServices}`)
       .text(`Valor Total: $${data.summary.totalValue}`)
       .text(`Proveedores de Seguro: ${data.summary.providersCount}`)
       .text(`Proveedor Principal: ${data.summary.topProvider || 'N/A'}`)
       .moveDown();

    // Tabla de servicios
    if (data.insuranceBilling && data.insuranceBilling.length > 0) {
      doc.fontSize(12).text('Detalle de Servicios:', { underline: true }).moveDown();
      
      data.insuranceBilling.slice(0, 20).forEach((service, index) => {
        doc.fontSize(10)
           .text(`${service["No"]}. ${service["Afiliado"]} - ${service["Tipo de Servicio"]}`)
           .text(`   Fecha: ${new Date(service["Fecha del Servicio"]).toLocaleDateString('es-ES')}`)
           .text(`   Valor: $${service["Valor Unitario"]}`)
           .text(`   Seguro: ${service["Proveedor de Seguro"] || 'N/A'}`)
           .moveDown(0.5);
      });
      
      if (data.insuranceBilling.length > 20) {
        doc.fontSize(10).text(`... y ${data.insuranceBilling.length - 20} servicios más`, { italic: true });
      }
      
      // Agregar total al final
      doc.moveDown()
         .fontSize(12)
         .text(`TOTAL GENERAL: $${data.summary.totalValueSum}`, { align: 'right' });
    }
  }

  addInsuranceBillingExcelContent(worksheet, data) {
    // Título principal
    worksheet.addRow(['Reporte de Facturación por Seguros']);
    worksheet.getRow(1).getCell(1).font = { size: 16, bold: true };
    worksheet.addRow([]);
    
    const providerCodesText = getProviderCodesText(data.insuranceBilling);
    worksheet.addRow(['Número comprobante fiscal:', '____________________']);
    worksheet.getRow(3).getCell(1).font = { bold: true };
    worksheet.addRow(['Código del prestador de servicio:', providerCodesText || '____________________']);
    worksheet.getRow(4).getCell(1).font = { bold: true };
    worksheet.addRow([]);
    
    // Resumen
    worksheet.addRow(['Resumen']);
    worksheet.getRow(6).getCell(1).font = { size: 14, bold: true };
    worksheet.addRow(['Total de Servicios', data.summary.totalServices]);
    worksheet.addRow(['Valor Total', `$${data.summary.totalValue}`]);
    worksheet.addRow(['Proveedores de Seguro', data.summary.providersCount]);
    worksheet.addRow(['Proveedor Principal', data.summary.topProvider || 'N/A']);
    worksheet.addRow([]);

    if (data.insuranceBilling && data.insuranceBilling.length > 0) {
      // Encabezados de la tabla
      const headerRow = worksheet.addRow([
        'No',
        'Afiliado',
        'NSS o Cédula',
        'No. Autorización',
        'Fecha del Servicio',
        'Tipo de Servicio',
        'Valor Unitario',
        'Clínica',
        'Doctor',
        'Proveedor de Seguro'
      ]);
      
      // Estilo para encabezados
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6E6E6' }
        };
      });

      // Datos
      data.insuranceBilling.forEach(service => {
        worksheet.addRow([
          service["No"],
          service["Afiliado"],
          service["NSS o Cédula"] || '',
          service["No. Autorización"],
          new Date(service["Fecha del Servicio"]).toLocaleDateString('es-ES'),
          service["Tipo de Servicio"],
          parseFloat(service["Valor Unitario"]) || 0,
          service["Clínica"],
          service["Doctor"],
          service["Proveedor de Seguro"] || ''
        ]);
      });
      
      // Agregar fila de suma
      const currentRow = worksheet.rowCount + 1;
      worksheet.addRow([]);
      const sumRow = worksheet.addRow(['', '', '', '', '', 'TOTAL:', `$${data.summary.totalValueSum}`, '', '', '']);
      sumRow.getCell(6).font = { bold: true };
      sumRow.getCell(7).font = { bold: true };
      sumRow.getCell(7).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' }
      };
    }
    
    // Auto-ajustar columnas
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
    worksheet.getColumn(2).width = 25; // Afiliado
    worksheet.getColumn(6).width = 20; // Tipo de Servicio
  }

  generateInsuranceBillingCSV(data) {
    const providerCodesText = getProviderCodesText(data.insuranceBilling);
    let csv = 'Reporte de Facturación por Seguros\n\n';
    csv += 'Número comprobante fiscal:,____________________\n';
    csv += `Código del prestador de servicio:,${providerCodesText || '____________________'}\n\n`;
    csv += 'Resumen\n';
    csv += 'Total Servicios,Valor Total,Proveedores,Proveedor Principal\n';
    csv += `${data.summary.totalServices},${data.summary.totalValue},${data.summary.providersCount},${data.summary.topProvider || 'N/A'}\n\n`;
    
    if (data.insuranceBilling && data.insuranceBilling.length > 0) {
      csv += 'No,Afiliado,NSS o Cédula,No. Autorización,Fecha del Servicio,Tipo de Servicio,Valor Unitario,Clínica,Doctor,Proveedor de Seguro\n';
      data.insuranceBilling.forEach(service => {
        csv += `${service["No"]},"${service["Afiliado"]}","${service["NSS o Cédula"] || ''}","${service["No. Autorización"]}","${new Date(service["Fecha del Servicio"]).toLocaleDateString('es-ES')}","${service["Tipo de Servicio"]}",${service["Valor Unitario"]},"${service["Clínica"]}","${service["Doctor"]}","${service["Proveedor de Seguro"] || ''}"\n`;
      });
      
      // Agregar fila de suma
      csv += '\n,,,,,TOTAL:,' + data.summary.totalValueSum + ',,,\n';
    }
    
    return csv;
  }

  // Utilidades
  getTypeName(type) {
    const types = {
      'financial': 'Financiero',
      'appointments': 'Citas',
      'patients': 'Pacientes',
      'medical': 'Médico',
      'insurance_billing': 'Facturación por Seguros'
    };
    return types[type] || type;
  }

  // Limpiar archivos antiguos (más de 7 días)
  async cleanupOldFiles() {
    try {
      const files = fs.readdirSync(this.reportsDir);
      const now = Date.now();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      files.forEach(file => {
        const filePath = path.join(this.reportsDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > sevenDays) {
          fs.unlinkSync(filePath);
          console.log(`Archivo eliminado: ${file}`);
        }
      });
    } catch (error) {
      console.error('Error limpiando archivos:', error);
    }
  }
}

module.exports = ReportGenerator;
