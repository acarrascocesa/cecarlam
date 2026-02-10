"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/context/auth-context'

export const useMedicalRecords = (patientId?: string, clinicId?: string) => {
  const [medicalRecords, setMedicalRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user: authUser } = useAuth()

  const fetchMedicalRecords = async () => {
    try {
      setLoading(true)
      setError(null)
      

      
      // Si no hay patientId ni clinicId y no es vista unificada, no cargar nada
      if (!patientId && !clinicId && !authUser?.multiClinicView) {

        setMedicalRecords([])
        return
      }

      // Verificar si hay token antes de hacer la llamada
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        setMedicalRecords([])
        setLoading(false)
        return
      }

      // Para vista unificada de doctores, no pasar clinicId para obtener todos los records
      const isUnifiedView = authUser?.multiClinicView === true && (authUser?.role === 'doctor' || authUser?.role === 'secretary')
      const effectiveClinicId = isUnifiedView ? undefined : clinicId
      

      
      const data = await apiClient.getMedicalRecords(patientId, effectiveClinicId)
      

      
      // Procesar las fechas correctamente para evitar problemas de timezone
      const processedRecords = data.map((record: any) => ({
        ...record,
        // Convertir la fecha usando la misma lógica que la página de citas
        record_date: (() => {
          const dateStr = record.record_date || record.date || record.created_at;
          
          if (typeof dateStr === 'string') {
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = dateStr.split('-').map(Number);
              return new Date(year, month - 1, day, 12, 0, 0, 0);
            }
            if (dateStr.includes('T')) {
              const dateOnly = dateStr.split('T')[0];
              const [year, month, day] = dateOnly.split('-').map(Number);
              return new Date(year, month - 1, day, 12, 0, 0, 0);
            }
          }
          
          return new Date(dateStr);
        })(),
        created_at: record.created_at ? new Date(record.created_at) : new Date(),
        updated_at: record.updated_at ? new Date(record.updated_at) : new Date()
      }))
      
      setMedicalRecords(processedRecords)
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setMedicalRecords([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading medical records')
        console.error('Error fetching medical records:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

    fetchMedicalRecords()
  }, [patientId, clinicId, authUser?.multiClinicView, authUser?.role, authUser?.id])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setMedicalRecords([])
      setError(null)
      setLoading(false)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  const addMedicalRecord = async (recordData: any) => {
    try {
      await apiClient.createMedicalRecord(recordData)
      await fetchMedicalRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding medical record')
      throw err
    }
  }

  const updateMedicalRecord = async (id: string, recordData: any) => {
    try {
      await apiClient.updateMedicalRecord(id, recordData)
      await fetchMedicalRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating medical record')
      throw err
    }
  }

  const deleteMedicalRecord = async (id: string) => {
    try {
      await apiClient.deleteMedicalRecord(id)
      await fetchMedicalRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting medical record')
      throw err
    }
  }

  return {
    medicalRecords,
    loading,
    error,
    refetch: fetchMedicalRecords,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord
  }
}
