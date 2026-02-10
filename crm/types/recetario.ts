// Tipos para el módulo de recetario

export interface Medication {
  id: string
  name: string
  genericName?: string
  category?: string
  dosage?: string
  frequency?: string
  typicalDuration?: string
  instructions?: string
}

export interface Service {
  id: string
  name: string
  description?: string
  category?: string
  basePrice?: number
  insuranceType?: string
  insuranceCoveragePercentage?: number
}

export interface Analytic {
  id: string
  name: string
  genericName?: string
  category?: string
  description?: string
  instructions?: string
  preparation?: string
  contraindications?: string
}

export interface PrescriptionStatus {
  ACTIVE: 'Activa'
  COMPLETED: 'Completada'
  CANCELLED: 'Cancelada'
}

export interface DoctorConfig {
  namePattern: RegExp
  specialty: string
  displayName: string
  prescriptionTemplate: 'linda' | 'luis' | 'default'
}
