// Configuración de tipos de citas por clínica
export interface AppointmentTypeConfig {
  value: string;
  label: string;
}

// Tipos generales para todas las clínicas
export const generalAppointmentTypes: AppointmentTypeConfig[] = [
  { value: "Consulta General", label: "Consulta General" },
  { value: "Seguimiento", label: "Seguimiento" },
  { value: "Emergencia", label: "Emergencia" },
  { value: "Control", label: "Control" },
]

// Tipos específicos para las clínicas del doctor Luis
export const luisClinicAppointmentTypes: AppointmentTypeConfig[] = [
  { value: "Consulta", label: "Consulta" },
  { value: "Resultados", label: "Resultados" },
  { value: "Evaluación Prequirúrgica", label: "Evaluación Prequirúrgica" },
  { value: "Evaluación Prequirúrgica Cirugía Plástica", label: "Evaluación Prequirúrgica Cirugía Plástica" },
  { value: "Ecocardiograma", label: "Ecocardiograma" },
  { value: "Otros", label: "Otros" },
]

// IDs de las clínicas del doctor Luis
export const luisClinicIds = [
  "c5a2ba38-372d-4954-827d-ab0133e637b9", // Centro Médico Elohim
  "9a0edec7-27a9-47e7-bff9-76938a733a48", // Centro Médico Haina
  "a001cd39-2d54-4525-abf2-329ca942ba41", // Clínica Abreu
]

// Función para obtener los tipos de citas según la clínica
export function getAppointmentTypes(clinicId: string | null): AppointmentTypeConfig[] {
  if (!clinicId) {
    return generalAppointmentTypes;
  }
  
  return luisClinicIds.includes(clinicId) 
    ? luisClinicAppointmentTypes 
    : generalAppointmentTypes;
}

// Función para obtener los tipos de citas según el usuario y clínica seleccionada
export function getAppointmentTypesForUser(
  userEmail: string | null, 
  selectedClinicId: string | null
): AppointmentTypeConfig[] {
  // Si no hay usuario, usar tipos generales
  if (!userEmail) {
    return generalAppointmentTypes;
  }

  // Emails del doctor Luis y sus secretarias
  const luisTeamEmails = [
    "siul-012@hotmail.com", // Dr. Luis
    "santanivar1@gmail.com", // Santa Nivar
    "ramosyulianny02@gmail.com", // Cristi Ramos
    "lorenpeguero12@gmail.com", // Loreleiby Peguero
  ];

  // Si el usuario es del equipo del doctor Luis
  if (luisTeamEmails.includes(userEmail)) {
    // Si hay clínica seleccionada, verificar que sea una de sus clínicas
    if (selectedClinicId) {
      // Si está en una de sus clínicas, usar tipos específicos
      if (luisClinicIds.includes(selectedClinicId)) {
        return luisClinicAppointmentTypes;
      }
      // Si está en otra clínica, usar tipos generales
      return generalAppointmentTypes;
    }
    // Si no hay clínica seleccionada, usar tipos específicos (comportamiento por defecto)
    return luisClinicAppointmentTypes;
  }

  // Para otros usuarios, usar tipos generales
  return generalAppointmentTypes;
}
