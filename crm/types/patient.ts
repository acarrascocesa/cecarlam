export interface Patient {
  id: string
  clinicId: string
  name: string
  email: string
  phone: string
  cedula: string
  dateOfBirth: Date | null
  gender: "Masculino" | "Femenino" | "Otro"
  address: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  insuranceProvider: string
  insuranceNumber: string
  bloodType: string
  allergies: string[]
  chronicConditions: string[]
  status: "Activo" | "Pendiente" | "Inactivo"
  avatarUrl: string
  notes: string
  createdAt: Date
  updatedAt: Date
  clinicName?: string
  viewMode?: "unified" | "separated"
}
