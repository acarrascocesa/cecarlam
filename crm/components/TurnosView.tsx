"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, User, FileText, MoveToEnd } from "lucide-react"
import { format, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/app-context"

interface TurnosViewProps {
  date?: Date
}

export default function TurnosView({ date = new Date() }: TurnosViewProps) {
  const { appointments, updateAppointment } = useAppContext()
  const router = useRouter()

  // Función helper para parsear fechas de citas
  const parseAppointmentDate = (appointmentDate: Date | string) => {
    if (typeof appointmentDate === "string") {
      if (appointmentDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = appointmentDate.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
      }
      if (appointmentDate.includes('T')) {
        const dateOnly = appointmentDate.split('T')[0];
        const [year, month, day] = dateOnly.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0, 0);
      }
      return new Date(appointmentDate);
    }
    return appointmentDate;
  }

  // Función helper para verificar si una cita es del día seleccionado
  const isAppointmentOnSelectedDate = (appointmentDate: Date | string) => {
    const parsedDate = parseAppointmentDate(appointmentDate);
    const selectedDate = date || new Date();
    
    return (
      parsedDate.getDate() === selectedDate.getDate() &&
      parsedDate.getMonth() === selectedDate.getMonth() &&
      parsedDate.getFullYear() === selectedDate.getFullYear()
    );
  }
  


  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Filtrar citas del día seleccionado que han llegado (Confirmadas)
  const todayAppointments = appointments
    .filter(appointment => {
      const isSelectedDate = isAppointmentOnSelectedDate(appointment.date)
      const isConfirmed = appointment.status === 'Confirmada'
      return isSelectedDate && isConfirmed
    })
    .sort((a, b) => {
      // Ordenar por timestamp de llegada (más antiguo primero)
      if (!a.arrivalTimestamp && !b.arrivalTimestamp) return 0
      if (!a.arrivalTimestamp) return 1 // Sin timestamp va al final
      if (!b.arrivalTimestamp) return -1 // Sin timestamp va al final
      
      const timeA = new Date(a.arrivalTimestamp).getTime()
      const timeB = new Date(b.arrivalTimestamp).getTime()
      return timeA - timeB
    })

  // Citas pendientes (no han llegado)
  const pendingAppointments = appointments
    .filter(appointment => {
      const isSelectedDate = isAppointmentOnSelectedDate(appointment.date)
      return isSelectedDate && appointment.status === 'Pendiente'
    })
    .sort((a, b) => {
      // Ordenar por hora de cita
      const timeA = a.time.split(":").map(Number)
      const timeB = b.time.split(":").map(Number)
      return timeA[0] - timeB[0]
    })

  // Citas completadas del día
  const completedAppointments = appointments
    .filter(appointment => {
      const isSelectedDate = isAppointmentOnSelectedDate(appointment.date)
      return isSelectedDate && appointment.status === 'Completada'
    })
    .sort((a, b) => {
      // Ordenar por timestamp de llegada (más antiguo primero)
      if (!a.arrivalTimestamp && !b.arrivalTimestamp) return 0
      if (!a.arrivalTimestamp) return 1
      if (!b.arrivalTimestamp) return -1
      
      const timeA = new Date(a.arrivalTimestamp).getTime()
      const timeB = new Date(b.arrivalTimestamp).getTime()
      return timeA - timeB
    })

  const handleMarkArrival = async (appointmentId: string) => {
    try {
      const arrivalTime = new Date().toISOString()
      
      await updateAppointment(appointmentId, {
        status: 'Confirmada',
        arrivalTimestamp: arrivalTime
      })
      
      console.log('Cita marcada como llegada:', { appointmentId, arrivalTime })
    } catch (error) {
      console.error('Error al marcar llegada:', error)
    }
  }

  const handleMarkCompleted = async (appointmentId: string) => {
    try {
      await updateAppointment(appointmentId, {
        status: 'Completada'
      })
    } catch (error) {
      console.error('Error al marcar como completada:', error)
    }
  }

  /** Pasar al final: actualiza arrival_timestamp a ahora para que quede último en la cola */
  const handleMoveToEnd = async (appointmentId: string) => {
    try {
      const newArrivalTime = new Date().toISOString()
      await updateAppointment(appointmentId, {
        status: 'Confirmada',
        arrivalTimestamp: newArrivalTime
      })
    } catch (error) {
      console.error('Error al pasar al final:', error)
    }
  }

  const handleCreateMedicalRecord = (appointment: any) => {
    // Navegar a crear historia clínica con datos pre-poblados
    const params = new URLSearchParams({
      patientId: appointment.patient.id,
      appointmentId: appointment.id,
      returnTo: 'turnos'
    });
    
    router.push(`/dashboard/historia-clinica/nuevo?${params.toString()}`);
  }

  const calculateWaitTime = (arrivalTimestamp: string) => {
    if (!arrivalTimestamp) return '0 min'
    
    const arrival = new Date(arrivalTimestamp)
    if (isNaN(arrival.getTime())) return '0 min'
    
    const now = new Date()
    const diffMs = now.getTime() - arrival.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 60) {
      return `${diffMins} min`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return `${hours}h ${mins}min`
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Orden de Atención - {format(date, "EEEE d 'de' MMMM", { locale: es })}
          </CardTitle>
          <CardDescription>
            Pacientes en orden de llegada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{todayAppointments.length}</div>
              <div className="text-sm text-muted-foreground">En espera</div>
            </div>
            <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => isAppointmentOnSelectedDate(a.date) && a.status === 'Completada').length}
            </div>
              <div className="text-sm text-muted-foreground">Atendidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pendingAppointments.length}</div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pacientes en espera */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Pacientes en Espera
          </CardTitle>
          <CardDescription>
            Ordenados por hora de llegada. Si el paciente pierde su turno, use &quot;Pasar al final&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay pacientes en espera</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments
                .filter(appointment => appointment.arrivalTimestamp) // Solo mostrar citas con timestamp válido
                .map((appointment, index) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Turno #{index + 1}</span>
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(appointment.patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{appointment.patient.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        Llegó: {format(new Date(appointment.arrivalTimestamp), 'HH:mm')}
                        <span className="text-orange-600">
                          (Espera: {calculateWaitTime(appointment.arrivalTimestamp)})
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{appointment.type}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveToEnd(appointment.id)}
                      title="El paciente pierde su lugar y pasa al final de la cola"
                    >
                      <MoveToEnd className="h-4 w-4 mr-1" />
                      Pasar al final
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleCreateMedicalRecord(appointment)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Nueva Historia
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleMarkCompleted(appointment.id)}
                    >
                      Completar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pacientes pendientes */}
      {pendingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pacientes Pendientes
            </CardTitle>
            <CardDescription>
              Citas programadas que aún no han llegado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(appointment.patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{appointment.patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Cita: {appointment.time} - {appointment.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{appointment.status}</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleMarkArrival(appointment.id)}
                    >
                      Llegó
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pacientes atendidos */}
      {completedAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Pacientes Atendidos
            </CardTitle>
            <CardDescription>
              Citas completadas del día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedAppointments.map((appointment, index) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      ✓
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm font-medium">
                        {getInitials(appointment.patient.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{appointment.patient.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {appointment.arrivalTimestamp && (
                          <>
                            Llegó: {format(new Date(appointment.arrivalTimestamp), 'HH:mm')}
                            <span className="text-green-600">
                              - Completada
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{appointment.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
