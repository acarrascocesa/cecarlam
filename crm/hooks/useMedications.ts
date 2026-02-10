"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/context/auth-context'

export const useMedications = () => {
  const { user } = useAuth()
  const [medications, setMedications] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMedications = async () => {
    if (!user) {
      setMedications([])
      return
    }

    // Verificar si hay token antes de hacer la llamada
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      setMedications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getMedications(user.id)
      setMedications(data)
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setMedications([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading medications')
        console.error('Error fetching medications:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, [user])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setMedications([])
      setError(null)
      setLoading(false)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  const addMedication = async (medicationData: any) => {
    try {
      await apiClient.createMedication({
        ...medicationData,
        doctorId: user?.id
      })
      await fetchMedications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding medication')
      throw err
    }
  }

  const updateMedication = async (id: string, medicationData: any) => {
    try {
      await apiClient.updateMedication(id, medicationData)
      await fetchMedications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating medication')
      throw err
    }
  }

  const deleteMedication = async (id: string) => {
    try {
      await apiClient.deleteMedication(id)
      await fetchMedications()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting medication')
      throw err
    }
  }

  return {
    medications,
    loading,
    error,
    refetch: fetchMedications,
    addMedication,
    updateMedication,
    deleteMedication
  }
}
