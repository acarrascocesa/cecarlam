"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'

export const useAppointments = (clinicId?: string, date?: string) => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = async () => {
    if (!clinicId) {
      setAppointments([])
      return
    }

    // Verificar si hay token antes de hacer la llamada
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      setAppointments([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getAppointments(clinicId, date)
      setAppointments(data)
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setAppointments([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading appointments')
        console.error('Error fetching appointments:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [clinicId, date])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setAppointments([])
      setError(null)
      setLoading(false)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  const addAppointment = async (appointmentData: any) => {
    try {
      await apiClient.createAppointment({
        ...appointmentData,
        clinicId
      })
      await fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding appointment')
      throw err
    }
  }

  const updateAppointment = async (id: string, appointmentData: any) => {
    try {
      await apiClient.updateAppointment(id, appointmentData)
      await fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating appointment')
      throw err
    }
  }

  const deleteAppointment = async (id: string) => {
    try {
      await apiClient.deleteAppointment(id)
      await fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting appointment')
      throw err
    }
  }

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment
  }
}
