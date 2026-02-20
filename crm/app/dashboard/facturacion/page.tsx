"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Download, Filter, Plus, Search, Phone, CheckCircle, AlertCircle, Calendar, Pill, CreditCard, Banknote, X, CalendarDays } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import * as XLSX from "xlsx"

// Categorías de servicio (igual que en Catálogo de Servicios)
const SERVICE_CATEGORIES = ["Consulta", "Procedimiento", "Laboratorio", "Imagenología", "Terapia", "Cortesía"]

export default function InvoicesPage() {
  const { invoices } = useAppContext()
  const { user } = useAuth()
  const canCreateInvoice = user?.role !== "cajera"
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  
  // Nuevos filtros
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("todos")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined)
  const [serviceTypeFilter, setServiceTypeFilter] = useState("todos")
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Función para obtener iniciales del nombre y apellido
  const getInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    setSearchTerm("")
    setPaymentMethodFilter("todos")
    setStatusFilter("todos")
    setDateFilter(undefined)
    setServiceTypeFilter("todos")
    setActiveTab("todos")
  }

  // Contar facturas por estado (para badges en tabs)
  const pendientesCount = invoices.filter((i) => i?.status === "Pendiente").length

  // Contar filtros activos
  const activeFiltersCount = [
    searchTerm !== "",
    paymentMethodFilter !== "todos",
    statusFilter !== "todos",
    dateFilter !== undefined,
    serviceTypeFilter !== "todos",
    activeTab !== "todos"
  ].filter(Boolean).length

  // Filtrar facturas con todos los filtros combinados
  const filteredInvoices = invoices.filter((invoice) => {
    if (!invoice) return false;
    
    // Filtro por fecha (invoice_date del día seleccionado)
    if (dateFilter) {
      const invDate = invoice.invoice_date ? new Date(invoice.invoice_date) : null
      if (!invDate) return false
      const invDateStr = format(invDate, "yyyy-MM-dd")
      const filterDateStr = format(dateFilter, "yyyy-MM-dd")
      if (invDateStr !== filterDateStr) return false
    }
    
    // Filtro de búsqueda por texto
    const matchesSearch = !searchTerm ||
      (invoice.patient_name && invoice.patient_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.insurance_provider && invoice.insurance_provider.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (invoice.policy_number && invoice.policy_number.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtro por método de pago
    const matchesPaymentMethod = paymentMethodFilter === "todos" || 
      invoice.payment_method === paymentMethodFilter

    // Filtro por estado (independiente de tabs)
    const matchesStatus = statusFilter === "todos" || 
      invoice.status === statusFilter

    // Filtro por tabs (compatible con filtro de estado)
    const matchesTab = activeTab === "todos" || 
      (invoice.status && invoice.status.toLowerCase() === activeTab.toLowerCase())

    // Filtro por tipo de servicio: factura debe tener al menos un ítem con esa categoría
    const items = invoice.items || []
    const matchesServiceType = serviceTypeFilter === "todos" ||
      items.some((item: any) => (item.category || item.service_category) === serviceTypeFilter)

    return matchesSearch && matchesPaymentMethod && matchesStatus && matchesTab && matchesServiceType
  })

  // Función para exportar facturas a Excel (con servicios y totales)
  const exportInvoices = () => {
    const headers = ["Nº", "Paciente", "Fecha", "ID Factura", "Servicio", "Precio", "Seguro Cubre", "Paciente Paga", "Total", "Estado", "ARS"]
    
    const data: (string | number)[][] = [headers]
    let rowNum = 1
    let sumPrecio = 0
    let sumSeguro = 0
    let sumPaciente = 0
    let sumTotal = 0

    filteredInvoices.forEach((invoice) => {
      const items = invoice.items || []
      const invDate = invoice.invoice_date ? format(new Date(invoice.invoice_date), "dd/MM/yyyy", { locale: es }) : ""
      const totalServ = Number(invoice.total_services) || 0
      const segCubre = Number(invoice.insurance_covers) || 0
      const pacPaga = Number(invoice.patient_pays) || 0
      const ars = invoice.insurance_provider || "Sin seguro"

      if (items.length > 0) {
        items.forEach((item: any) => {
          const precio = Number(item.amount) || Number(item.unit_price) || 0
          const seguro = Number(item.insurance_covers) || 0
          const paciente = Number(item.patient_pays) || 0
          const total = precio
          const servicio = item.service_name || item.description || "-"
          data.push([
            rowNum++,
            invoice.patient_name || "",
            invDate,
            invoice.id?.slice(0, 8) || "",
            servicio,
            precio,
            seguro,
            paciente,
            total,
            invoice.status || "",
            ars
          ])
          sumPrecio += precio
          sumSeguro += seguro
          sumPaciente += paciente
          sumTotal += total
        })
      } else {
        data.push([
          rowNum++,
          invoice.patient_name || "",
          invDate,
          invoice.id?.slice(0, 8) || "",
          "Factura general",
          totalServ,
          segCubre,
          pacPaga,
          totalServ,
          invoice.status || "",
          ars
        ])
        sumPrecio += totalServ
        sumSeguro += segCubre
        sumPaciente += pacPaga
        sumTotal += totalServ
      }
    })

    // Filas de totales
    data.push([])
    data.push(["", "", "", "", "TOTALES", sumPrecio, sumSeguro, sumPaciente, sumTotal, "", ""])

    const ws = XLSX.utils.aoa_to_sheet(data)
    const colWidths = [{ wch: 4 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 12 }, { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 18 }]
    ws["!cols"] = colWidths

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Facturas")
    
    const fileName = dateFilter 
      ? `facturas_${format(dateFilter, "yyyy-MM-dd")}.xlsx` 
      : `facturas_${format(new Date(), "yyyy-MM-dd")}.xlsx`
    
    XLSX.writeFile(wb, fileName)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pagada":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Pendiente":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "Parcial":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "Rechazada":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pagada":
        return "default"
      case "Pendiente":
        return "outline"
      case "Parcial":
        return "secondary"
      case "Rechazada":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Facturación</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gestione las facturas y cobros de sus pacientes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {canCreateInvoice && (
            <Button asChild size="sm" className="text-xs sm:text-sm">
              <Link href="/dashboard/facturacion/nueva">
                <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Nueva Factura</span>
                <span className="sm:hidden">Nueva</span>
              </Link>
            </Button>
          )}
          <Button variant="outline" onClick={exportInvoices} size="sm" className="text-xs sm:text-sm">
            <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Exportar</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="todos" className="text-xs sm:text-sm">Todas</TabsTrigger>
            <TabsTrigger value="pendiente" className="text-xs sm:text-sm flex items-center gap-1.5">
              Pendientes
              {pendientesCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">{pendientesCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pagada" className="text-xs sm:text-sm">Pagadas</TabsTrigger>
            <TabsTrigger value="parcial" className="text-xs sm:text-sm">Parciales</TabsTrigger>
            <TabsTrigger value="rechazada" className="text-xs sm:text-sm">Rechazadas</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-2.5 top-2.5 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar factura..."
                className="pl-8 w-full sm:w-[250px] text-xs sm:text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Popover de Filtros */}
            <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-8 sm:h-10 px-3 text-xs sm:text-sm relative"
                >
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Filtros</span>
                  <span className="sm:hidden">Filtros</span>
                  {activeFiltersCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="ml-1 sm:ml-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
                    >
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Filtros Avanzados</h4>
                    {activeFiltersCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={clearAllFilters}
                        className="h-6 px-2 text-xs"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Limpiar
                      </Button>
                    )}
                  </div>
                  
                  {/* Filtro por Fecha */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Fecha (trabajado en el día)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal h-9"
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {dateFilter ? format(dateFilter, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={dateFilter}
                          onSelect={setDateFilter}
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs flex-1"
                        onClick={() => setDateFilter(new Date())}
                      >
                        Hoy
                      </Button>
                      {dateFilter && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => setDateFilter(undefined)}
                        >
                          Quitar
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Filtro por Método de Pago */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Método de Pago</Label>
                    <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">
                          <div className="flex items-center gap-2">
                            <Filter className="h-3 w-3" />
                            <span>Todos los métodos</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Efectivo">
                          <div className="flex items-center gap-2">
                            <Banknote className="h-3 w-3 text-green-600" />
                            <span>Efectivo</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Transferencia">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-3 w-3 text-blue-600" />
                            <span>Transferencia</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Filtro por Estado */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Estado de Factura</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">
                          <div className="flex items-center gap-2">
                            <Filter className="h-3 w-3" />
                            <span>Todos los estados</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Pagada">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span>Pagada</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Pendiente">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-yellow-600" />
                            <span>Pendiente</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Parcial">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-blue-600" />
                            <span>Parcial</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Rechazada">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="h-3 w-3 text-red-600" />
                            <span>Rechazada</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Filtro por Tipo de Servicio */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Tipo de servicio</Label>
                    <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">
                          <div className="flex items-center gap-2">
                            <Filter className="h-3 w-3" />
                            <span>Todos los tipos</span>
                          </div>
                        </SelectItem>
                        {SERVICE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Resumen de filtros activos */}
                  {activeFiltersCount > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        {activeFiltersCount} filtro{activeFiltersCount > 1 ? 's' : ''} activo{activeFiltersCount > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base sm:text-lg">Lista de Facturas</CardTitle>
              <CardDescription className="text-sm">
                Total: {filteredInvoices.length} facturas{" "}
                {activeTab !== "todos" ? activeTab.toLowerCase() + "s" : "registradas"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Vista Desktop - Tabla */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Total Servicios</TableHead>
                      <TableHead>Seguro Cubre</TableHead>
                      <TableHead>Paciente Paga</TableHead>
                      <TableHead>ARS</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No se encontraron facturas
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback className="text-sm font-medium">
                                  {getInitials(invoice.patient_name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{invoice.patient_name}</div>
                                <div className="text-sm text-muted-foreground">ID: {invoice.id}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{(invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : "")}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium">RD$ {(invoice.total_services || 0).toLocaleString()}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-green-600 font-medium">
                              RD$ {(invoice.insurance_covers || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-orange-600 font-medium">
                              RD$ {(invoice.patient_pays || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="text-sm">{(invoice.insurance_provider || "Sin seguro")}</div>
                              {false && (
                                <CheckCircle className="h-3 w-3 text-green-500" data-title="Cobertura verificada" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(invoice.status)}
                              <Badge variant={getStatusBadgeVariant(invoice.status)}>
                                {invoice.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/citas/nueva?patientId=${invoice.patient_id}&returnTo=facturacion&invoiceId=${invoice.id}`}>
                                  <Calendar className="h-3 w-3" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/recetario?patientId=${invoice.patient_id}&returnTo=facturacion&invoiceId=${invoice.id}`}>
                                  <Pill className="h-3 w-3" />
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/facturacion/${invoice.id}`}>Ver</Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Vista Mobile/Tablet - Cards */}
              <div className="lg:hidden space-y-4 p-4">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No se encontraron facturas</p>
                  </div>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <Card key={invoice.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="text-sm font-medium">
                              {getInitials(invoice.patient_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm sm:text-base">{invoice.patient_name}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">ID: {invoice.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(invoice.status)}
                          <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs">
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mb-3">
                        <div>
                          <span className="font-medium">Fecha:</span>
                          <p className="text-muted-foreground">{(invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : "")}</p>
                        </div>
                        <div>
                          <span className="font-medium">ARS:</span>
                          <p className="text-muted-foreground truncate">{(invoice.insurance_provider || "Sin seguro")}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-xs sm:text-sm mb-3">
                        <div>
                          <span className="font-medium">Total:</span>
                          <p className="text-muted-foreground">RD$ {(invoice.total_services || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Seguro:</span>
                          <p className="text-green-600">RD$ {(invoice.insurance_covers || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-orange-600">Paciente:</span>
                          <p className="text-orange-600">RD$ {(invoice.patient_pays || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
                          <Link href={`/dashboard/citas/nueva?patientId=${invoice.patient_id}&returnTo=facturacion&invoiceId=${invoice.id}`}>
                            <Calendar className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
                          <Link href={`/dashboard/recetario?patientId=${invoice.patient_id}&returnTo=facturacion&invoiceId=${invoice.id}`}>
                            <Pill className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="text-xs sm:text-sm">
                          <Link href={`/dashboard/facturacion/${invoice.id}`}>Ver Detalles</Link>
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
