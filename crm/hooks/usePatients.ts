"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Patient } from '@/types/patient'

export const usePatients = (clinicId?: string) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = async () => {
    if (!clinicId) {
      setPatients([])
      setLoading(false)
      return
    }

    // Verificar si hay token antes de hacer la llamada
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      setPatients([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getPatients(clinicId)
      setPatients(data)
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setPatients([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading patients')
        console.error('Error fetching patients:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [clinicId])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setPatients([])
      setError(null)
      setLoading(false)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  const addPatient = async (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newPatient = await apiClient.createPatient({
        ...patientData,
        clinicId
      })
      // Refrescar la lista después de agregar
      await fetchPatients()
      return newPatient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding patient')
      throw err
    }
  }

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients,
    addPatient
  }
}
