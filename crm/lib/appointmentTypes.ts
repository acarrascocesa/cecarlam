// Tipos de cita para CECARLAM
export interface AppointmentTypeConfig {
  value: string;
  label: string;
}

export const cecarlamAppointmentTypes: AppointmentTypeConfig[] = [
  { value: "Consulta Especializada", label: "Consulta Especializada" },
  { value: "Consulta Cámara Hiperbárica", label: "Consulta Cámara Hiperbárica" },
  { value: "Estudios", label: "Estudios" },
  { value: "Imagenología", label: "Imagenología" },
  { value: "Sesiones Cámara Hiperbárica", label: "Sesiones Cámara Hiperbárica" },
  { value: "Seguimiento", label: "Seguimiento" },
  { value: "Emergencia", label: "Emergencia" },
  { value: "Control", label: "Control" },
];

export function getAppointmentTypes(_clinicId: string | null): AppointmentTypeConfig[] {
  return cecarlamAppointmentTypes;
}

export function getAppointmentTypesForUser(
  _userEmail: string | null,
  _selectedClinicId: string | null
): AppointmentTypeConfig[] {
  return cecarlamAppointmentTypes;
}
