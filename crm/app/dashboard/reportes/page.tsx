"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Download, FileText, Filter, Printer, Plus, Trash2, Eye, Search, RefreshCw } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useReports } from "@/hooks/useReports"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import { getClinicDisplayName } from "@/lib/clinicDisplayNames"
import { INSURANCE_PROVIDERS } from "@/lib/constants/insuranceProviders"

export default function ReportesPage() {
  const { user } = useAuth()
  const { selectedClinicId, clinics } = useAppContext()
  const { toast } = useToast()
  
  const {
    reports,
    templates,
    loading,
    error,
    fetchReports,
    generateReport,
    getReportById,
    deleteReport,
    downloadReport,
    fetchTemplates,
    createTemplate
  } = useReports()

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    type: "financial" as "financial" | "appointments" | "patients" | "medical" | "insurance_billing",
    format: "pdf" as "pdf" | "excel" | "csv",
    startDate: "",
    endDate: "",
    clinicId: selectedClinicId || "all",
    insuranceProvider: "all"
  })

  // Estados de UI
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  // Cargar datos al inicializar
  useEffect(() => {
    fetchReports()
    fetchTemplates()
  }, [fetchReports, fetchTemplates])

  // Actualizar clinicId cuando cambie la selección
  useEffect(() => {
    setFormData(prev => ({ ...prev, clinicId: selectedClinicId || "all" }))
  }, [selectedClinicId])

  // Generar reporte
  const handleGenerateReport = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del reporte es obligatorio",
        variant: "destructive"
      })
      return
    }

    if (!formData.startDate || !formData.endDate) {
      toast({
        title: "Error",
        description: "Las fechas de inicio y fin son obligatorias",
        variant: "destructive"
      })
      return
    }

    try {
      setIsGenerating(true)
      
      const reportData = {
        name: formData.name,
        type: formData.type,
        format: formData.format,
        filters: {
          startDate: formData.startDate,
          endDate: formData.endDate,
          ...(formData.type === 'insurance_billing' && formData.insuranceProvider && formData.insuranceProvider !== 'all' && {
            insuranceProvider: formData.insuranceProvider
          })
        },
        clinicId: formData.clinicId === "all" ? "all" : formData.clinicId || "all"
      }

      const result = await generateReport(reportData)
      
      toast({
        title: "Éxito",
        description: `Reporte "${formData.name}" generado correctamente`,
      })

      // Limpiar formulario
      setFormData({
        name: "",
        type: "financial",
        format: "pdf",
        startDate: "",
        endDate: "",
        clinicId: selectedClinicId || "all",
        insuranceProvider: "all"
      })

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al generar el reporte",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Generar reporte desde plantilla
  const handleGenerateFromTemplate = async (template: any) => {
    try {
      setIsGenerating(true)
      
      const reportData = {
        name: `${template.name} - ${new Date().toLocaleDateString()}`,
        type: template.type as any,
        format: "pdf" as const,
        filters: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0]
        },
        clinicId: selectedClinicId || "all"
      }

      await generateReport(reportData)
      
      toast({
        title: "Éxito",
        description: `Reporte generado desde plantilla "${template.name}"`,
      })

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al generar el reporte",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Ver reporte
  const handleViewReport = async (reportId: string, reportName: string) => {
    try {
      const report = await getReportById(reportId) as any
      
      // Mostrar información del reporte
      toast({
        title: "Información del Reporte",
        description: (
          <div className="space-y-1">
            <p><strong>Nombre:</strong> {report.name}</p>
            <p><strong>Tipo:</strong> {report.type}</p>
            <p><strong>Estado:</strong> {report.status}</p>
            <p><strong>Formato:</strong> {report.format}</p>
            <p><strong>Fecha:</strong> {new Date(report.created_at).toLocaleDateString()}</p>
            {report.clinic_name && <p><strong>Clínica:</strong> {report.clinic_name}</p>}
            {report.generated_by_name && <p><strong>Generado por:</strong> {report.generated_by_name}</p>}
          </div>
        ),
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al ver el reporte",
        variant: "destructive"
      })
    }
  }

  // Descargar reporte
  const handleDownloadReport = async (reportId: string, reportName: string, reportFormat: string) => {
    try {
      // Convertir formato a extensión correcta
      const extension = reportFormat === 'excel' ? 'xlsx' : reportFormat
      await downloadReport(reportId, `${reportName}.${extension}`)
      toast({
        title: "Éxito",
        description: "Reporte descargado correctamente",
        variant: "default"
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al descargar el reporte",
        variant: "destructive"
      })
    }
  }

  // Eliminar reporte
  const handleDeleteReport = async (reportId: string, reportName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el reporte "${reportName}"?`)) {
      return
    }

    try {
      await deleteReport(reportId)
      toast({
        title: "Éxito",
        description: "Reporte eliminado correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el reporte",
        variant: "destructive"
      })
    }
  }

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || report.type === filterType
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })

  // Obtener clínica seleccionada
  const selectedClinic = clinics.find(c => c.clinic_id === selectedClinicId)

  return (
    <div className="space-y-6 max-w-9xl mx-auto w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Reportes</h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            {user?.multiClinicView ? (
              <>Genera reportes para todas tus clínicas <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Vista Unificada</span></>
            ) : (
              <>Genera reportes para {selectedClinic?.clinic_name}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => fetchReports()}
            disabled={loading}
          >
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="generar" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="generar" className="text-xs sm:text-sm">Generar Reportes</TabsTrigger>
          <TabsTrigger value="historial" className="text-xs sm:text-sm">Historial</TabsTrigger>
          <TabsTrigger value="plantillas" className="text-xs sm:text-sm">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="generar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generar Nuevo Reporte</CardTitle>
              <CardDescription>
                Crea reportes financieros, de citas, pacientes y médicos con filtros personalizados.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Reporte</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Reporte de Ingresos Enero 2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Reporte</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="financial">Reporte Financiero</SelectItem>
                      <SelectItem value="insurance_billing">Reporte de Facturación por Seguros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Fecha Inicial</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end-date">Fecha Final</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>

                {user?.multiClinicView && (
                  <div className="space-y-2">
                    <Label htmlFor="clinic">Clínica (Opcional)</Label>
                    <Select value={formData.clinicId} onValueChange={(value) => setFormData({ ...formData, clinicId: value })}>
                      <SelectTrigger id="clinic">
                        <SelectValue placeholder="Todas las clínicas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las clínicas</SelectItem>
                        {clinics.map((clinic) => (
                          <SelectItem key={clinic.id} value={clinic.clinic_id}>
                            {getClinicDisplayName(user?.email || '', clinic)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="format">Formato</Label>
                  <Select value={formData.format} onValueChange={(value) => setFormData({ ...formData, format: value as any })}>
                    <SelectTrigger id="format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'insurance_billing' && (
                  <div className="space-y-2">
                    <Label htmlFor="insurance-provider">Proveedor de Seguro (Opcional)</Label>
                    <Select value={formData.insuranceProvider} onValueChange={(value) => setFormData({ ...formData, insuranceProvider: value })}>
                      <SelectTrigger id="insurance-provider">
                        <SelectValue placeholder="Todos los proveedores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los proveedores</SelectItem>
                        {INSURANCE_PROVIDERS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleGenerateReport} 
                disabled={isGenerating || loading}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reportes Rápidos</CardTitle>
              <CardDescription>
                Genera reportes predefinidos con un solo clic.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.slice(0, 6).map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => handleGenerateFromTemplate(template)}
                  >
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
                      <CardDescription className="text-xs">{template.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-between">
                      <Badge variant="outline">{template.type}</Badge>
                      <Badge variant="secondary" className="text-xs">
                        {template.is_active ? "Activa" : "Inactiva"}
                      </Badge>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Reportes</CardTitle>
              <CardDescription>Visualiza y gestiona los reportes generados anteriormente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder="Buscar reportes..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="financial">Financiero</SelectItem>
                      <SelectItem value="insurance_billing">Facturación por Seguros</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="processing">Procesando</SelectItem>
                      <SelectItem value="failed">Fallido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No se encontraron reportes</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-6 gap-4 p-4 font-medium border-b text-xs sm:text-sm">
                    <div>Nombre</div>
                    <div className="hidden sm:block">Tipo</div>
                    <div className="hidden sm:block">Formato</div>
                    <div className="hidden lg:block">Clínica</div>
                    <div className="hidden md:block">Fecha</div>
                    <div>Acciones</div>
                  </div>
                  {filteredReports.map((report) => (
                    <div key={report.id} className="grid grid-cols-6 gap-4 p-4 border-b hover:bg-muted/50 text-xs sm:text-sm">
                      <div className="font-medium truncate">{report.name}</div>
                      <div className="hidden sm:block">
                        <Badge variant="outline" className="text-xs">
                          {report.type === 'financial' && 'Financiero'}
                          {report.type === 'insurance_billing' && 'Facturación por Seguros'}
                        </Badge>
                      </div>
                      <div className="hidden sm:block">
                        <Badge variant="secondary" className="text-xs uppercase">
                          {report.format}
                        </Badge>
                      </div>
                      <div className="hidden lg:block truncate">
                        {report.clinic_name || 'Todas'}
                      </div>
                      <div className="hidden md:block">
                        {format(new Date(report.created_at), 'dd/MM/yyyy', { locale: es })}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleViewReport(report.id, report.name)}
                          title="Ver reporte"
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => handleDownloadReport(report.id, report.name, report.format)}
                          title="Descargar reporte"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={() => handleDeleteReport(report.id, report.name)}
                          title="Eliminar reporte"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredReports.length} de {reports.length} reportes
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="plantillas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plantillas de Reportes</CardTitle>
              <CardDescription>Gestiona las plantillas predefinidas para generar reportes rápidamente.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input placeholder="Buscar plantillas..." className="pl-10" />
                </div>
                <Button className="w-full sm:w-auto" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Plantilla
                </Button>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No se encontraron plantillas</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium border-b text-xs sm:text-sm">
                    <div>Nombre</div>
                    <div className="col-span-2 hidden sm:block">Descripción</div>
                    <div className="hidden md:block">Tipo</div>
                    <div className="hidden lg:block">Estado</div>
                  </div>
                  {templates.map((template) => (
                    <div key={template.id} className="grid grid-cols-5 gap-4 p-4 border-b hover:bg-muted/50 text-xs sm:text-sm">
                      <div className="font-medium truncate">{template.name}</div>
                      <div className="col-span-2 hidden sm:block truncate">{template.description}</div>
                      <div className="hidden md:block">
                        <Badge variant="outline" className="text-xs">
                          {template.type}
                        </Badge>
                      </div>
                      <div className="hidden lg:block">
                        <Badge variant={template.is_active ? "default" : "secondary"} className="text-xs">
                          {template.is_active ? "Activa" : "Inactiva"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {templates.length} plantillas
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
