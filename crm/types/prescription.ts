export interface Patient {
  id: string
  name: string
  dateOfBirth?: string | Date
  email?: string
  phone?: string
}

export interface Doctor {
  id: string
  name: string
  licenseNumber?: string
  specialty?: string
}

export interface Clinic {
  clinic_id: string
  clinic_name: string
  clinic_address: string
  clinic_phone: string
  clinic_email?: string
}

export interface PrescriptionPrintParams {
  content: string
  patient: Patient
  doctor: Doctor
  clinic: Clinic
  isLinda: boolean
  showSignature?: boolean
  prescriptionDate?: string | Date
  signatureType?: 'pediatra' | 'alergolo'
}

export interface PrescriptionPage {
  content: string
  pageNumber: number
  totalPages: number
}
