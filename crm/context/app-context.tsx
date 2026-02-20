"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { useRealPatients } from "@/hooks/useRealPatients"
import { useRealAppointments } from "@/hooks/useRealAppointments"
import { useMedicalRecords } from "@/hooks/useMedicalRecords"
import { useRealClinics } from "@/hooks/useRealClinics"
import { useServices } from "@/hooks/useServices"
import { useServicesBySpecialty } from "@/hooks/useServicesBySpecialty"
import { useMedications } from "@/hooks/useMedications"
import { useAnalytics } from "@/hooks/useAnalytics"
import { useInvoices } from "@/hooks/useInvoices"
import { usePrescriptions } from "@/hooks/usePrescriptions"

// Definir tipos para nuestros datos
export interface User {
  id: string
  name: string
  email: string
  role: "doctor" | "secretary" | "admin" | "cajera"
  avatarUrl?: string
  licenseNumber?: string
  clinics?: Clinic[]
}

export interface Clinic {
  id: string
  user_id: string
  clinic_id: string
  role: string
  created_at: string
  clinic_name: string
  clinic_address: string
  clinic_phone: string
  clinic_email?: string
  clinic_is_active: boolean
  doctor_name?: string
}

interface AppContextType {
  currentUser: User | null
  clinics: Clinic[]
  selectedClinicId: string | null
  setSelectedClinicId: (clinicId: string | null) => void
  patients: any[]
  appointments: any[]
  medicalRecords: any[]
  invoices: any[]
  services: any[]
  medications: any[]
  analytics: any[]
  prescriptions: any[]
  loading: boolean
  // Patient CRUD methods
  addPatient: (patientData: any) => Promise<void>
  updatePatient: (id: string, patientData: any) => Promise<void>
  deletePatient: (id: string) => Promise<void>
  // Appointment CRUD methods
  addAppointment: (appointmentData: any) => Promise<void>
  updateAppointment: (id: string, appointmentData: any) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  // Service CRUD methods
  addService: (serviceData: any) => Promise<void>
  updateService: (id: string, serviceData: any) => Promise<void>
  deleteService: (id: string) => Promise<void>
  // Medication CRUD methods
  addMedication: (medicationData: any) => Promise<void>
  updateMedication: (id: string, medicationData: any) => Promise<void>
  deleteMedication: (id: string) => Promise<void>
  // Analytics CRUD methods
  addAnalytic: (analyticData: any) => Promise<void>
  updateAnalytic: (id: string, analyticData: any) => Promise<void>
  deleteAnalytic: (id: string) => Promise<void>
  // Prescription CRUD methods
  addPrescription: (prescriptionData: any) => Promise<void>
  updatePrescription: (id: string, prescriptionData: any) => Promise<void>
  deletePrescription: (id: string) => Promise<void>
  // Medical Record CRUD methods
  addMedicalRecord: (recordData: any) => Promise<void>
  updateMedicalRecord: (id: string, recordData: any) => Promise<void>
  deleteMedicalRecord: (id: string) => Promise<void>
  // Invoice CRUD methods
  addInvoice: (invoiceData: any) => Promise<void>
  updateInvoice: (id: string, invoiceData: any) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>
  // Notification methods
  notifications: any[]
  addNotification: (notification: any) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: authUser } = useAuth()
  const { clinics } = useRealClinics()
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<any[]>([])

  // Para usuarios con vista multiclínica, no filtrar por clínica específica
  const hasMultiClinicView = authUser?.multiClinicView && (authUser?.role === 'doctor' || authUser?.role === 'secretary');
  const patientsClinicId = hasMultiClinicView ? undefined : selectedClinicId;
  const { 
    patients, 
    loading: patientsLoading,
    addPatient: hookAddPatient,
    updatePatient,
    deletePatient
  } = useRealPatients(patientsClinicId || undefined, authUser);

  // Wrapper para asegurar que addPatient devuelva void
  const addPatient = async (patientData: any): Promise<void> => {
    await hookAddPatient(patientData)
  }
  // Para usuarios con vista multiclinica, no filtrar por clinica; para otros, usar clinica seleccionada
  const appointmentsClinicId = hasMultiClinicView ? undefined : selectedClinicId;
  const { appointments, loading: appointmentsLoading, addAppointment, updateAppointment, deleteAppointment } = useRealAppointments(appointmentsClinicId || undefined);
  const medicalRecordsClinicId = hasMultiClinicView ? undefined : selectedClinicId;
  const { medicalRecords, loading: medicalRecordsLoading, addMedicalRecord, updateMedicalRecord, deleteMedicalRecord } = useMedicalRecords(undefined, medicalRecordsClinicId || undefined);
  // Para servicios, aplicar vista multiclínicas igual que con citas
  const servicesClinicId = hasMultiClinicView ? undefined : selectedClinicId;
  // Usar hook normal para todos (useServicesBySpecialty tenía problemas)
  const shouldUseSpecialty = false; // Mantener false hasta que se arregle useServicesBySpecialty
  
  const { 
    services, 
    loading: servicesLoading,
    addService,
    updateService,
    deleteService
  } = shouldUseSpecialty 
    ? useServicesBySpecialty(servicesClinicId || undefined)
    : useServices(servicesClinicId || undefined)
  const { 
    medications, 
    loading: medicationsLoading,
    addMedication,
    updateMedication,
    deleteMedication
  } = useMedications()
  const { 
    analytics, 
    loading: analyticsLoading,
    addAnalytic,
    updateAnalytic,
    deleteAnalytic
  } = useAnalytics()
  // Para facturas, aplicar vista multiclínicas igual que con otros módulos
  const invoicesClinicId = hasMultiClinicView ? undefined : selectedClinicId;
  const { invoices, loading: invoicesLoading, addInvoice, updateInvoice, deleteInvoice } = useInvoices(invoicesClinicId || undefined)
  // Para prescripciones, aplicar vista multiclínicas igual que con otros módulos  
  const prescriptionsClinicId = hasMultiClinicView ? undefined : selectedClinicId;
  // Para usuarios multiclínica, no filtrar por doctorId (para ver prescripciones de toda la red)
  const prescriptionsDoctorId = hasMultiClinicView ? undefined : authUser?.id;
  const { 
    prescriptions, 
    loading: prescriptionsLoading,
    addPrescription,
    updatePrescription,
    deletePrescription
  } = usePrescriptions(prescriptionsClinicId || undefined, undefined, prescriptionsDoctorId)

  // Un solo centro CECARLAM: siempre usar la única clínica
  useEffect(() => {
    if (authUser && clinics.length > 0) {
      if (clinics.length === 1) {
        setSelectedClinicId(clinics[0].clinic_id)
      } else if (!selectedClinicId) {
        setSelectedClinicId(clinics[0].clinic_id)
      }
    }
  }, [authUser, clinics, selectedClinicId])

  // Cargar desde localStorage solo si hay varias clínicas
  useEffect(() => {
    if (clinics.length <= 1) return
    const storedClinicId = localStorage.getItem("selectedClinicId")
    if (storedClinicId) {
      try {
        const parsedClinicId = JSON.parse(storedClinicId)
        const valid = clinics.some(c => c.clinic_id === parsedClinicId)
        if (valid) setSelectedClinicId(parsedClinicId)
      } catch {
        localStorage.removeItem("selectedClinicId")
      }
    }
  }, [clinics])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setSelectedClinicId(null)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  // Guardar en localStorage cuando cambie
  useEffect(() => {
    if (selectedClinicId) {
      localStorage.setItem("selectedClinicId", JSON.stringify(selectedClinicId))
    } else {
      localStorage.removeItem("selectedClinicId")
    }
  }, [selectedClinicId])

  const loading = patientsLoading || appointmentsLoading || medicalRecordsLoading || servicesLoading || medicationsLoading || analyticsLoading || invoicesLoading || prescriptionsLoading

  const addNotification = (notification: any) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now().toString() }])
  }

  const contextValue: AppContextType = {
    currentUser: authUser,
    clinics,
    selectedClinicId,
    setSelectedClinicId,
    patients,
    appointments,
    medicalRecords,
    invoices,
    services,
    medications,
    analytics,
    prescriptions,
    loading,
    // Patient CRUD methods
    addPatient,
    updatePatient,
    deletePatient,
    // Appointment CRUD methods
    addAppointment,
    updateAppointment,
    deleteAppointment,
    // Service CRUD methods
    addService,
    updateService,
    deleteService,
    // Medication CRUD methods
    addMedication,
    updateMedication,
    deleteMedication,
    // Analytics CRUD methods
    addAnalytic,
    updateAnalytic,
    deleteAnalytic,
    // Medical Record CRUD methods
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    // Prescription CRUD methods
    addPrescription,
    updatePrescription,
    deletePrescription,
    // Invoice CRUD methods
    addInvoice,
    updateInvoice,
    deleteInvoice,
    // Notification methods
    notifications,
    addNotification,
  }

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
