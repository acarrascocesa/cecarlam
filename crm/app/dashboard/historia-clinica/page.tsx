"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Search, User, Calendar, FileText, Plus, Eye } from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/context/app-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MedicalRecordsPage() {
  const { patients, medicalRecords } = useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("name")
  const [filterBy, setFilterBy] = useState<string>("all")

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Función para obtener historial de un paciente
  const getPatientHistory = (patientId: string) => {
    return medicalRecords.filter(record => 
      record.patient?.id === patientId || record.patient_id === patientId
    ).sort((a, b) => {
      const dateA = new Date(a.record_date || a.date || a.created_at || 0)
      const dateB = new Date(b.record_date || b.date || b.created_at || 0)
      return dateB.getTime() - dateA.getTime() // Más reciente primero
    })
  }

  // Función para obtener estadísticas del paciente
  const getPatientStats = (patientId: string) => {
    const history = getPatientHistory(patientId)
    if (history.length === 0) return { totalVisits: 0, lastVisit: null, firstVisit: null }
    
    const lastVisit = new Date(history[0].record_date || history[0].date || history[0].created_at)
    const firstVisit = new Date(history[history.length - 1].record_date || history[history.length - 1].date || history[history.length - 1].created_at)
    
    return {
      totalVisits: history.length,
      lastVisit: lastVisit.toLocaleDateString(),
      firstVisit: firstVisit.toLocaleDateString()
    }
  }

  // Filtrar y ordenar pacientes
  const filteredPatients = patients
    .filter(patient => {
      const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           patient.cedula.includes(searchQuery)
      
      if (filterBy === "all") return matchesSearch
      if (filterBy === "with-visits") {
        const stats = getPatientStats(patient.id)
        return matchesSearch && stats.totalVisits > 0
      }
      if (filterBy === "no-visits") {
        const stats = getPatientStats(patient.id)
        return matchesSearch && stats.totalVisits === 0
      }
      
      return matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "last-visit") {
        const statsA = getPatientStats(a.id)
        const statsB = getPatientStats(b.id)
        if (!statsA.lastVisit && !statsB.lastVisit) return 0
        if (!statsA.lastVisit) return 1
        if (!statsB.lastVisit) return -1
        return new Date(statsB.lastVisit).getTime() - new Date(statsA.lastVisit).getTime()
      }
      if (sortBy === "total-visits") {
        const statsA = getPatientStats(a.id)
        const statsB = getPatientStats(b.id)
        return statsB.totalVisits - statsA.totalVisits
      }
      return 0
    })

  return (
    <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Historia Clínica</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestione el historial médico completo de sus pacientes
          </p>
        </div>
        <Button asChild size="sm" className="text-xs sm:text-sm">
          <Link href="/dashboard/pacientes/nuevo">
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Nuevo Paciente</span>
            <span className="sm:hidden">Nuevo</span>
          </Link>
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre o cédula..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrar pacientes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los pacientes</SelectItem>
            <SelectItem value="with-visits">Con visitas</SelectItem>
            <SelectItem value="no-visits">Sin visitas</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Por nombre</SelectItem>
            <SelectItem value="last-visit">Por última visita</SelectItem>
            <SelectItem value="total-visits">Por número de visitas</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-sm text-muted-foreground flex items-center justify-center">
          <span>{filteredPatients.length} pacientes</span>
        </div>
      </div>

      {/* Vista de tabla para desktop */}
      <div className="hidden lg:block">
        <Card>
          <CardHeader className="p-4">
            <CardTitle>Pacientes</CardTitle>
            <CardDescription>Lista de pacientes con su historial médico</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Total Visitas</TableHead>
                    <TableHead>Última Visita</TableHead>
                    <TableHead>Primera Visita</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No se encontraron pacientes.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => {
                      const stats = getPatientStats(patient.id)
                      
                      return (
                        <TableRow key={patient.id} className="hover:bg-muted/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="text-sm font-medium">
                                  {getInitials(patient.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{patient.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono">{patient.cedula}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={stats.totalVisits > 0 ? "default" : "secondary"}>
                              {stats.totalVisits} {stats.totalVisits === 1 ? 'visita' : 'visitas'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-blue-600 font-medium">
                              {stats.lastVisit || 'Sin visitas'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-blue-600 font-medium">
                              {stats.firstVisit || 'Sin visitas'}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/historia-clinica/paciente/${patient.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Historial
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vista de cards para móviles y tablets */}
      <div className="lg:hidden space-y-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No se encontraron pacientes.</p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => {
            const stats = getPatientStats(patient.id)
            
            return (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Avatar>
                        <AvatarFallback className="text-sm font-medium">
                          {getInitials(patient.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm sm:text-base truncate">{patient.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{patient.cedula}</p>
                      </div>
                    </div>
                    <Badge variant={stats.totalVisits > 0 ? "default" : "secondary"} className="text-xs">
                      {stats.totalVisits} {stats.totalVisits === 1 ? 'visita' : 'visitas'}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Última visita:</span>
                      <span className="text-blue-600 font-medium">{stats.lastVisit || 'Sin visitas'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-muted-foreground">Primera visita:</span>
                      <span className="text-blue-600 font-medium">{stats.firstVisit || 'Sin visitas'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" size="sm" asChild className="text-xs">
                      <Link href={`/dashboard/historia-clinica/paciente/${patient.id}`}>
                        <Eye className="mr-1 h-3 w-3" />
                        Ver Historial
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
