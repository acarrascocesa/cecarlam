import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api/client'

export interface Report {
  id: string
  name: string
  type: 'financial' | 'appointments' | 'patients' | 'medical' | 'insurance_billing'
  format: 'pdf' | 'excel' | 'csv'
  filters: any
  data: any
  generated_by: string
  generated_by_name: string
  clinic_id: string
  clinic_name: string
  created_at: Date
  file_path?: string
  status: 'processing' | 'completed' | 'failed'
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  type: string
  template_config: any
  is_active: boolean
  created_by: string
  created_by_name: string
  created_at: Date
}

export interface ReportFilters {
  startDate?: string
  endDate?: string
  clinicId?: string
  status?: string
  type?: string
  insuranceProvider?: string
}

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Obtener reportes
  const fetchReports = useCallback(async (filters?: ReportFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const queryParams = new URLSearchParams()
      if (filters?.clinicId) queryParams.append('clinicId', filters.clinicId)
      if (filters?.type) queryParams.append('type', filters.type)
      if (filters?.status) queryParams.append('status', filters.status)

      const response = await apiClient.getReports(filters)
      
      // Procesar las fechas correctamente para evitar problemas de timezone
      const processedReports = (response as Report[]).map((report: Report) => ({
        ...report,
        // Convertir created_at usando la misma lógica que otros hooks
        created_at: (() => {
          const dateStr = (report as any).created_at as string;
          
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
        })()
      }))
      
      setReports(processedReports)
    } catch (err: any) {
      setError(err.message || 'Error al obtener reportes')
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Generar reporte
  const generateReport = async (reportData: {
    name: string
    type: 'financial' | 'appointments' | 'patients' | 'medical' | 'insurance_billing'
    format: 'pdf' | 'excel' | 'csv'
    filters: ReportFilters
    clinicId?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.generateReport(reportData) as any
      
      // Agregar el nuevo reporte a la lista
      setReports(prev => [response.report, ...prev])
      
      return response
    } catch (err: any) {
      setError(err.message || 'Error al generar reporte')
      console.error('Error generating report:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Obtener reporte específico
  const getReportById = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getReportById(id)
      return response
    } catch (err: any) {
      setError(err.message || 'Error al obtener reporte')
      console.error('Error fetching report:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Eliminar reporte
  const deleteReport = async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await apiClient.deleteReport(id)
      
      // Remover el reporte de la lista
      setReports(prev => prev.filter(report => report.id !== id))
      
      return true
    } catch (err: any) {
      setError(err.message || 'Error al eliminar reporte')
      console.error('Error deleting report:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Descargar reporte
  const downloadReport = async (id: string, fileName?: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const blob = await apiClient.downloadReport(id)
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || `reporte_${Date.now()}.${blob.type.includes('pdf') ? 'pdf' : blob.type.includes('spreadsheet') ? 'xlsx' : 'csv'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return true
    } catch (err: any) {
      setError(err.message || 'Error al descargar reporte')
      console.error('Error downloading report:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Obtener plantillas
  const fetchTemplates = useCallback(async (filters?: { type?: string; isActive?: boolean }) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getReportTemplates(filters)
      
      // Procesar las fechas correctamente para evitar problemas de timezone
      const processedTemplates = (response as ReportTemplate[]).map((template: ReportTemplate) => ({
        ...template,
        // Convertir created_at usando la misma lógica que otros hooks
        created_at: (() => {
          const dateStr = (template as any).created_at as string;
          
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
        })()
      }))
      
      setTemplates(processedTemplates)
    } catch (err: any) {
      setError(err.message || 'Error al obtener plantillas')
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear plantilla
  const createTemplate = async (templateData: {
    name: string
    description: string
    type: string
    templateConfig: any
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.createReportTemplate(templateData) as any
      
      // Agregar la nueva plantilla a la lista
      setTemplates(prev => [response.template, ...prev])
      
      return response
    } catch (err: any) {
      setError(err.message || 'Error al crear plantilla')
      console.error('Error creating template:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cargar reportes al inicializar
  useEffect(() => {
    fetchReports()
    fetchTemplates()
  }, [])

  return {
    reports,
    templates,
    loading,
    error,
    fetchReports,
    generateReport,
    getReportById,
    deleteReport,
    downloadReport,
    fetchTemplates,
    createTemplate
  }
}
