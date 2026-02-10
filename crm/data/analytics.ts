export interface Analytic {
  id: string
  name: string
  genericName: string
  category: "Sangre" | "Orina" | "Cardíacas" | "Pulmonares" | "Imágenes" | "Otros"
  description: string
  instructions: string
  preparation: string
  contraindications: string
  notes: string
  doctorId: string // Asociado al doctor, no a la clínica
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  doctorName?: string
}
