"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api/client"

export interface User {
  id: string
  name: string
  email: string
  role: "doctor" | "secretary" | "admin" | "cajera"
  multiClinicView?: boolean
  avatarUrl?: string
  licenseNumber?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("authToken")
      if (token) {
        try {
          // Asegurar que el apiClient tenga el token actualizado
          apiClient.setToken(token)
          const response = await apiClient.verifyToken()
          setUser({
            id: response.user.id,
            name: response.user.name,
            email: response.user.email,
            role: response.user.role as "doctor" | "secretary" | "admin" | "cajera",
            avatarUrl: response.user.avatarUrl,
            licenseNumber: response.user.licenseNumber,
            multiClinicView: response.user.multiClinicView,
          })
        } catch (error) {
          console.error("Token verification failed:", error)
          // Token inválido, limpiar
          localStorage.removeItem("authToken")
          localStorage.removeItem("selectedClinicId")
          apiClient.setToken(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; user?: User }> => {
    setLoading(true)
    try {
      const response = await apiClient.login(email, password)
      const userData: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role as "doctor" | "secretary" | "admin" | "cajera",
        avatarUrl: response.user.avatarUrl,
        licenseNumber: response.user.licenseNumber,
        multiClinicView: response.user.multiClinicView,
      }
      setUser(userData)
      setLoading(false)
      return { success: true, user: userData }
    } catch (error) {
      console.error("Login failed:", error)
      setLoading(false)
      return { success: false }
    }
  }

  const logout = () => {
    // 1. Primero limpiar el token para evitar nuevas llamadas API
    localStorage.removeItem("authToken")
    
    // 2. Disparar evento personalizado para notificar a otros contextos ANTES de limpiar el estado
    window.dispatchEvent(new CustomEvent('userLogout'))
    
    // 3. Dar tiempo a los hooks para limpiar su estado
    setTimeout(() => {
      // 4. Limpiar el estado de autenticación
      apiClient.logout()
      setUser(null)
      
      // 5. Limpiar el resto del localStorage
      localStorage.removeItem("selectedClinicId")
      
      // 6. Redirigir al login
      router.push("/auth/login")
    }, 100) // 100ms debería ser suficiente para que los hooks procesen el evento
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
