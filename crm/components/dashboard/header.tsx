"use client"

import { Button } from "@/components/ui/button"
import { Settings, User, LogOut, Building, Calendar, Globe } from "lucide-react"
import { ClinicSelector } from "../clinic-selector"
import { useAppContext } from "@/context/app-context"
import { useMemo } from "react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getClinicDisplayName } from "@/lib/clinicDisplayNames"

export function Header() {
  const { user, logout } = useAuth()
  const { appointments = [], selectedClinicId, clinics, setSelectedClinicId } = useAppContext()
  const router = useRouter()

  // Check if user has multi-clinic view
  const hasMultiClinicView = user?.multiClinicView && (user?.role === 'doctor' || user?.role === 'secretary')

  // Calcular citas de hoy
  const todayAppointments = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return appointments.filter(appointment => {
      try {
        if (!appointment.appointment_date) return false
        const appointmentDate = format(new Date(appointment.appointment_date), 'yyyy-MM-dd')
        return appointmentDate === today
      } catch (error) {
        console.warn('Fecha de cita inválida:', appointment.appointment_date)
        return false
      }
    })
  }, [appointments])

  // Obtener nombre de la clínica seleccionada
  const selectedClinic = useMemo(() => {
    return clinics.find(clinic => clinic.clinic_id === selectedClinicId)
  }, [clinics, selectedClinicId])

  // Obtener nombre de visualización específico
  const selectedClinicDisplayName = useMemo(() => {
    if (!selectedClinic) return 'Seleccionar clínica'
    return getClinicDisplayName(user?.email || '', selectedClinic)
  }, [selectedClinic, user?.email])

  return (
    <div className="w-full flex justify-center">
      <header className="sticky top-0 z-50 w-full max-w-9xl bg-cream-warm-500 border border-gray-light-500 shadow-lg shadow-gray-professional-900/10 backdrop-blur-xl rounded-2xl overflow-hidden mt-4 lg:mt-4 xl:mt-6 mx-4 lg:mx-6 xl:mx-8 2xl:mx-10">
      <div className="flex h-14 sm:h-16 lg:h-18 items-center justify-between px-4 lg:px-6">
        
        {/* Left Section - Status & Quick Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm"></div>
            <span className="text-xs font-medium text-emerald-700 hidden sm:inline">Online</span>
          </div>
          
          {/* Citas Hoy - Badge mejorado */}
          {todayAppointments.length > 0 && (
            <Badge variant="secondary" className="text-xs px-2 py-1 bg-gradient-to-r from-green-health-50 to-green-health-100/50 text-green-health-700 border-green-health-200/60 hover:from-green-health-100 hover:to-green-health-200/50 transition-all duration-200 shadow-sm">
              <Calendar className="h-3 w-3 mr-1" />
              {todayAppointments.length} hoy
            </Badge>
          )}
        </div>

        {/* Center Section - Clinic Selector */}
        <div className="flex items-center justify-center flex-none max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[400px]">
          {/* Clinic Selector - Versión desktop */}
          <div className="hidden lg:flex items-center min-w-[280px] xl:min-w-[320px]">
            <ClinicSelector />
          </div>
          
          {/* Clinic Selector - Versión móvil/tablet */}
          <div className="lg:hidden">
            {hasMultiClinicView ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 sm:h-9 px-3 text-xs sm:text-sm font-medium text-blue-700 hover:text-blue-700 border-blue-200 hover:border-blue-300 bg-blue-50 hover:bg-blue-100 shadow-sm cursor-default"
                disabled
              >
                <Globe className="h-3 w-3 mr-2" />
                <span className="truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px]">
                  Vista Unificada
                </span>
                <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700 border-blue-200">
                  Todas
                </Badge>
              </Button>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 sm:h-9 px-3 text-xs sm:text-sm font-medium text-foreground hover:text-foreground border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 shadow-sm"
                  >
                    <Building className="h-3 w-3 mr-2" />
                    <span className="truncate max-w-[120px] sm:max-w-[160px] md:max-w-[200px]">
                      {clinics.length === 0 ? 'Sin clínicas' : selectedClinicDisplayName}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="center">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <h4 className="text-sm font-semibold">Centros Médicos</h4>
                    </div>
                    {clinics.length === 0 ? (
                      <div className="px-3 py-6 text-center">
                        <Building className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">No hay clínicas disponibles</p>
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-[250px] overflow-y-auto">
                        {clinics.map((clinic) => (
                          <Button
                            key={clinic.clinic_id}
                            variant={selectedClinicId === clinic.clinic_id ? "default" : "ghost"}
                            size="sm"
                            className="w-full justify-start text-sm h-10"
                            onClick={() => setSelectedClinicId(clinic.clinic_id)}
                          >
                            <Building className="h-4 w-4 mr-3" />
                            <div className="flex flex-col items-start">
                              <span className="font-medium">{clinic.clinic_name}</span>
                              {clinic.clinic_address && (
                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                  {clinic.clinic_address}
                                </span>
                              )}
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          {/* Settings - Solo en desktop */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden lg:flex h-10 w-10 hover:bg-gray-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-all duration-200"
            onClick={() => router.push('/dashboard/configuracion')}
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">Abrir configuración</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-full hover:bg-gray-100/80 border border-gray-200/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition-all duration-200"
              >
                <Avatar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8">
                  <AvatarImage src={user?.avatarUrl || "/placeholder-user.jpg"} alt={user?.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-clinical-500 to-mint-soft-600 text-white font-semibold text-xs sm:text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Abrir menú de usuario</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-xs text-emerald-700">En línea</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => router.push('/dashboard/perfil')}
              >
                <User className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Mi Perfil</span>
                  <span className="text-xs text-muted-foreground">Ver y editar perfil</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => router.push('/dashboard/configuracion')}
              >
                <Settings className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Configuración</span>
                  <span className="text-xs text-muted-foreground">Preferencias del sistema</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="p-3 cursor-pointer hover:bg-red-50 text-red-600 focus:text-red-600 focus:bg-red-50" 
                onClick={logout}
              >
                <LogOut className="mr-3 h-4 w-4" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Cerrar Sesión</span>
                  <span className="text-xs text-red-500">Salir del sistema</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
    </div>
  )
}
