import type {
  PrescriptionPrintParams,
  PrescriptionPage,
} from "@/types/prescription";

/**
 * Función para dividir el contenido en páginas por medicamentos/servicios
 * @param content - Texto de la prescripción
 * @param maxItemsPerPage - Máximo número de medicamentos por página (default: 7)
 * @returns Array de páginas con contenido
 */
export const splitContentIntoPages = (
  content: string,
  maxItemsPerPage: number = 6
): string[] => {
  // Normalizar cada línea antes de usarla
  const lines = content
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n") // CRLF -> LF
    .split("\n")
    .map(
      (l) =>
        l
          .replace(/^\uFEFF/, "") // BOM al inicio de línea
          .replace(/^[\u00A0\u2000-\u200B\u202F\u205F\u3000]+/, "") // espacios unicode duros
          .replace(/^\s+/, "") // tabs/espacios normales al inicio
    )
    .filter((l) => l !== "");
  const pages = [];
  let currentPage = [];
  let currentItem = [];
  let itemCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line; // ya viene normalizada

    // Detectar si es un nuevo medicamento/servicio
    const isNewItem =
      /^\s*\d+\./.test(trimmedLine) || // Empieza con espacios + número (1., 2., etc.)
      (/^[A-Z][a-z]+/.test(trimmedLine) &&
        !/^(Por|Para|Tomar|Aplicar|Usar|Cada|Durante|Por|Hasta|Instrucciones|Uso)/.test(
          trimmedLine
        )) || // Nombre de medicamento
      (trimmedLine.length > 0 && i === 0); // Primera línea siempre cuenta como item

    // Si es un nuevo item y ya tenemos el máximo, crear nueva página
    if (isNewItem && itemCount >= maxItemsPerPage && currentPage.length > 0) {
      // Agregar el item actual a la página
      if (currentItem.length > 0) {
        currentPage.push(currentItem.join("\n"));
      }
      pages.push(currentPage.join("\n\n"));
      currentPage = [];
      currentItem = [];
      itemCount = 0;
    }

    // Si es un nuevo item, agregar el item anterior a la página actual
    if (isNewItem && currentItem.length > 0) {
      currentPage.push(currentItem.join("\n"));
      currentItem = [];
      itemCount++;
    }

    // Agregar línea al item actual
    currentItem.push(trimmedLine);
  }

  // Agregar el último item a la página actual
  if (currentItem.length > 0) {
    currentPage.push(currentItem.join("\n"));
    itemCount++;
  }

  // Agregar la última página si tiene contenido
  if (currentPage.length > 0) {
    pages.push(currentPage.join("\n\n"));
  }

  return pages;
};

/**
 * Función para calcular la edad del paciente
 */
const calculateAge = (dateOfBirth: string | Date): number => {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

/**
 * Función para generar el HTML de una receta médica
 * @param params - Parámetros para generar la receta
 * @returns HTML completo de la receta
 */
export const generatePrescriptionHTML = (
  params: PrescriptionPrintParams
): string => {
  const {
    content,
    patient,
    doctor,
    clinic,
    isLinda,
    showSignature = false,
    prescriptionDate,
    signatureType = 'pediatra',
  } = params;

  // Dividir el contenido en páginas
  const contentPages = splitContentIntoPages(content, 6);

  // Fecha de la prescripción
  const prescriptionDateStr = prescriptionDate
    ? new Date(prescriptionDate).toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : new Date().toLocaleDateString("es-DO", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

  // Edad del paciente (texto para mostrar)
  const patientAgeStr = patient.dateOfBirth
    ? `${calculateAge(patient.dateOfBirth)} años`
    : "";

  // Colores y assets según plantilla (Luis = doctor, Linda = doctora)
  const color = isLinda ? "#2F6939" : "#3F6E9F";
  const watermark = isLinda ? "/dra-watermark.png" : "/watermark-heart.png";
  const logo1 = isLinda ? "/dra-mc-logo.png" : "/mc-logo.png";
  const logo2 = isLinda ? "/dra-magnolia.png" : "/magnolia.png";
  const doctorEmail = isLinda ? "dramilypenac@yahoo.es" : "dr.jorgemayobanex@yahoo.es";
  const doctorCell = isLinda ? "849-201-0850" : "";
  const educGrado = "Escuela Latinoamericana de Medicina, La Habana, Cuba.";
  const educPosgrado = isLinda
    ? "Hospital Universitario Arnaldo Milán Castro, Villa Clara, Cuba."
    : "Cardiocentro Che Guevara, Villa Clara, Cuba.";

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Receta Médica</title>
      <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Great+Vibes&family=Allura&display=swap" rel="stylesheet">
      <style>
        @media print {
          body { margin: 0; padding: 0; background: white; }
          .prescription-container { width: 100%; max-width: none; margin: 0; padding: 0; box-shadow: none; background: white; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          .prescription-page { page-break-after: always; height: 297mm; width: 210mm; margin: 0; padding: 0; }
          .prescription-page:last-child { page-break-after: auto; }
          @page { margin: 0; size: A4; }
          body::before, body::after { display: none !important; }
          -webkit-print-color-adjust: exact; print-color-adjust: exact;
        }
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: white; }
        .prescription-container { width: 100%; margin: 0; padding: 0; background: white; }
        .prescription-page { height: 297mm; width: 210mm; margin: 0 auto; background: white; position: relative; }
      </style>
    </head>
    <body>
      <div class="prescription-container">
        ${contentPages
          .map(
            (pageContent, pageIndex) => `
          <div class="prescription-page" ${pageIndex > 0 ? 'style="page-break-before: always;"' : ""}>
            <div style="width: 100%; height: 100%; background: white; border: 2px solid ${color}; border-radius: 8px; display: flex; flex-direction: column;">
              <!-- Header -->
              <div style="padding: 16px; border-bottom: 2px solid ${color}; text-align: center;">
                <h1 style="font-size: 28px; font-family: 'Dancing Script', 'Great Vibes', cursive; color: ${color}; margin: 0 0 4px 0;">${doctor.name}</h1>
                <p style="font-size: 14px; font-weight: 500; color: ${color}; margin: 0 0 8px 0;">${doctor.specialty || ""}</p>
                <div style="font-size: 12px; color: ${color}; margin-bottom: 8px;">Grado: ${educGrado}</div>
                <div style="font-size: 12px; color: ${color}; margin-bottom: 12px;">Posgrado: ${educPosgrado}</div>
                <div style="font-size: 12px; color: ${color}; margin-bottom: 16px;">E-Mail: ${doctorEmail}${doctorCell ? ` | Cel.: ${doctorCell}` : ""}</div>
                <div style="display: flex; justify-content: center; gap: 24px;">
                  <img src="${logo1}" alt="Clínica" style="width: 48px; height: 48px; object-fit: contain;" />
                  <img src="${logo2}" alt="Clínica" style="width: 48px; height: 48px; object-fit: contain;" />
                </div>
                ${contentPages.length > 1 ? `<div style="position: absolute; top: 50%; left: 10px; transform: translateY(-50%); color: ${color}; font-size: 11px;">Página ${pageIndex + 1} de ${contentPages.length}</div>` : ""}
              </div>

              <!-- Contenido -->
              <div style="padding: 24px; flex: 1; position: relative;">
                <div style="font-size: 40px; font-family: serif; color: ${color}; margin-bottom: 16px; font-style: italic;">Rx</div>
                <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; margin-top: 48px;">
                  <img src="${watermark}" alt="Watermark" style="width: 320px; height: 320px; opacity: 0.15; object-fit: contain;" />
                </div>
                <div style="width: 100%; min-height: 350px; font-size: 16px; line-height: 1.8; font-family: Georgia, serif; color: ${color}; white-space: pre-wrap; word-wrap: break-word; padding: 16px; position: relative; z-index: 10;">
                  ${pageContent || "Escriba aquí las indicaciones médicas, medicamentos, dosis, frecuencia, etc..."}
                </div>

                <!-- Firma -->
                <div style="display: flex; justify-content: center; margin: 24px 0 16px 0;">
                  <div style="text-align: center;">
                    ${showSignature && !isLinda ? `<div style="width: 320px; height: 128px; margin-bottom: 8px;"><img src="/sello-luis.png" alt="Firma" style="width: 100%; height: 100%; object-fit: contain;" /></div>` : ""}
                    ${isLinda ? `<div style="width: 320px; height: 128px; margin-bottom: 8px;"><img src="/sello-linda-${signatureType}.png" alt="Firma" style="width: 100%; height: 100%; object-fit: contain;" /></div>` : ""}
                    <div style="font-size: 14px; font-weight: 600; font-family: 'Dancing Script', 'Great Vibes', cursive; color: ${color};">${doctor.name}</div>
                    <div style="font-size: 12px; color: ${color};">${doctor.specialty || ""}</div>
                  </div>
                </div>
              </div>

              <!-- Footer - Datos del paciente -->
              <div style="border-top: 2px solid ${color}; padding: 16px; background: white; margin-top: 8px;">
                <div style="margin-bottom: 8px;">
                  <span style="font-size: 14px; font-weight: bold; color: ${color};">NOMBRE: </span>
                  <span style="font-size: 14px; color: #000000; border-bottom: 1px solid ${color}; display: inline-block; min-width: 300px;">${patient.name.toUpperCase()}</span>
                </div>
                <div style="display: flex; gap: 32px;">
                  <div>
                    <span style="font-size: 14px; font-weight: bold; color: ${color};">EDAD: </span>
                    <span style="font-size: 14px; color: #000000; border-bottom: 1px solid ${color}; display: inline-block; min-width: 100px;">${patientAgeStr}</span>
                  </div>
                  <div>
                    <span style="font-size: 14px; font-weight: bold; color: ${color};">FECHA: </span>
                    <span style="font-size: 14px; color: #000000; border-bottom: 1px solid ${color}; display: inline-block; min-width: 150px;">${prescriptionDateStr}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    </body>
    </html>
  `;
};

/**
 * Función para imprimir una receta médica
 * @param params - Parámetros para imprimir la receta
 */
export const printPrescription = (params: PrescriptionPrintParams): void => {
  const html = generatePrescriptionHTML(params);

  // Abrir nueva ventana con solo la receta
  const printWindow = window.open("", "_blank", "width=800,height=600");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();

    // Esperar a que se cargue el contenido y luego abrir el diálogo de impresión
    printWindow.onload = function () {
      printWindow.print();
    };

    // Fallback: si onload no funciona, intentar después de un breve delay
    setTimeout(() => {
      if (printWindow && !printWindow.closed) {
        printWindow.print();
      }
    }, 500);
  }
};
