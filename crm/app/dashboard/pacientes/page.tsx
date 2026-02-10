"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Download, Filter, Plus, Search, Loader2, FileText, Calendar } from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default function PatientsPage() {
  const { patients, loading, selectedClinicId } = useAppContext()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")

  // Función para obtener iniciales del nombre y apellido
  const getInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Filtrar pacientes según el término de búsqueda y la pestaña activa
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.insuranceProvider || '').toLowerCase().includes(searchTerm.toLowerCase())

    if (activeTab === "todos") return matchesSearch
    return matchesSearch && patient.status.toLowerCase() === activeTab.toLowerCase()
  })

  // Función para exportar pacientes a CSV
  const exportPatients = () => {
    // Crear cabeceras CSV
    const headers = ["ID", "Nombre", "Cédula", "Email", "Teléfono", "Estado", "Última Visita", "Seguro"]

    // Convertir datos de pacientes a filas CSV
    const rows = filteredPatients.map((patient) => [
      patient.id,
      patient.name,
      patient.cedula || 'N/A',
      patient.email,
      patient.phone,
      patient.status,
      patient.updatedAt ? (() => {
        const dateStr = patient.updatedAt;
        
        if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = dateStr.split('-').map(Number);
          return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
        }
        
        if (typeof dateStr === 'string' && dateStr.includes('T')) {
          const dateOnly = dateStr.split('T')[0];
          const [year, month, day] = dateOnly.split('-').map(Number);
          return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
        }
        
        const date = new Date(dateStr);
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      })() : 'N/A',
      patient.insuranceProvider || 'N/A',
    ])

    // Combinar cabeceras y filas
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Crear un blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "pacientes.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!selectedClinicId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Seleccione una clínica</h2>
          <p className="text-muted-foreground">Debe seleccionar una clínica para ver los pacientes</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Cargando pacientes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gestione la información de sus pacientes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild size="sm" className="text-xs sm:text-sm">
            <Link href="/dashboard/pacientes/nuevo">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Nuevo Paciente</span>
              <span className="sm:hidden">Nuevo</span>
            </Link>
          </Button>
          <Button variant="outline" onClick={exportPatients} size="sm" className="text-xs sm:text-sm">
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Exportar</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="todos" className="text-xs sm:text-sm">Todos</TabsTrigger>
            <TabsTrigger value="activo" className="text-xs sm:text-sm">Activos</TabsTrigger>
            <TabsTrigger value="pendiente" className="text-xs sm:text-sm">Pendientes</TabsTrigger>
            <TabsTrigger value="inactivo" className="text-xs sm:text-sm">Inactivos</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar paciente..."
                className="pl-6 sm:pl-8 w-full sm:w-[250px] text-xs sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="sr-only">Filtrar</span>
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab}>
          {/* Vista de tabla para desktop */}
          <div className="hidden lg:block">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Lista de Pacientes</CardTitle>
                <CardDescription>
                  Total: {filteredPatients.length} pacientes{" "}
                  {activeTab !== "todos" ? activeTab.toLowerCase() + "s" : "registrados"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Cédula</TableHead>
                        <TableHead>Clínica</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Seguro</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Última Visita</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No se encontraron pacientes
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPatients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={patient.avatarUrl} />
                                  <AvatarFallback className="text-sm font-medium">
                                    {getInitials(patient.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{patient.name}</div>
                                  <div className="text-sm text-muted-foreground">ID: {patient.id.slice(0, 8)}...</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{patient.cedula || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                              {patient.clinicName ? (
                                <Badge variant="outline" className="text-xs">
                                  {patient.clinicName}
                                </Badge>
                              ) : (
                                <span className="text-xs text-muted-foreground">Clínica no especificada</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{patient.email}</div>
                                <div>{patient.phone}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{patient.insuranceProvider || 'N/A'}</div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  patient.status === "Activo"
                                    ? "default"
                                    : patient.status === "Pendiente"
                                      ? "outline"
                                      : "secondary"
                                }
                              >
                                {patient.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{patient.updatedAt ? (() => {
                                const dateStr = patient.updatedAt;
                                
                                if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                  const [year, month, day] = dateStr.split('-').map(Number);
                                  return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                                }
                                
                                if (typeof dateStr === 'string' && dateStr.includes('T')) {
                                  const dateOnly = dateStr.split('T')[0];
                                  const [year, month, day] = dateOnly.split('-').map(Number);
                                  return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                                }
                                
                                const date = new Date(dateStr);
                                return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                              })() : 'N/A'}</div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/dashboard/historia-clinica/nuevo?patientId=${patient.id}&returnTo=pacientes`}>
                                    <FileText className="h-3 w-3" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/dashboard/citas/nueva?patientId=${patient.id}&returnTo=pacientes`}>
                                    <Calendar className="h-3 w-3" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={`/dashboard/pacientes/${patient.id}`}>Ver</Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vista de cards para móviles y tablets */}
          <div className="lg:hidden space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pacientes</h3>
              <p className="text-sm text-muted-foreground">
                {filteredPatients.length} {activeTab !== "todos" ? activeTab.toLowerCase() + "s" : "registrados"}
              </p>
            </div>
            
            {filteredPatients.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No se encontraron pacientes</p>
                </CardContent>
              </Card>
            ) : (
              filteredPatients.map((patient) => (
                <Card key={patient.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar>
                          <AvatarImage src={patient.avatarUrl} />
                          <AvatarFallback className="text-sm font-medium">
                            {getInitials(patient.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm sm:text-base truncate">{patient.name}</h3>
                          <p className="text-xs text-muted-foreground">ID: {patient.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          patient.status === "Activo"
                            ? "default"
                            : patient.status === "Pendiente"
                              ? "outline"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {patient.status}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Cédula:</span>
                        <span>{patient.cedula || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="truncate max-w-[200px]">{patient.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Teléfono:</span>
                        <span>{patient.phone}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Seguro:</span>
                        <span className="truncate max-w-[150px]">{patient.insuranceProvider || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Última visita:</span>
                        <span>{patient.updatedAt ? (() => {
                          const dateStr = patient.updatedAt;
                          
                          if (typeof dateStr === 'string' && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const [year, month, day] = dateStr.split('-').map(Number);
                            return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                          }
                          
                          if (typeof dateStr === 'string' && dateStr.includes('T')) {
                            const dateOnly = dateStr.split('T')[0];
                            const [year, month, day] = dateOnly.split('-').map(Number);
                            return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                          }
                          
                          const date = new Date(dateStr);
                          return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                        })() : 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild className="text-xs">
                        <Link href={`/dashboard/historia-clinica/nuevo?patientId=${patient.id}&returnTo=pacientes`}>
                          <FileText className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="text-xs">
                        <Link href={`/dashboard/citas/nueva?patientId=${patient.id}&returnTo=pacientes`}>
                          <Calendar className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild className="text-xs">
                        <Link href={`/dashboard/pacientes/${patient.id}`}>
                          Ver Detalles
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
