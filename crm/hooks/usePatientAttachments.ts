"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'

export const usePatientAttachments = (patientId?: string, category?: string) => {
  const [attachments, setAttachments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const fetchAttachments = async () => {
    if (!patientId) {
      setAttachments([])
      return
    }

    // Verificar si hay token antes de hacer la llamada
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      setAttachments([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getPatientAttachments(patientId, category)
      setAttachments(Array.isArray(data) ? data : [])
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setAttachments([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading patient attachments')
        console.error('Error fetching patient attachments:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAttachments()
  }, [patientId, category])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setAttachments([])
      setError(null)
      setLoading(false)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  const uploadAttachments = async (files: FileList | File[], attachmentCategory: string = 'general', description: string = '') => {
    if (!patientId || !files || files.length === 0) {
      throw new Error('Patient ID and files are required')
    }

    try {
      setUploading(true)
      setError(null)

      // Simular progreso para cada archivo
      const fileArray = Array.from(files)
      fileArray.forEach((file, index) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      })

      const result = await apiClient.uploadPatientAttachments(patientId, files, attachmentCategory, description)
      
      // Completar progreso
      fileArray.forEach((file) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
      })

      // Actualizar lista
      await fetchAttachments()
      
      // Limpiar progreso después de un momento
      setTimeout(() => {
        setUploadProgress({})
      }, 2000)

      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading files')
      setUploadProgress({})
      throw err
    } finally {
      setUploading(false)
    }
  }

  const downloadAttachment = async (filename: string) => {
    try {
      setError(null)
      const { blob, filename: downloadFilename } = await apiClient.downloadPatientAttachment(filename)
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = downloadFilename
      document.body.appendChild(a)
      a.click()
      
      // Limpiar
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error downloading file')
      throw err
    }
  }

  const updateAttachment = async (attachmentId: string, attachmentCategory: string, description: string) => {
    try {
      setError(null)
      await apiClient.updatePatientAttachment(attachmentId, attachmentCategory, description)
      await fetchAttachments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating attachment')
      throw err
    }
  }

  const deleteAttachment = async (attachmentId: string) => {
    try {
      setError(null)
      await apiClient.deletePatientAttachment(attachmentId)
      await fetchAttachments()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting attachment')
      throw err
    }
  }

  const clearError = () => setError(null)

  return {
    attachments,
    loading,
    uploading,
    error,
    uploadProgress,
    uploadAttachments,
    downloadAttachment,
    updateAttachment,
    deleteAttachment,
    refetch: fetchAttachments,
    clearError
  }
}
