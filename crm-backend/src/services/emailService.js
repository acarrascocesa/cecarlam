// src/services/emailService.js
const nodemailer = require('nodemailer');
const { convert } = require('html-to-text');
const pool = require('../config/database');
const puppeteer = require('puppeteer');

// Configurar transportador SMTP para Outlook con autenticación moderna
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  requireTLS: true,
  secureConnection: false
});

// Función para reemplazar variables en plantillas
const replaceTemplateVariables = (template, variables) => {
  let result = template;
  
  // Reemplazar todas las variables {{variable_name}}
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  
  return result;
};

// Función para dividir el contenido en páginas por medicamentos/servicios (igual al frontend)
const splitContentIntoPages = (content, maxItemsPerPage = 6) => {
  // Dividir por líneas y filtrar líneas vacías
  const lines = content.split('\n').filter(line => line.trim() !== '')
  const pages = []
  let currentPage = []
  let currentItem = []
  let itemCount = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmedLine = line.trim()
    
    // Detectar si es un nuevo medicamento/servicio
    const isNewItem = 
      /^\s*\d+\./.test(trimmedLine) || // Empieza con espacios + número (1., 2., etc.)
      (/^[A-Z][a-z]+/.test(trimmedLine) && !/^(Por|Para|Tomar|Aplicar|Usar|Cada|Durante|Por|Hasta|Instrucciones|Uso)/.test(trimmedLine)) || // Nombre de medicamento
      (trimmedLine.length > 0 && i === 0) // Primera línea siempre cuenta como item
    
    // Si es un nuevo item y ya tenemos el máximo, crear nueva página
    if (isNewItem && itemCount >= maxItemsPerPage && currentPage.length > 0) {
      // Agregar el item actual a la página
      if (currentItem.length > 0) {
        currentPage.push(currentItem.join('\n'))
      }
      pages.push(currentPage.join('\n\n'))
      currentPage = []
      currentItem = []
      itemCount = 0
    }
    
    // Si es un nuevo item, agregar el item anterior a la página actual
    if (isNewItem && currentItem.length > 0) {
      currentPage.push(currentItem.join('\n'))
      currentItem = []
      itemCount++
    }
    
    // Agregar línea al item actual
    currentItem.push(line)
  }
  
  // Agregar el último item a la página actual
  if (currentItem.length > 0) {
    currentPage.push(currentItem.join('\n'))
    itemCount++
  }
  
  // Agregar la última página si tiene contenido
  if (currentPage.length > 0) {
    pages.push(currentPage.join('\n\n'))
  }
  
  return pages
}

// Función para calcular la edad del paciente
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "N/A";
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Función para generar el HTML de una receta médica (igual al frontend)
const generatePrescriptionHTML = (prescription, patient, doctor, clinic, signatureType = 'pediatra') => {
  // Dividir el contenido en páginas
  const contentPages = splitContentIntoPages(prescription.prescription_text || prescription.medications || prescription.content || '', 6);
  
  // Determinar qué diseño usar basado en el doctor
  const isLinda = doctor.name.toLowerCase().includes("linda");
  
  // Fecha de la prescripción
  const prescriptionDateStr = new Date(prescription.prescription_date || prescription.created_at).toLocaleDateString("es-DO", { day: "2-digit", month: "2-digit", year: "numeric" });
  
  // Edad del paciente
  const patientAge = calculateAge(patient.dateOfBirth);
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receta Médica</title>
      <style>
        @media print {
          body { 
            margin: 0; 
            padding: 0;
            background: white;
          }
          .prescription-container { 
            width: 100%; 
            max-width: none; 
            margin: 0; 
            padding: 0;
            box-shadow: none;
            background: white;
          }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .prescription-page { 
            page-break-after: always; 
            height: 297mm; /* Altura A4 */
            width: 210mm; /* Ancho A4 */
            margin: 0;
            padding: 0;
          }
          .prescription-page:last-child { 
            page-break-after: auto; 
          }
          @page {
            margin: 0;
            size: A4;
          }
          body::before,
          body::after {
            display: none !important;
          }
        }
        
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background: white;
        }
        
        .prescription-container {
          width: 100%;
          margin: 0;
          padding: 0;
          background: white;
        }
        
        .prescription-page {
          height: 297mm; /* Altura A4 */
          width: 210mm; /* Ancho A4 */
          margin: 0 auto;
          background: white;
          position: relative;
        }
      </style>
    </head>
    <body>
      <div class="prescription-container">
        ${contentPages.map((pageContent, pageIndex) => `
          <div class="prescription-page" ${pageIndex > 0 ? 'style="page-break-before: always;"' : ''}>
            ${isLinda ? `
              <!-- Diseño de Linda optimizado para PDF (nuevo formato) -->
              <div style="width: 100%; height: 100%; background: white; border: 0; display: flex; flex-direction: column;">
                <!-- Header Compacto con Logo y Título -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: white; border-bottom: 1px solid #d1d5db; position: relative;">
                  <div style="flex: 1;"></div>
                  <div style="text-align: center; flex: 1;">
                    ${contentPages.length > 1 ? `<div style="position: absolute; top: 50%; transform: translateY(-50%); left: 10px; color: #000000; font-size: 11px; font-weight: bold;">Página ${pageIndex + 1} de ${contentPages.length}</div>` : ''}
                    <h1 style="font-size: 19px; font-family: 'Dancing Script', 'Great Vibes', 'Allura', 'Lucida Calligraphy', cursive; color: #000000; font-style: italic; margin: 0; font-weight: bold;">Dra. Linda Abreu</h1>
                    <p style="color: #6b7280; font-size: 11px; font-weight: 500; margin: 0;">Pediatra - Alergóloga</p>
                  </div>
                  <div style="width: 120px; height: 120px; flex: 1; display: flex; justify-content: flex-end; margin-right: -20px;">
                    <img src="https://cecarlam.com/logo-linda.jpeg" alt="Dra. Linda Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                  </div>
                </div>

                <!-- Información del Paciente -->
                <div style="padding: 0 20px 6px; background: #f9fafb; border-top: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db;">
                  <div style="margin: 6px 0;">
                    <div>
                      <span style="font-weight: bold; color: #374151; font-size: 11px;">NOMBRE: </span>
                      <span style="color: #6b7280; font-size: 11px;">${patient.name.toUpperCase()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 3px;">
                      <div>
                        <span style="font-weight: bold; color: #374151; font-size: 11px;">FECHA: </span>
                        <span style="color: #6b7280; font-size: 11px;">${prescriptionDateStr}</span>
                      </div>
                      <div>
                        <span style="font-weight: bold; color: #374151; font-size: 11px;">EDAD: </span>
                        <span style="color: #6b7280; font-size: 11px;">${patientAge} años</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contenido de la Prescripción -->
                <div style="padding: 12px; background: white; flex: 1; display: flex; flex-direction: column;">
                  <div style="font-size: 36px; font-family: serif; color: #9ca3af; margin-bottom: 6px; font-style: italic;">Rx/</div>

                  <!-- Área de lectura con altura fija -->
                  <div style="margin: 0; flex: 1; position: relative;">
                                         <!-- Marca de agua con el logo de Linda -->
                     <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none; z-index: 0;">
                       <img src="https://cecarlam.com/logo-linda.jpeg" alt="Marca de agua Linda" style="width: 300px; height: 300px; opacity: 0.15; object-fit: contain;" />
                     </div>
                    
                    <div style="width: 100%; height: 450px; font-size: 14px; line-height: 1.6; font-family: Georgia, serif; padding: 12px 12px 12px 0; border: 0; background: transparent; white-space: pre-line; word-wrap: break-word; text-indent: 0; margin-left: 0; padding-left: 0; position: relative; z-index: 10;">
                      ${pageContent || "Escriba aquí las indicaciones médicas, medicamentos, dosis, frecuencia, etc..."}
                    </div>
                  </div>

                  <!-- Firma del Doctor - Siempre visible -->
                  <div style="display: flex; justify-content: center; margin: 40px 0 8px 0;">
                    <div style="text-align: center;">
                                             <div style="width: 700px; height: 180px; margin-bottom: 4px; position: relative;">
                         <img src="https://cecarlam.com/sello-linda-${signatureType}.png" alt="Firma Dra. Linda" style="width: 100%; height: 100%; object-fit: contain;" />
                       </div>
                       <div style="font-size: 12px; font-weight: 600; color: #000000; font-family: 'Dancing Script', 'Great Vibes', 'Allura', 'Lucida Calligraphy', cursive; margin-top: 8px;">${doctor.name}</div>
                       <div style="font-size: 12px; color: #6b7280;">${signatureType === 'pediatra' ? 'Pediatra' : 'Alergología - Inmunología'} • EXQ. 478-11</div>
                    </div>
                  </div>
                </div>

                <!-- Footer Compacto con Información de Clínicas -->
                <div style="background: #f9fafb; padding: 10px; font-size: 10px; color: #6b7280; border-top: 1px solid #d1d5db;">
                  <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                    <div>
                      <div style="font-weight: 600; color: #374151; font-size: 10px;">CLÍNICA ABREU</div>
                      <div style="color: #6b7280; font-size: 9px; margin-bottom: 4px;">Edificio Lugo 2 do piso, Calle Fabio Fiallo #55, Gazcue, S.D 10206.</div>
                      <div style="font-size: 9px; display: flex; align-items: center;">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjQ3MiAxNC4xODJjLS4xOTYgMC0uMzYzLS4wMzItLjUyNy0uMDY5bC0yLjQ1Ny0uNzM5Yy0uMTk2LS4wNTktLjM5Mi0uMDM5LS41NjMuMDQ5bC0xLjA3OS44NzVjLS4xNDcuMTE4LS4zMzMuMDk4LS40NTItLjA0OWwtLjQ5LS0uNTg4Yy0uMTE5LS4xNDctLjExOS0uMzMzIDAtLjQ4bDEuMDc5LTEuMDc5Yy4wODgtLjA4OC4xMDgtLjM2Ny4wNDktLjU2M2wtLjczOS0yLjQ1N2MtLjA0LS0uMTY0LS4wNjktLjMzMS0uMDY5LS41MjcgMC0uNTUyLjQ0OC0xIDEgMXMuOTk5LS40NDggMS0xeiIgZmlsbD0iIzI1QzM1NCIvPgo8cGF0aCBkPSJNMTIgMkM2LjQ4NyAyIDIgNi40ODcgMiAxMmMwIDEuODI2LjQ4NyAzLjU4NyAxLjM0NyA1LjE3NEwyIDIybDQuODI2LTEuMzQ3QzguNDEzIDIyLjUxMyAxMC4xNzQgMjIgMTIgMjJjNS41MTMgMCAxMC00LjQ4NyAxMC0xMFMxNy41MTMgMiAxMiAyem0wIDE4Yy0xLjY1NyAwLTMuMjE0LS40ODctNC41NzMtMS4zNDdsLS4zNjctLjIxNEw0LjUgMTkuNWwxLjA2MS0yLjU2bC0uMjE0LS4zNjdDNC40ODcgMTUuMjE0IDQgMTMuNjU3IDQgMTJjMC00LjQxNCAzLjU4Ni04IDgtOHM4IDMuNTg2IDggOC0zLjU4NiA4LTggOHoiIGZpbGw9IiMyNUMzNTQiLz4KPC9zdmc+" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;" />
                        (809) 682-4656
                      </div>
                    </div>
                    <div>
                      <div style="font-weight: 600; color: #374151; font-size: 10px;">IRMIE</div>
                      <div style="color: #6b7280; font-size: 9px; margin-bottom: 4px;">Av. Pdte. Billini 48, Baní 94000</div>
                      <div style="font-size: 9px; display: flex; align-items: center;">
                        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE3LjQ3MiAxNC4xODJjLS4xOTYgMC0uMzYzLS4wMzItLjUyNy0uMDY5bC0yLjQ1Ny0uNzM5Yy0uMTk2LS4wNTktLjM5Mi0uMDM5LS41NjMuMDQ5bC0xLjA3OS44NzVjLS4xNDcuMTE4LS4zMzMuMDk4LS40NTItLjA0OWwtLjQ5LS0uNTg4Yy0uMTE5LS4xNDctLjExOS0uMzMzIDAtLjQ4bDEuMDc5LTEuMDc5Yy4wODgtLjA4OC4xMDgtLjM2Ny4wNDktLjU2M2wtLjczOS0yLjQ1N2MtLjA0LS0uMTY0LS4wNjktLjMzMS0uMDY5LS41MjcgMC0uNTUyLjQ0OC0xIDEgMXMuOTk5LS40NDggMS0xeiIgZmlsbD0iIzI1QzM1NCIvPgo8cGF0aCBkPSJNMTIgMkM2LjQ4NyAyIDIgNi40ODcgMiAxMmMwIDEuODI2LjQ4NyAzLjU4NyAxLjM0NyA1LjE3NEwyIDIybDQuODI2LTEuMzQ3QzguNDEzIDIyLjUxMyAxMC4xNzQgMjIgMTIgMjJjNS41MTMgMCAxMC00LjQ4NyAxMC0xMFMxNy41MTMgMiAxMiAyem0wIDE4Yy0xLjY1NyAwLTMuMjE0LS40ODctNC41NzMtMS4zNDdsLS4zNjctLjIxNEw0LjUgMTkuNWwxLjA2MS0yLjU2bC0uMjE0LS4zNjdDNC40ODcgMTUuMjE0IDQgMTMuNjU3IDQgMTJjMC00LjQxNCAzLjU4Ni04IDgtOHM4IDMuNTg2IDggOC0zLjU4NiA4LTggOHoiIGZpbGw9IiMyNUMzNTQiLz4KPC9zdmc+" style="width: 12px; height: 12px; vertical-align: middle; margin-right: 4px;" />
                        (849) 357-4640
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ` : `
              <!-- Diseño de Luis optimizado para PDF -->
              <div style="width: 100%; height: 100%; background: white; border: 0; display: flex; flex-direction: column;">
                <!-- Header Compacto con Logo y Título -->
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px; background: white; border-bottom: 1px solid #d1d5db; position: relative;">
                  <div style="flex: 1;"></div>
                  <div style="text-align: center; flex: 1;">
                    ${contentPages.length > 1 ? `<div style="position: absolute; top: 50%; transform: translateY(-50%); left: 10px; color: #7c3aed; font-size: 11px; font-weight: bold;">Página ${pageIndex + 1} de ${contentPages.length}</div>` : ''}
                    <h1 style="font-size: 18px; font-family: serif; color: #7c3aed; font-style: italic; margin: 0;">Dr. Luis Arturo Castillo Roa</h1>
                    <p style="color: #6b7280; font-size: 11px; font-weight: 500; margin: 0;">Cardiólogo - Internista</p>
                  </div>
                  <div style="width: 120px; height: 120px; flex: 1; display: flex; justify-content: flex-end; margin-right: -20px;">
                    <img src="https://cecarlam.com/doctor-luis-logo.png" alt="Dr. Luis Castillo Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                  </div>
                </div>

                <!-- Información del Paciente -->
                <div style="padding: 0 20px 6px; background: #f9fafb; border-top: 1px solid #d1d5db; border-bottom: 1px solid #d1d5db;">
                  <div style="margin: 6px 0;">
                    <div>
                      <span style="font-weight: bold; color: #374151; font-size: 11px;">NOMBRE: </span>
                      <span style="color: #6b7280; font-size: 11px;">${patient.name.toUpperCase()}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 3px;">
                      <div>
                        <span style="font-weight: bold; color: #374151; font-size: 11px;">FECHA: </span>
                        <span style="color: #6b7280; font-size: 11px;">${prescriptionDateStr}</span>
                      </div>
                      <div>
                        <span style="font-weight: bold; color: #374151; font-size: 11px;">EDAD: </span>
                        <span style="color: #6b7280; font-size: 11px;">${patientAge} años</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contenido de la Prescripción -->
                <div style="padding: 12px; background: white; flex: 1; display: flex; flex-direction: column;">
                  <div style="font-size: 36px; font-family: serif; color: #9ca3af; margin-bottom: 6px; font-style: italic;">Rx/</div>

                  <!-- Área de lectura con altura fija -->
                  <div style="margin: 0; flex: 1;">
                    <div style="width: 100%; height: 450px; font-size: 14px; line-height: 1.6; font-family: Georgia, serif; padding: 12px 12px 12px 0; border: 0; background: white; white-space: pre-wrap; word-wrap: break-word;">
                      ${pageContent || "Escriba aquí las indicaciones médicas, medicamentos, dosis, frecuencia, etc..."}
                    </div>
                  </div>

                  <!-- Firma del Doctor - Siempre visible -->
                  <div style="display: flex; justify-content: center; margin: 40px 0 8px 0;">
                    <div style="text-align: center;">
                      <div style="width: 450px; height: 202px; margin-bottom: 4px; position: relative;">
                        <img src="https://cecarlam.com/sello-luis.png" alt="Firma Dr. Luis Castillo" style="width: 100%; height: 100%; object-fit: contain;" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer Compacto con Información de Clínicas -->
                <div style="background: #f9fafb; padding: 10px; font-size: 10px; color: #6b7280; border-top: 1px solid #d1d5db;">
                  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 8px;">
                    <div>
                      <div style="font-weight: 600; color: #374151; font-size: 10px;">CENTRO MÉDICO ELOHIM</div>
                      <div style="color: #6b7280; font-size: 9px;">Piso 8, AV. Independencia No. 815, Esq. Elvira de Mendoza, Zona Universitaria S. D.</div>
                    </div>
                    <div>
                      <div style="font-weight: 600; color: #374151; font-size: 10px;">CLÍNICA ABREU</div>
                      <div style="color: #6b7280; font-size: 9px;">Edificio Lugo 2 do piso, Calle Fabio Fiallo #55, Gazcue, S.D 10206.</div>
                    </div>
                    <div>
                      <div style="font-weight: 600; color: #374151; font-size: 10px;">CENTRO MÉDICO HAINA</div>
                      <div style="color: #6b7280; font-size: 9px;">Centro Médico Haina 1er piso: Carr. Sánchez Vieja, Bajos de Haina 91000.</div>
                    </div>
                  </div>
                  <div style="margin-top: 8px; padding-top: 6px; border-top: 1px solid #d1d5db;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center;">
                      <div style="font-size: 9px;">
                        <span style="font-weight: 600;">WhatsApp:</span> (849) 357-4640
                      </div>
                      <div style="font-size: 9px;">
                        <span style="font-weight: 600;">Edificio Lugo:</span> (809) 682-4656
                      </div>
                      <div style="font-size: 9px;">
                        <span style="font-weight: 600;">Haina:</span> (809) 555-5678
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            `}
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
};

// Función para convertir HTML a PDF
const htmlToPdf = async (htmlContent) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    return pdf;
  } catch (error) {
    console.error('Error convirtiendo HTML a PDF:', error);
    throw error;
  }
};

// Función para construir el remitente dinámico
const buildFromAddress = (doctorName = null, clinicName = null) => {
  const defaultClinic = process.env.SMTP_FROM_NAME || process.env.CLINIC_NAME || 'CECARLAM';
  const emailAddress = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;
  
  let fromName = clinicName || defaultClinic;
  
  // Si hay doctor, agregarlo al nombre
  if (doctorName) {
    fromName = `${fromName} - ${doctorName}`;
  }
  
  return `"${fromName}" <${emailAddress}>`;
};

// Función base para enviar emails
const sendEmail = async (emailData) => {
  try {
    console.log('📧 Enviando email:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from,
      attachments: emailData.attachments ? emailData.attachments.length : 0
    });

    const mailOptions = {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: convert(emailData.html, {
        wordwrap: 130
      }),
      attachments: emailData.attachments || []
    };

    const result = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email enviado exitosamente:', result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      response: result.response
    };

  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Obtener plantilla por tipo
const getTemplateByType = async (templateType) => {
  try {
    const result = await pool.query(
      'SELECT * FROM email_templates WHERE template_type = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1',
      [templateType]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`No se encontró plantilla activa para: ${templateType}`);
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error obteniendo plantilla:', error);
    throw error;
  }
};



// SERVICIOS DE EMAIL POR TIPO

// 1. Recordatorio de cita
const sendAppointmentReminderEmail = async (appointment, patient, doctor, clinic) => {
  try {
    console.log('📧 Enviando recordatorio de cita:', {
      patient: patient.name,
      email: patient.email,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time
    });

    // Intentar obtener plantilla, si no existe usar contenido por defecto
    let template;
    try {
      template = await getTemplateByType('appointment_reminder');
    } catch (error) {
      console.log('ℹ️ No se encontró plantilla de recordatorio, usando contenido por defecto');
      template = null;
    }
    
    let subject, htmlContent;
    
    if (template) {
      // Usar plantilla de base de datos
      const variables = {
        patient_name: patient.name,
        patient_email: patient.email,
        doctor_name: doctor.name,
        clinic_name: clinic.name,
        appointment_date: new Date(appointment.appointment_date).toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        appointment_time: appointment.appointment_time,
        clinic_phone: clinic.phone || '',
        clinic_address: clinic.address || ''
      };

      subject = replaceTemplateVariables(template.subject_template, variables);
      htmlContent = replaceTemplateVariables(template.html_template, variables);
    } else {
      // Usar contenido por defecto
      const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      subject = `Recordatorio de Cita - ${clinic.name}`;
      
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recordatorio de Cita</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
            .content { padding: 20px; }
            .appointment-details { background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🏥 ${clinic.name}</h2>
              <p>Recordatorio de Cita Médica</p>
            </div>
            
            <div class="content">
              <p>Estimado/a <strong>${patient.name}</strong>,</p>
              
              <p>Le recordamos que tiene programada una cita médica con el Dr. <strong>${doctor.name}</strong>.</p>
              
              <div class="appointment-details">
                <h3>📅 Detalles de la Cita:</h3>
                <p><strong>Fecha:</strong> ${appointmentDate}</p>
                <p><strong>Hora:</strong> ${appointment.appointment_time}</p>
                <p><strong>Clínica:</strong> ${clinic.name}</p>
                <p><strong>Dirección:</strong> ${clinic.address || 'No especificada'}</p>
                <p><strong>Teléfono:</strong> ${clinic.phone || 'No especificado'}</p>
                ${appointment.reason ? `<p><strong>Motivo:</strong> ${appointment.reason}</p>` : ''}
              </div>
              
              <p><strong>Importante:</strong></p>
              <ul>
                <li>Llegue 10 minutos antes de su cita</li>
                <li>Traiga su documento de identidad</li>
                <li>Si no puede asistir, cancele con anticipación</li>
              </ul>
              
              <p>Si tiene alguna pregunta, no dude en contactarnos.</p>
              
              <p>Saludos cordiales,<br>
              <strong>${clinic.name}</strong></p>
            </div>
            
            <div class="footer">
              <p>Este es un recordatorio automático. Por favor, no responda a este correo.</p>
              <p>© ${new Date().getFullYear()} ${clinic.name}. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }
    
    const emailData = {
      from: buildFromAddress(doctor.name, clinic.name),
      to: patient.email,
      subject: subject,
      html: htmlContent
    };

    const result = await sendEmail(emailData);
    
    await logEmailHistory(
      patient.id,
      'Recordatorio',
      result.success ? 'sent' : 'failed',
      patient.email,
      result.success ? null : result.error,
      template ? template.id : null,
      { 
        appointment_id: appointment.id, 
        doctor_id: doctor.id,
        clinic_id: clinic.id,
        automated: true
      }
    );

    return result;
  } catch (error) {
    console.error('❌ Error enviando recordatorio de cita:', error);
    await logEmailHistory(
      patient.id,
      'Recordatorio',
      'failed',
      patient.email,
      error.message
    );
    throw error;
  }
};

// 2. Receta médica
const sendPrescriptionEmail = async (prescription, patient, doctor, clinic) => {
  try {
    const template = await getTemplateByType('prescription_sent');
    
    const variables = {
      patient_name: patient.name,
      patient_email: patient.email,
      doctor_name: doctor.name,
      clinic_name: clinic.name,
      prescription_text: prescription.prescription_text || prescription.medications || prescription.content || 'Ver archivo adjunto',
      prescription_date: new Date(prescription.prescription_date || prescription.created_at).toLocaleDateString('es-ES')
    };

    const subject = replaceTemplateVariables(template.subject_template, variables);
    const htmlContent = replaceTemplateVariables(template.html_template, variables);
    
    // Generar el HTML de la receta usando la función optimizada (igual al frontend)
    // Para Linda, usar 'pediatra' por defecto en emails (se puede cambiar según necesidad)
    const signatureType = doctor.name.toLowerCase().includes("linda") ? 'pediatra' : undefined;
    const prescriptionHTML = generatePrescriptionHTML(prescription, patient, doctor, clinic, signatureType);

    // Convertir HTML a PDF
    const pdfBuffer = await htmlToPdf(prescriptionHTML);
    
    // Crear el adjunto de la receta como PDF
    const prescriptionAttachment = {
      filename: `Receta_${patient.name}_${new Date().toISOString().split('T')[0]}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    };
    
    const emailData = {
      from: buildFromAddress(doctor.name, clinic.name),
      to: patient.email,
      subject: subject,
      html: htmlContent,
      attachments: [prescriptionAttachment]
    };

    const result = await sendEmail(emailData);
    
    await logEmailHistory(
      patient.id,
      'General',
      result.success ? 'sent' : 'failed',
      patient.email,
      result.success ? null : result.error,
      template.id,
      { prescription_id: prescription.id, doctor_id: doctor.id }
    );

    return result;
  } catch (error) {
    await logEmailHistory(
      patient.id,
      'General',
      'failed',
      patient.email,
      error.message
    );
    throw error;
  }
};

// 3. Resultados médicos
const sendMedicalResultsEmail = async (patient, doctor, clinic, resultsData = {}) => {
  try {
    const template = await getTemplateByType('results_ready');
    
    const variables = {
      patient_name: patient.name,
      patient_email: patient.email,
      doctor_name: doctor.name,
      clinic_name: clinic.name,
      results_date: new Date().toLocaleDateString('es-ES'),
      results_type: resultsData.type || 'Resultados médicos'
    };

    const subject = replaceTemplateVariables(template.subject_template, variables);
    const htmlContent = replaceTemplateVariables(template.html_template, variables);
    
    const emailData = {
      from: buildFromAddress(doctor.name, clinic.name),
      to: patient.email,
      subject: subject,
      html: htmlContent
    };

    const result = await sendEmail(emailData);
    
    await logEmailHistory(
      patient.id,
      'results_ready',
      result.success ? 'sent' : 'failed',
      patient.email,
      result.success ? null : result.error,
      template.id,
      { doctor_id: doctor.id, results_data: resultsData }
    );

    return result;
  } catch (error) {
    await logEmailHistory(
      patient.id,
      'results_ready',
      'failed',
      patient.email,
      error.message
    );
    throw error;
  }
};

// 4. Factura
const sendInvoiceEmail = async (invoice, patient, doctor, clinic) => {
  try {
    const template = await getTemplateByType('invoice_sent');
    
    const variables = {
      patient_name: patient.name,
      patient_email: patient.email,
      doctor_name: doctor.name,
      clinic_name: clinic.name,
      invoice_number: invoice.invoice_number || invoice.id,
      invoice_total: invoice.patient_pays || invoice.total_services || 0,
      invoice_date: new Date(invoice.created_at || invoice.invoice_date).toLocaleDateString('es-ES'),
      due_date: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('es-ES') : ''
    };
    
    console.log('📧 Email variables for invoice:', variables);

    const subject = replaceTemplateVariables(template.subject_template, variables);
    const htmlContent = replaceTemplateVariables(template.html_template, variables);
    
    const emailData = {
      from: buildFromAddress(doctor.name, clinic.name),
      to: patient.email,
      subject: subject,
      html: htmlContent
    };

    const result = await sendEmail(emailData);
    
    await logEmailHistory(
      patient.id,
      'General',
      result.success ? 'sent' : 'failed',
      patient.email,
      result.success ? null : result.error,
      template.id,
      { invoice_id: invoice.id, doctor_id: doctor.id }
    );

    return result;
  } catch (error) {
    await logEmailHistory(
      patient.id,
      'General',
      'failed',
      patient.email,
      error.message
    );
    throw error;
  }
};

// Función para registrar el historial de emails
const logEmailHistory = async (patientId, emailType, status, patientEmail, errorMessage = null, templateId = null, metadata = {}) => {
  try {
    const pool = require('../config/database');
    
    // Solo registrar si no hay error o si hay un error específico
    const content = errorMessage || 'Email enviado exitosamente';
    const messageStatus = status === 'sent' ? 'Enviado' : status === 'delivered' ? 'Entregado' : 'Error';
    
    await pool.query(
      `INSERT INTO messages (patient_id, message_type, status, content, message_date, sender_type) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        patientId,
        emailType,
        messageStatus,
        content,
        new Date(),
        'doctor'
      ]
    );
    
    console.log(`✅ Email history logged: ${emailType} - ${messageStatus}`);
  } catch (error) {
    console.error('Error registrando historial de email:', error);
    // No lanzar el error para no interrumpir el flujo principal
  }
};



// Verificar configuración SMTP
const verifyEmailConfig = async () => {
  try {
    const verification = await transporter.verify();
    console.log('✅ Configuración SMTP verificada:', verification);
    return { success: true, message: 'SMTP configurado correctamente' };
  } catch (error) {
    console.error('❌ Error en configuración SMTP:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAppointmentReminderEmail,
  sendPrescriptionEmail,
  sendMedicalResultsEmail,
  sendInvoiceEmail,
  verifyEmailConfig,
  sendEmail, // Para uso directo si es necesario
  replaceTemplateVariables,
  buildFromAddress
};
