// Utilidades para manejo de información de doctores

import { DOCTOR_CONFIGS } from "./constants"

export interface DoctorConfig {
  namePattern: RegExp
  specialty: string
  displayName: string
  prescriptionTemplate: 'linda' | 'luis' | 'default'
}

/**
 * Obtener configuración de doctor basada en el nombre
 */
export const getDoctorConfig = (doctorName: string): DoctorConfig | null => {
  if (!doctorName) return null
  
  const config = DOCTOR_CONFIGS.find(cfg => 
    cfg.namePattern.test(doctorName)
  )
  
  return config || null
}

/**
 * Determinar si es un doctor específico
 */
export const isDoctorType = (
  doctorName: string,
  type: 'linda' | 'luis'
): boolean => {
  const config = getDoctorConfig(doctorName)
  return config?.prescriptionTemplate === type
}

/**
 * Obtener especialidad del doctor
 */
export const getDoctorSpecialty = (
  doctorName: string,
  userSpecialty?: string | null
): string => {
  const config = getDoctorConfig(doctorName)
  return config?.specialty || userSpecialty || "Medicina General"
}

/**
 * Obtener nombre de visualización del doctor
 */
export const getDoctorDisplayName = (
  doctorName: string,
  fallbackName?: string | null
): string => {
  const config = getDoctorConfig(doctorName)
  return config?.displayName || doctorName || fallbackName || "Dr. Médico"
}
