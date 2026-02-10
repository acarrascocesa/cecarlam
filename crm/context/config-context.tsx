"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import useConfig from '@/hooks/useConfig'

interface ConfigSettings {
  clinicName: string
  timezone: string
  language: string
}

interface ConfigContextType {
  settings: ConfigSettings
  updateSettings: (newSettings: ConfigSettings) => Promise<void>
  isLoading: boolean
  refreshSettings: () => Promise<void>
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined)

interface ConfigProviderProps {
  children: ReactNode
}

export function ConfigProvider({ children }: ConfigProviderProps) {
  const [settings, setSettings] = useState<ConfigSettings>({
    clinicName: "HSALUD-PRO",
    timezone: "America/Santo_Domingo",
    language: "es"
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const { getBasicSettings, saveBasicSettings } = useConfig()

  const refreshSettings = async () => {
    try {
      const newSettings = await getBasicSettings()
      setSettings(newSettings)
      
      // Aplicar configuraciones al sistema
      applySettings(newSettings)
    } catch (error) {
      console.error('Error al cargar configuraciones:', error)
      
      // Si hay error de autenticación, usar valores por defecto y no reintentar
      if (error instanceof Error && error.message.includes('Token de acceso requerido')) {
        setSettings({
          clinicName: "HSALUD-PRO",
          timezone: "America/Santo_Domingo",
          language: "es"
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateSettings = async (newSettings: ConfigSettings) => {
    try {
      await saveBasicSettings(newSettings)
      setSettings(newSettings)
      
      // Aplicar configuraciones al sistema
      applySettings(newSettings)
    } catch (error) {
      console.error('Error al guardar configuraciones:', error)
      throw error
    }
  }

  const applySettings = (config: ConfigSettings) => {
    // Aplicar zona horaria
    if (typeof window !== 'undefined') {
      // Guardar en localStorage para persistencia
      localStorage.setItem('app-settings', JSON.stringify(config))
      
      // Aplicar configuración de idioma (podría usarse con i18n)
      document.documentElement.lang = config.language
      
      // Actualizar título de la página
      if (config.clinicName) {
        document.title = `${config.clinicName} - CRM`
      }
    }
  }

  useEffect(() => {
    // Cargar configuraciones al inicializar
    const loadInitialSettings = async () => {
      // Intentar cargar desde localStorage primero (para mejor UX)
      if (typeof window !== 'undefined') {
        const savedSettings = localStorage.getItem('app-settings')
        if (savedSettings) {
          try {
            const parsedSettings = JSON.parse(savedSettings)
            setSettings(parsedSettings)
            applySettings(parsedSettings)
          } catch (error) {
            console.error('Error al cargar configuraciones del localStorage:', error)
          }
        }
      }
      
      // Solo cargar desde el servidor si hay un token válido
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
      if (token) {
        await refreshSettings()
      } else {
        // Si no hay token, usar configuraciones por defecto
        setSettings({
          clinicName: "HSALUD-PRO",
          timezone: "America/Santo_Domingo",
          language: "es"
        })
        setIsLoading(false)
      }
    }

    loadInitialSettings()
  }, [])

  return (
    <ConfigContext.Provider value={{
      settings,
      updateSettings,
      isLoading,
      refreshSettings
    }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfigContext() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfigContext must be used within a ConfigProvider')
  }
  return context
}

export default ConfigContext
