"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'

export const usePrescriptions = (clinicId?: string, patientId?: string, doctorId?: string) => {
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar si hay token antes de hacer la llamada
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        setPrescriptions([])
        setLoading(false)
        return
      }
      
      const data = await apiClient.getPrescriptions(clinicId, patientId, doctorId)
      
      // Mantener las fechas como strings para evitar problemas con React
      const processedPrescriptions = data.map((prescription: any) => ({
        ...prescription,
        // Mantener las fechas como strings
        prescription_date: prescription.prescription_date,
        created_at: prescription.created_at
      }))
      
      setPrescriptions(processedPrescriptions)
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setPrescriptions([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading prescriptions')
        console.error('Error fetching prescriptions:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
  }, [clinicId, patientId, doctorId])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setPrescriptions([])
      setError(null)
      setLoading(false)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  const addPrescription = async (prescriptionData: any) => {
    try {
      await apiClient.createPrescription({
        ...prescriptionData,
        // Solo sobrescribir clinic_id si no viene definido en prescriptionData
        clinic_id: prescriptionData.clinic_id || clinicId
      })
      await fetchPrescriptions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding prescription')
      throw err
    }
  }

  const updatePrescription = async (id: string, prescriptionData: any) => {
    try {
      await apiClient.updatePrescription(id, prescriptionData)
      await fetchPrescriptions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating prescription')
      throw err
    }
  }

  const deletePrescription = async (id: string) => {
    try {
      await apiClient.deletePrescription(id)
      await fetchPrescriptions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting prescription')
      throw err
    }
  }

  return {
    prescriptions,
    loading,
    error,
    refetch: fetchPrescriptions,
    addPrescription,
    updatePrescription,
    deletePrescription
  }
}
