// lib/clinicDisplayNames.ts

/** ID de la única clínica CECARLAM (centro único) */
export const CECARLAM_CLINIC_ID = 'a0000001-0000-4000-8000-000000000001'

export interface ClinicDisplayName {
  clinic_id: string
  display_name: string
  doctor_name: string
}

// Función para obtener nombres de clínicas específicos por usuario
export function getClinicDisplayNames(userEmail: string, clinics: any[]): ClinicDisplayName[] {
  // Para Loreleiby, mostrar nombres más descriptivos
  if (userEmail === 'lorenpeguero12@gmail.com') {
    return clinics.map(clinic => {
      // Identificar clínicas por nombre y asignar nombres descriptivos
      if (clinic.clinic_name === 'Clínica Abreu') {
        return {
          clinic_id: clinic.clinic_id,
          display_name: 'Clínica Abreu - Dr. Luis',
          doctor_name: 'Dr. Luis Castillo'
        }
      } else if (clinic.clinic_name === 'Clínica Abreu.') {
        return {
          clinic_id: clinic.clinic_id,
          display_name: 'Clínica Abreu - Dra. Linda',
          doctor_name: 'Dra. Linda Castillo'
        }
      } else if (clinic.clinic_name === 'IRMIE') {
        return {
          clinic_id: clinic.clinic_id,
          display_name: 'IRMIE - Dra. Linda',
          doctor_name: 'Dra. Linda Castillo'
        }
      } else {
        // Para otras clínicas, mantener el nombre original
        return {
          clinic_id: clinic.clinic_id,
          display_name: clinic.clinic_name,
          doctor_name: ''
        }
      }
    })
  }
  
  // Para otros usuarios, mantener nombres originales
  return clinics.map(clinic => ({
    clinic_id: clinic.clinic_id,
    display_name: clinic.clinic_name,
    doctor_name: ''
  }))
}

// Función para obtener el nombre de visualización de una clínica específica
export function getClinicDisplayName(userEmail: string, clinic: any): string {
  if (userEmail === 'lorenpeguero12@gmail.com') {
    if (clinic.clinic_name === 'Clínica Abreu') {
      return 'Clínica Abreu - Dr. Luis'
    } else if (clinic.clinic_name === 'Clínica Abreu.') {
      return 'Clínica Abreu - Dra. Linda'
    } else if (clinic.clinic_name === 'IRMIE') {
      return 'IRMIE - Dra. Linda'
    }
  }
  
  return clinic.clinic_name
}
