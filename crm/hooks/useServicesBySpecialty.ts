"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/context/auth-context'

export const useServicesBySpecialty = (clinicId?: string, insuranceType?: string) => {
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchServices = async () => {
    console.log('🔍 useServicesBySpecialty - fetchServices called:', {
      userRole: user?.role,
      clinicId,
      userName: user?.name,
      multiClinicView: user?.multiClinicView
    });

    // Si el usuario no es doctor, no cargar servicios
    if (!user || user.role !== 'doctor') {
      console.log('❌ User is not doctor, skipping services');
      setServices([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      console.log('📡 Calling API getServicesBySpecialty with:', { clinicId, insuranceType });
      
      // Si clinicId es undefined (vista multiclínicas), llamar sin filtrar por clínica
      // Si clinicId está definido, filtrar por esa clínica específica
      const data = await apiClient.getServicesBySpecialty(clinicId, insuranceType)
      
      console.log('✅ Services received:', data.length);
      setServices(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading services')
      console.error('💥 Error fetching services by specialty:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [clinicId, insuranceType, user])

  const addService = async (serviceData: any) => {
    try {
      // Cuando agregamos un servicio, usar la clínica seleccionada o requerir que se especifique
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
