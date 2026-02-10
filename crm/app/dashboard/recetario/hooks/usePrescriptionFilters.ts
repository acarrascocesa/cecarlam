// Hook para manejar filtros de búsqueda

import { useMemo } from "react"
import type { Medication, Service, Analytic } from "@/types/recetario"
import type { Patient } from "@/types/patient"

/**
 * Hook para filtrar medicamentos
 */
export const useMedicationFilter = (
  medications: Medication[],
  searchTerm: string
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return medications
    
    const searchLower = searchTerm.toLowerCase()
    return medications.filter(medication =>
      medication.name.toLowerCase().includes(searchLower) ||
      medication.genericName?.toLowerCase().includes(searchLower) ||
      medication.category?.toLowerCase().includes(searchLower) ||
      medication.dosage?.toLowerCase().includes(searchLower)
    )
  }, [medications, searchTerm])
}

/**
 * Hook para filtrar servicios
 */
export const useServiceFilter = (
  services: Service[],
  searchTerm: string,
  category?: string
) => {
  return useMemo(() => {
    let filtered = services
    
    // Filtrar por categoría
    if (category && category !== 'all') {
      filtered = filtered.filter(service => service.category === category)
    }
    
    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower) ||
        service.category?.toLowerCase().includes(searchLower)
      )
    }
    
    return filtered
  }, [services, searchTerm, category])
}

/**
 * Hook para filtrar analíticas
 */
export const useAnalyticFilter = (
  analytics: Analytic[],
  searchTerm: string
) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return analytics
    
    const searchLower = searchTerm.toLowerCase()
    return analytics.filter(analytic =>
      analytic.name.toLowerCase().includes(searchLower) ||
      analytic.genericName?.toLowerCase().includes(searchLower) ||
      analytic.category?.toLowerCase().includes(searchLower) ||
      analytic.description?.toLowerCase().includes(searchLower)
    )
  }, [analytics, searchTerm])
}

/**
 * Hook para filtrar pacientes
 */
export const usePatientFilter = (
  patients: Patient[],
  searchValue: string
) => {
  return useMemo(() => {
    if (!searchValue.trim()) return patients
    
    const searchLower = searchValue.toLowerCase()
    return patients.filter(patient =>
      patient.name.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.toLowerCase().includes(searchLower)
    )
  }, [patients, searchValue])
}
