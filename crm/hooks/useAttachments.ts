"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'

export const useAttachments = (medicalRecordId?: string) => {
  const [attachments, setAttachments] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})

  const fetchAttachments = async () => {
    if (!medicalRecordId) {
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
      const data = await apiClient.getAttachments(medicalRecordId)
      setAttachments(Array.isArray(data) ? data : [])
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setAttachments([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading attachments')
        console.error('Error fetching attachments:', err)
      }
    } finally {
      setLoading(false)
    }
  }

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

  useEffect(() => {
    fetchAttachments()
  }, [medicalRecordId])

  const uploadAttachments = async (files: FileList | File[]) => {
    if (!medicalRecordId || !files || files.length === 0) {
      throw new Error('Medical record ID and files are required')
    }

    try {
      setUploading(true)
      setError(null)

      // Simular progreso para cada archivo
      const fileArray = Array.from(files)
      fileArray.forEach((file, index) => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
      })

      const result = await apiClient.uploadAttachments(medicalRecordId, files)
      
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
      const { blob, filename: downloadFilename } = await apiClient.downloadAttachment(filename)
      
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

  const deleteAttachment = async (attachmentId: string) => {
    try {
      setError(null)
      await apiClient.deleteAttachment(attachmentId)
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
    deleteAttachment,
    refetch: fetchAttachments,
    clearError
  }
}
