"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'

export const useRealDoctors = (clinicId?: string) => {
  const [doctors, setDoctors] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDoctors = async () => {
    if (!clinicId) {
      setDoctors([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getUsers(clinicId)
      
      // Filtrar solo usuarios con rol de doctor
      const doctorsList = data.filter(user => user.role === 'doctor').map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        role: doctor.role,
        avatarUrl: doctor.avatar_url,
        licenseNumber: doctor.license_number,
        isActive: doctor.is_active
      }))
      
      setDoctors(doctorsList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading doctors')
      console.error('Error fetching doctors:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [clinicId])

  return {
    doctors,
    loading,
    error,
    refetch: fetchDoctors
  }
}
