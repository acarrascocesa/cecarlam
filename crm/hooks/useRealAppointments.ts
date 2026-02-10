"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { formatDateToISO } from '@/lib/utils'

export const useRealAppointments = (clinicId?: string, date?: string) => {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = async () => {
    // Para vista multiclinica, obtener citas de todas las clínicas si no se especifica clinicId
    // Solo retornar array vacío si hay error, no por falta de clinicId
    
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
      
      // Transformar datos del backend al formato que espera el frontend
      const transformedAppointments = data.map((appointment: any) => ({
        id: appointment.id,
        patient: {
          id: appointment.patient_id,
          name: appointment.patient_name || 'Paciente',
          image: '/placeholder.svg'
        },
        // Convertir la fecha usando la misma lógica que la página de citas
        date: (() => {
          if (typeof appointment.appointment_date === "string") {
            if (appointment.appointment_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = appointment.appointment_date.split('-').map(Number);
              return new Date(year, month - 1, day, 12, 0, 0, 0);
            }
            if (appointment.appointment_date.includes('T')) {
              const dateOnly = appointment.appointment_date.split('T')[0];
              const [year, month, day] = dateOnly.split('-').map(Number);
              return new Date(year, month - 1, day, 12, 0, 0, 0);
            }
            return new Date(appointment.appointment_date);
          }
          return appointment.appointment_date;
        })(),
        time: appointment.appointment_time,
        duration: 30, // Por defecto, puede ser configurado después
        status: appointment.status, // Mantener el status como viene de la DB
        type: appointment.appointment_type || appointment.reason || 'Consulta General',
        doctor: appointment.doctor_name || 'Doctor',
        reason: appointment.reason,
        notes: appointment.notes,
        clinicId: appointment.clinic_id,
        arrivalTimestamp: appointment.arrival_timestamp || null
      }))
      
      setAppointments(transformedAppointments)
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setAppointments([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading appointments')
        console.error('Error fetching appointments:', err)
        setAppointments([])
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
      // Mapear status del frontend al backend (ambos en español)
      let mappedStatus = 'Pendiente' // Default
      if (appointmentData.status === 'Confirmada' || appointmentData.status === 'confirmed') {
        mappedStatus = 'Confirmada'
      } else if (appointmentData.status === 'Completada' || appointmentData.status === 'completed') {
        mappedStatus = 'Completada'
      } else if (appointmentData.status === 'Cancelada' || appointmentData.status === 'cancelled') {
        mappedStatus = 'Cancelada'
      }

      // Transformar datos del frontend al formato que espera el backend
      const backendData = {
        patient_id: appointmentData.patientId,
        clinic_id: appointmentData.clinicId,
        appointment_date: appointmentData.appointment_date,
        appointment_time: appointmentData.appointment_time,
        reason: appointmentData.reason || appointmentData.type,
        appointment_type: appointmentData.type,
        notes: appointmentData.notes || '',
        status: mappedStatus,
        doctor_id: appointmentData.doctor_id // Incluir el doctor_id
      }

      await apiClient.createAppointment(backendData)
      await fetchAppointments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding appointment')
      throw err
    }
  }

  const updateAppointment = async (id: string, appointmentData: any) => {
    try {
      // Mapear status del frontend al backend
      let mappedStatus = 'Pendiente'
      if (appointmentData.status === 'Confirmada') {
        mappedStatus = 'Confirmada'
      } else if (appointmentData.status === 'Completada') {
        mappedStatus = 'Completada'
      } else if (appointmentData.status === 'Cancelada') {
        mappedStatus = 'Cancelada'
      }

      const backendData = {
        patient_id: appointmentData.patientId || appointmentData.patient?.id,
        clinic_id: appointmentData.clinicId,
        appointment_date: appointmentData.appointment_date || (appointmentData.date ? formatDateToISO(appointmentData.date) : undefined),
        appointment_time: appointmentData.appointment_time || appointmentData.time,
        reason: appointmentData.reason,
        appointment_type: appointmentData.type,
        notes: appointmentData.notes || '',
        status: mappedStatus,
        arrival_timestamp: appointmentData.arrivalTimestamp || appointmentData.arrival_timestamp
      }

      await apiClient.updateAppointment(id, backendData)
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
