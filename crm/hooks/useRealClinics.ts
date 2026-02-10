"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/context/auth-context'

export interface RealClinic {
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

export const useRealClinics = () => {
  const { user } = useAuth()
  const [clinics, setClinics] = useState<RealClinic[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClinics = async () => {
    if (!user) {
      setClinics([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Verificar si hay token antes de hacer la llamada
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        setClinics([])
        setLoading(false)
        return
      }
      
      const data = await apiClient.getUserClinics()
      setClinics(data)
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setClinics([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading clinics')
        console.error('Error fetching clinics:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClinics()
  }, [user])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setClinics([])
      setError(null)
      setLoading(false)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  return {
    clinics,
    loading,
    error,
    refetch: fetchClinics
  }
}
