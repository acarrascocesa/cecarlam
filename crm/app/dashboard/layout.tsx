"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppProvider } from "@/context/app-context"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { SidebarProvider } from "@/context/sidebar-context"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Toaster } from "@/components/ui/toaster"
import { ProtectedRoute } from "@/components/ProtectedRoute"

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Cargando...</p>
          <p className="text-sm text-muted-foreground">Verificando su sesión.</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full relative overflow-hidden bg-gradient-to-br from-blue-clinical-50 via-mint-soft-50 to-cyan-50">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Área de contenido principal */}
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="w-full">
            <Header />
          </div>
          
          {/* Contenido principal */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 xl:p-8 2xl:p-10 md:pt-4 pt-16 sm:pt-20 md:pt-24">
            <div className="w-full max-w-none">
              <ProtectedRoute>
                {children}
              </ProtectedRoute>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
        <Toaster />
      </AppProvider>
    </AuthProvider>
  )
}
