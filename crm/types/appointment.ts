export interface Appointment {
  id: string
  patient: {
    id: string
    name: string
    image?: string
  }
  date: Date | string
  time: string
  duration: number
  status: 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada'
  type: string
  doctor: string
  reason?: string
  notes?: string
  clinicId: string
  createdAt?: string
  updatedAt?: string
}
