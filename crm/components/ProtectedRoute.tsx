"use client"

import { useAuth } from "@/context/auth-context"
import { usePathname } from "next/navigation"
import { useEffect } from "react"
import { canAccessRoute } from "@/lib/permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string
}

export function ProtectedRoute({ children, requiredPermission }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  // Si está cargando, mostrar loading
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Cargando...</p>
          <p className="text-sm text-muted-foreground">Verificando permisos.</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, no debería llegar aquí (ya se maneja en layout)
  if (!user) {
    return null
  }

  // Verificar acceso a la ruta
  const hasRouteAccess = canAccessRoute(user.role, pathname)

  if (!hasRouteAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-xl">Acceso Denegado</CardTitle>
            <CardDescription>
              No tienes permisos para acceder a esta página.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Tu rol actual ({user.role}) no tiene acceso a esta funcionalidad.
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Contacta al administrador si necesitas acceso.</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
