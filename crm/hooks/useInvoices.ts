"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/context/auth-context'

export const useInvoices = (clinicId?: string, status?: string) => {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user: authUser } = useAuth()

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      setError(null)
      

      // Verificar si hay token antes de hacer la llamada
      const authToken = localStorage.getItem('authToken')
      if (!authToken) {
        setInvoices([])
        setLoading(false)
        return
      }
      
      // LÓGICA PARA VISTA MULTICLÍNICAS
      let data
      const isUnifiedView = authUser?.multiClinicView === true && (authUser?.role === 'doctor' || authUser?.role === 'secretary')
      
      if (isUnifiedView) {
        // Vista unificada: obtener TODAS las facturas del doctor sin filtro
        data = await apiClient.getInvoices() // Sin parámetros = todas las facturas del doctor
      } else if (clinicId) {
        // Vista normal: filtrar por clínica específica
        data = await apiClient.getInvoices(clinicId)
      } else {
        // No hay clínica seleccionada y no es vista unificada
        setInvoices([])
        setLoading(false)
        return
      }
      
      // Procesar las fechas correctamente para evitar problemas de timezone
      const processedInvoices = data.map((invoice: any) => ({
        ...invoice,
        // Parsear invoice_date como fecha local para evitar problemas de timezone
        invoice_date: invoice.invoice_date ? (() => {
          const dateStr = invoice.invoice_date;
          
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
        // Parsear fechas como fechas locales para evitar problemas de timezone
        created_at: (() => {
          const dateStr = invoice.created_at;
          
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
        })(),
        due_date: invoice.due_date ? (() => {
          const dateStr = invoice.due_date;
          
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
        })() : undefined,
        updated_at: invoice.updated_at ? (() => {
          const dateStr = invoice.updated_at;
          
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
        })() : undefined
      }))
      
      setInvoices(processedInvoices)
    } catch (err) {
      // Si es error de autenticación, no mostrar error, solo limpiar estado
      if (err instanceof Error && err.message.includes('Token de acceso requerido')) {
        setInvoices([])
        setError(null)
      } else {
        setError(err instanceof Error ? err.message : 'Error loading invoices')
        console.error('❌ Error fetching invoices:', err)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [clinicId, status, authUser?.multiClinicView, authUser?.role, authUser?.id])

  // Limpiar estado cuando el usuario hace logout
  useEffect(() => {
    const handleLogout = () => {
      setInvoices([])
      setError(null)
      setLoading(false)
    }

    window.addEventListener('userLogout', handleLogout)
    return () => window.removeEventListener('userLogout', handleLogout)
  }, [])

  const addInvoice = async (invoiceData: any) => {
    try {
      // Usar el clinicId del invoiceData (que viene del formulario) en lugar del del contexto
      await apiClient.createInvoice(invoiceData)
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding invoice')
      throw err
    }
  }

  const updateInvoice = async (id: string, invoiceData: any) => {
    try {
      await apiClient.updateInvoice(id, invoiceData)
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating invoice')
      throw err
    }
  }

  const deleteInvoice = async (id: string) => {
    try {
      await apiClient.deleteInvoice(id)
      await fetchInvoices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting invoice')
      throw err
    }
  }

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
    addInvoice,
    updateInvoice,
    deleteInvoice
  }
}
