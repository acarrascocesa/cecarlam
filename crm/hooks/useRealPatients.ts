"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Patient } from '@/types/patient'
import { formatDateToISO } from '@/lib/utils'

export const useRealPatients = (clinicId?: string, userInfo?: any) => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'unified' | 'separated'>('separated')

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Verificar si hay token antes de hacer la llamada
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        setPatients([])
        setLoading(false)
        return
      }

      
      // LÓGICA SIMPLIFICADA PARA VISTA UNIFICADA
      let data
      const isUnifiedView = userInfo?.multiClinicView === true && (userInfo?.role === 'doctor' || userInfo?.role === 'secretary')
      
      if (isUnifiedView) {
        // Vista unificada: obtener TODOS los pacientes del doctor sin filtro
        data = await apiClient.getPatients() // Sin parámetros = todos los pacientes del doctor
        setViewMode('unified')
      } else if (clinicId) {
        // Vista normal: filtrar por clínica específica
        data = await apiClient.getPatients(clinicId)
        setViewMode('separated')
      } else {
        // No hay clínica seleccionada y no es vista unificada
        setPatients([])
        setViewMode('separated')
        setLoading(false)
        return
      }
      

      
      const transformedPatients = data.map((patient: any) => ({
        id: patient.id,
        clinicId: patient.clinicId,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        cedula: patient.cedula,
        // Procesar dateOfBirth correctamente para evitar problemas de timezone
        dateOfBirth: patient.dateOfBirth ? (() => {
          const dateStr = patient.dateOfBirth;
          
          if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0);
          }
          
          if (typeof dateStr === 'string' && dateStr.includes('T')) {
            const dateOnly = dateStr.split('T')[0];
            const [year, month, day] = dateOnly.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0);
          }
          
          return new Date(dateStr);
        })() : null,
        gender: patient.gender,
        address: patient.address,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactPhone: patient.emergencyContactPhone,
        emergencyContactRelationship: patient.emergencyContactRelationship,
        insuranceProvider: patient.insuranceProvider,
        insuranceNumber: patient.insuranceNumber,
        bloodType: patient.bloodType,
        allergies: patient.allergies || [],
        chronicConditions: patient.chronicConditions || [],
        status: patient.status,
        avatarUrl: patient.avatarUrl,
        notes: patient.notes,
        // Procesar fechas de creación y actualización
        createdAt: patient.createdAt ? (() => {
          const dateStr = patient.createdAt;
          
          if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0);
          }
          
          if (typeof dateStr === 'string' && dateStr.includes('T')) {
            const dateOnly = dateStr.split('T')[0];
            const [year, month, day] = dateOnly.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0);
          }
          
          return new Date(dateStr);
        })() : new Date(),
        updatedAt: patient.updatedAt ? (() => {
          const dateStr = patient.updatedAt;
          
          if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0);
          }
          
          if (typeof dateStr === 'string' && dateStr.includes('T')) {
            const dateOnly = dateStr.split('T')[0];
            const [year, month, day] = dateOnly.split('-').map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0);
          }
          
          return new Date(dateStr);
        })() : new Date(),
        clinicName: patient.clinicName || null, // Campo del backend para vista unificada
        viewMode: (isUnifiedView ? 'unified' : 'separated') as "unified" | "separated"
      }))
      

      setPatients(transformedPatients)
      
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setPatients([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading patients')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [clinicId, userInfo?.multiClinicView, userInfo?.role, userInfo?.id])

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

  const addPatient = async (patientData: any) => {
    try {
      const backendData = {
        clinicId: patientData.clinicId,
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
        cedula: patientData.cedula,
        dateOfBirth: patientData.birthDate ? formatDateToISO(new Date(patientData.birthDate)) : null,
        gender: patientData.gender,
        address: patientData.address,
        emergencyContactName: patientData.emergencyContactName,
        emergencyContactPhone: patientData.emergencyContactPhone,
        emergencyContactRelationship: patientData.emergencyContactRelationship,
        insuranceProvider: patientData.insuranceProvider,
        insuranceNumber: patientData.insuranceNumber || '',
        bloodType: patientData.bloodType,
        allergies: patientData.allergies ? patientData.allergies.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
        chronicConditions: patientData.chronicConditions ? patientData.chronicConditions.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [],
        status: patientData.status || 'Activo',
        notes: patientData.notes
      }

      await apiClient.createPatient(backendData)
      await fetchPatients()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding patient')
      throw err
    }
  }

  const updatePatient = async (id: string, patientData: any) => {
    try {
      const backendData = {
        clinicId: patientData.clinicId,
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
        cedula: patientData.cedula,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        address: patientData.address,
        emergencyContactName: patientData.emergencyContactName,
        emergencyContactPhone: patientData.emergencyContactPhone,
        emergencyContactRelationship: patientData.emergencyContactRelationship,
        insuranceProvider: patientData.insuranceProvider,
        insuranceNumber: patientData.insuranceNumber || '',
        bloodType: patientData.bloodType,
        allergies: patientData.allergies || [],
        chronicConditions: patientData.chronicConditions || [],
        status: patientData.status || 'Activo',
        notes: patientData.notes
      }

      await apiClient.updatePatient(id, backendData)
      await fetchPatients()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating patient')
      throw err
    }
  }

  const deletePatient = async (id: string) => {
    try {
      await apiClient.deletePatient(id)
      await fetchPatients()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting patient')
      throw err
    }
  }

  return {
    patients,
    loading,
    error,
    viewMode,
    addPatient,
    updatePatient,
    deletePatient,
    refetch: fetchPatients
  }
}
