"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/context/auth-context'

export const useServices = (clinicId?: string) => {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchServices = async () => {
    

    // NUEVA LÓGICA: Si no hay clinicId pero el usuario tiene vista multiclínicas, obtener todos los servicios
    const isUnifiedView = user?.multiClinicView && !clinicId;
    
    if (!clinicId && !isUnifiedView) {
      
      setServices([])
      return
    }

    // Verificar si hay token antes de hacer la llamada
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      setServices([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      
      
      // Si es vista unificada, llamar sin clinicId para obtener todos los servicios
      const data = await apiClient.getServices(isUnifiedView ? undefined : clinicId)
      
      
      setServices(data || [])
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setServices([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading services')
        console.error('💥 Error fetching services:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    
    fetchServices()
  }, [clinicId, user?.multiClinicView])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setServices([])
      setError(null)
      setLoading(false)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  const addService = async (serviceData: any) => {
    try {
      await apiClient.createService({
        ...serviceData,
        clinicId: serviceData.clinicId || clinicId
      })
      await fetchServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding service')
      throw err
    }
  }

  const updateService = async (id: string, serviceData: any) => {
    try {
      await apiClient.updateService(id, serviceData)
      await fetchServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating service')
      throw err
    }
  }

  const deleteService = async (id: string) => {
    try {
      await apiClient.deleteService(id)
      await fetchServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting service')
      throw err
    }
  }

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    addService,
    updateService,
    deleteService
  }
}
