// Hook para manejar el formulario de prescripciones

import { useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { getCurrentDateISO } from "@/lib/utils"
import { PRESCRIPTION_CONSTANTS } from "../utils/constants"
import { validatePrescription, validateClinic } from "../utils/prescriptionValidators"
import type { Patient } from "@/types/patient"

interface UsePrescriptionFormParams {
  addPrescription: (data: any) => Promise<void>
  patients: Patient[]
  selectedClinicId: string | null
  userMultiClinicView?: boolean
  userRole?: string
}

/**
 * Hook para manejar el formulario de prescripciones
 */
export const usePrescriptionForm = ({
  addPrescription,
  patients,
  selectedClinicId,
  userMultiClinicView = false,
  userRole
}: UsePrescriptionFormParams) => {
  const [prescriptionText, setPrescriptionText] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  
  // Calcular selectedPatient internamente
  const selectedPatient = useMemo(() => 
    patients.find((p) => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  )
  
  // Determinar clinicId a usar
  const getClinicIdToUse = useCallback((): string | null => {
    const hasMultiClinicView = userMultiClinicView && (userRole === 'doctor' || userRole === 'secretary')
    return hasMultiClinicView && selectedPatient?.clinicId 
      ? selectedPatient.clinicId 
      : selectedClinicId
  }, [userMultiClinicView, userRole, selectedPatient, selectedClinicId])
  
  // Guardar prescripción
  const savePrescription = useCallback(async () => {
    // Validar
    const prescriptionValidation = validatePrescription(prescriptionText, selectedPatientId)
    if (!prescriptionValidation.isValid) {
      toast({
        title: "Campos requeridos",
        description: prescriptionValidation.error,
        variant: "destructive"
      })
      return
    }
    
    const clinicIdToUse = getClinicIdToUse()
    const clinicValidation = validateClinic(clinicIdToUse)
    if (!clinicValidation.isValid) {
      toast({
        title: "Error",
        description: clinicValidation.error,
        variant: "destructive"
      })
      return
    }
    
    setIsSaving(true)
    
    try {
      const newPrescription = {
        patient_id: selectedPatientId,
        clinic_id: clinicIdToUse,
        prescription_text: prescriptionText,
        prescription_date: getCurrentDateISO() + PRESCRIPTION_CONSTANTS.DEFAULT_TIME,
        notes: "",
        status: PRESCRIPTION_CONSTANTS.STATUS.ACTIVE
      }
      
      await addPrescription(newPrescription)
      
      toast({
        title: "Prescripción guardada",
        description: "La prescripción se ha guardado exitosamente"
      })
      
      setPrescriptionText("")
      setSelectedPatientId("")
      
      // Navegación de retorno
      const urlParams = new URLSearchParams(window.location.search)
      const returnTo = urlParams.get('returnTo')
      
      if (returnTo === 'facturacion') {
        const invoiceId = urlParams.get('invoiceId')
        if (invoiceId) {
          router.push(`/dashboard/facturacion/${invoiceId}`)
        }
      } else if (returnTo === 'paciente') {
        const patientId = urlParams.get('patientId')
        if (patientId) {
          router.push(`/dashboard/pacientes/${patientId}`)
        }
      }
    } catch (error) {
      console.error('Error guardando prescripción:', error)
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Error al guardar la prescripción",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }, [
    prescriptionText,
    selectedPatientId,
    getClinicIdToUse,
    addPrescription,
    router,
    toast
  ])
  
  // Inicializar desde URL
  const initializeFromUrl = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const patientIdFromUrl = urlParams.get('patientId')
    if (patientIdFromUrl) {
      setSelectedPatientId(patientIdFromUrl)
    }
  }, [])
  
  return {
    prescriptionText,
    setPrescriptionText,
    selectedPatientId,
    setSelectedPatientId,
    isSaving,
    savePrescription,
    initializeFromUrl
  }
}
