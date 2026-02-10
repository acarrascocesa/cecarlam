"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { HtmlContent } from "@/components/ui/html-content"
import { 
  ArrowLeft, 
  FileText, 
  Plus
} from "lucide-react"
import { useAppContext } from "@/context/app-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function PatientHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const { patients, medicalRecords } = useAppContext()

  const patientId = params.id as string
  const patient = patients.find(p => p.id === patientId)

  // Obtener historial médico del paciente
  const patientHistory = medicalRecords
    .filter(record => record.patient?.id === patientId || record.patient_id === patientId)
    .sort((a, b) => {
      const dateA = new Date(a.record_date || a.date || a.created_at || 0)
      const dateB = new Date(b.record_date || b.date || b.created_at || 0)
      return dateB.getTime() - dateA.getTime() // Más reciente primero
    })

  // Obtener estadísticas
  const stats = {
    totalVisits: patientHistory.length,
    lastVisit: patientHistory.length > 0 ? new Date(patientHistory[0].record_date || patientHistory[0].date || patientHistory[0].created_at) : null,
    firstVisit: patientHistory.length > 0 ? new Date(patientHistory[patientHistory.length - 1].record_date || patientHistory[patientHistory.length - 1].date || patientHistory[patientHistory.length - 1].created_at) : null
  }

  // Función para obtener iniciales
  const getInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
  }

  // Función para formatear fecha corta
  const formatShortDate = (date: Date) => {
    return format(date, "d 'de' MMMM, yyyy", { locale: es })
  }

  // Función para crear nueva visita
  const createNewVisit = () => {
    router.push(`/dashboard/historia-clinica/nuevo?patientId=${patientId}`)
  }

  if (!patient) {
    return (
      <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Paciente no encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-9xl mx-auto w-full">
      {/* Header con navegación */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Historial Médico</h1>
          <p className="text-muted-foreground">Historial completo del paciente</p>
        </div>
      </div>

      {/* Información del paciente */}
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-medium">
                {getInitials(patient.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">{patient.name}</CardTitle>
              <CardDescription className="text-base">
                Cédula: {patient.cedula} • Teléfono: {patient.phone}
              </CardDescription>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="text-sm">
                {stats.totalVisits} {stats.totalVisits === 1 ? 'visita' : 'visitas'}
              </Badge>
              {stats.lastVisit && (
                <div className="text-xs text-muted-foreground mt-1">
                  Última: {formatShortDate(stats.lastVisit)}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Historial de visitas */}
      <Card>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Historial de Visitas
              </CardTitle>
              <CardDescription>
                {stats.totalVisits > 0 
                  ? `Desde ${stats.firstVisit ? formatShortDate(stats.firstVisit) : 'N/A'} hasta ${stats.lastVisit ? formatShortDate(stats.lastVisit) : 'N/A'}`
                  : 'No hay visitas registradas'
                }
              </CardDescription>
            </div>
            <Button onClick={createNewVisit} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Visita
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {patientHistory.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No hay visitas registradas para este paciente.</p>
              <Button onClick={createNewVisit} className="mt-4">
                Registrar Primera Visita
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {patientHistory.map((visit, index) => {
                const visitDate = new Date(visit.record_date || visit.date || visit.created_at)
                
                return (
                  <div key={visit.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-blue-600 font-bold text-lg">
                          {formatDate(visitDate)}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {visit.record_type || visit.type || 'Consulta'}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-muted-foreground">Doctor:</span>
                        <span className="font-medium">
                          Dr. {visit.doctor?.name || visit.doctor_name || visit.doctor || 'No especificado'}
                        </span>
                      </div>
                      
                      {visit.diagnosis && (
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Diagnóstico:</span>
                          <div className="ml-2 mt-1">
                            <HtmlContent content={visit.diagnosis} className="text-sm" />
                          </div>
                        </div>
                      )}
                      
                      {visit.treatment && (
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Tratamiento:</span>
                          <span className="ml-2">{visit.treatment}</span>
                        </div>
                      )}
                      
                      {visit.notes && (
                        <div className="text-sm">
                          <span className="font-medium text-muted-foreground">Notas:</span>
                          <span className="ml-2 text-red-600 font-bold">{visit.notes}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/dashboard/historia-clinica/${visit.id}`}>
                          Ver Detalles
                        </a>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
