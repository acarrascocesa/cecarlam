"use client"

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/context/auth-context'

export const useAnalytics = () => {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    if (!user) {
      setAnalytics([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.getAnalytics(user.id)
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading analytics')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [user])

  const addAnalytic = async (analyticData: any) => {
    try {
      await apiClient.createAnalytic({
        ...analyticData,
        doctorId: user?.id
      })
      await fetchAnalytics()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error adding analytic')
      throw err
    }
  }

  const updateAnalytic = async (id: string, analyticData: any) => {
    try {
      await apiClient.updateAnalytic(id, analyticData)
      await fetchAnalytics()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating analytic')
      throw err
    }
  }

  const deleteAnalytic = async (id: string) => {
    try {
      await apiClient.deleteAnalytic(id)
      await fetchAnalytics()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting analytic')
      throw err
    }
  }

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    addAnalytic,
    updateAnalytic,
    deleteAnalytic
  }
}
