// Utilidades para validar prescripciones

/**
 * Validar que una prescripción tenga el contenido mínimo necesario
 */
export const validatePrescription = (
  prescriptionText: string,
  selectedPatientId: string | null
): { isValid: boolean; error?: string } => {
  if (!selectedPatientId) {
    return {
      isValid: false,
      error: "Por favor selecciona un paciente"
    }
  }
  
  if (!prescriptionText || !prescriptionText.trim()) {
    return {
      isValid: false,
      error: "Por favor escribe el contenido de la prescripción"
    }
  }
  
  return { isValid: true }
}

/**
 * Validar que se pueda determinar la clínica
 */
export const validateClinic = (
  clinicId: string | null | undefined
): { isValid: boolean; error?: string } => {
  if (!clinicId) {
    return {
      isValid: false,
      error: "No se pudo determinar la clínica para esta prescripción"
    }
  }
  
  return { isValid: true }
}
