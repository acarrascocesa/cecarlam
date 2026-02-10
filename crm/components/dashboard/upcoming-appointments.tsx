"use client"

import { useState } from "react"
import { useAppContext } from "@/context/app-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, User } from "lucide-react"
import Link from "next/link"
import { isToday, isTomorrow, isYesterday, isValid } from "date-fns"

export function UpcomingAppointments() {
  const { appointments } = useAppContext()
  const [activeTab, setActiveTab] = useState("pendientes")

  // Función para formatear fechas relativas con validación
  const formatRelativeDate = (dateValue: Date | string) => {
    const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue
    
    if (!isValid(date)) return "Fecha inválida"

    if (isToday(date)) return "Hoy"
    if (isTomorrow(date)) return "Mañana"
    if (isYesterday(date)) return "Ayer"

    return date.toLocaleDateString("es-ES", { day: "numeric", month: "long" })
  }

  // Función para obtener el color del badge según el tipo de cita
  const getBadgeVariant = (type: string) => {
    const typeLower = type.toLowerCase()
    if (typeLower.includes('consulta') || typeLower.includes('general')) return 'default'
    if (typeLower.includes('emergencia') || typeLower.includes('urgente')) return 'destructive'
    if (typeLower.includes('seguimiento') || typeLower.includes('control')) return 'secondary'
    return 'outline'
  }

  // Función para filtrar citas según el tab activo
  const getFilteredAppointments = () => {
    return appointments
      .filter((appointment) => {
        const appointmentDate = typeof appointment.date === "string" ? new Date(appointment.date) : appointment.date

        // Verificar que la fecha sea válida antes de compararla
        if (!isValid(appointmentDate)) return false

        if (activeTab === "pendientes") {
          // Solo mostrar citas pendientes y futuras
          return appointmentDate >= new Date(new Date().setHours(0, 0, 0, 0)) && 
                 appointment.status === "Pendiente"
        } else {
          // Mostrar citas completadas del día actual
          return isToday(appointmentDate) && appointment.status === "Completada"
        }
      })
      .sort((a, b) => {
        const dateA = typeof a.date === "string" ? new Date(a.date) : a.date
        const dateB = typeof b.date === "string" ? new Date(b.date) : b.date

        // Verificar validez de fechas antes de ordenar
        if (!isValid(dateA) || !isValid(dateB)) return 0

        if (dateA.getTime() !== dateB.getTime()) {
          return dateA.getTime() - dateB.getTime()
        }

        // Si las fechas son iguales, ordenar por hora
        const timeA = a.time.split(":").map(Number)
        const timeB = b.time.split(":").map(Number)

        if (timeA[0] !== timeB[0]) {
          return timeA[0] - timeB[0]
        }

        return timeA[1] - timeB[1]
      })
      .slice(0, 4) // Mostrar solo las 4 próximas citas
  }

  const filteredAppointments = getFilteredAppointments()

  // Función para renderizar el contenido de las citas
  const renderAppointments = () => {
    if (filteredAppointments.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-mint-soft-100 rounded-full flex items-center justify-center">
            <Calendar className="h-8 w-8 text-mint-soft-600" />
          </div>
          <p className="text-muted-foreground mb-4">
            {activeTab === "pendientes" 
              ? "No hay citas pendientes programadas próximamente"
              : "No hay citas completadas hoy"
            }
          </p>
          {activeTab === "pendientes" && (
            <Button asChild className="bg-gradient-to-r from-gold-institutional-500 to-green-health-600 hover:from-gold-institutional-600 hover:to-green-health-700 text-white border-0 shadow-lg">
              <Link href="/dashboard/citas/nueva">Programar una cita</Link>
            </Button>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="group relative overflow-hidden border border-mint-soft-200 rounded-lg p-4 bg-gradient-to-r from-mint-soft-50 to-mint-soft-100 hover:from-mint-soft-100 hover:to-mint-soft-200 transition-all duration-300 hover:shadow-md"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-mint-soft-200 rounded-full -translate-y-8 translate-x-8 opacity-20 group-hover:opacity-30 transition-opacity"></div>
            
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 justify-between relative z-10">
              <div className="flex items-center space-x-4">
                <Avatar className="ring-2 ring-mint-soft-200">
                  <AvatarImage src={appointment.patient.image || "/placeholder.svg"} alt={appointment.patient.name} />
                  <AvatarFallback className="bg-mint-soft-100 text-mint-soft-700">
                    {appointment.patient.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link 
                    href={`/dashboard/pacientes/${appointment.patient.id}`} 
                    className="font-semibold text-mint-soft-900 hover:text-mint-soft-700 hover:underline transition-colors"
                  >
                    {appointment.patient.name}
                  </Link>
                  <div className="flex items-center mt-1">
                    <Badge 
                      variant={getBadgeVariant(appointment.type)} 
                      className="text-xs font-medium"
                    >
                      {appointment.type}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex flex-col items-end text-sm">
                  <div className="flex items-center text-mint-soft-700 font-medium">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>{formatRelativeDate(appointment.date)}</span>
                  </div>
                  <div className="flex items-center text-mint-soft-600">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{appointment.time}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="border-mint-soft-300 text-mint-soft-700 hover:bg-mint-soft-600 hover:text-white hover:border-mint-soft-600 transition-all duration-300"
                >
                  <Link href={`/dashboard/citas/${appointment.id}`}>Ver</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="otras">Completadas</TabsTrigger>
        </TabsList>
        <TabsContent value="pendientes" className="mt-0">
          {renderAppointments()}
        </TabsContent>
        <TabsContent value="otras" className="mt-0">
          {renderAppointments()}
        </TabsContent>
      </Tabs>
    </div>
  )
}
