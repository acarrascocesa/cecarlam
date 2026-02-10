"use client"

import { useState } from "react"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash, DollarSign, Shield, Users, Activity } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ServiciosPage() {
  const { services, addService, updateService, deleteService, selectedClinicId, clinics, loading } = useAppContext()
  const { user } = useAuth()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    category: "Consulta",
    description: "",
    basePrice: 0,
    insuranceCoveragePercentage: 0,
    insuranceType: "Seguro",
    isActive: true,
    clinicId: selectedClinicId || ""
  })

  const [showPriceModifier, setShowPriceModifier] = useState(false)
  const [selectedServiceForModification, setSelectedServiceForModification] = useState<any>(null)
  const [priceModification, setPriceModification] = useState({
    reason: "",
    discountPercentage: 0,
    finalPrice: 0,
    notes: ""
  })

  const selectedClinic = clinics.find(c => c.id === selectedClinicId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (editingService) {
      updateService(editingService.id, {
        ...formData,
        clinicId: selectedClinicId!
      })
    } else {
      addService({
        ...formData,
        clinicId: selectedClinicId!
      })
    }
    
    resetForm()
    setIsDialogOpen(false)
  }

  const handleEdit = (service: any) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      basePrice: service.basePrice,
      insuranceCoveragePercentage: service.insuranceCoveragePercentage,
      insuranceType: service.insuranceType,
      isActive: service.isActive,
      clinicId: selectedClinicId || ""
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (serviceId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este servicio?")) {
      deleteService(serviceId)
    }
  }

  const resetForm = () => {
    setEditingService(null)
    setFormData({
      name: "",
      category: "Consulta",
      description: "",
      basePrice: 0,
      insuranceCoveragePercentage: 0,
      insuranceType: "Seguro",
      isActive: true,
      clinicId: selectedClinicId || ""
    })
  }

  const categories = ["Consulta", "Procedimiento", "Laboratorio", "Imagenología", "Terapia", "Cortesía"]
  const insuranceTypes = ["Seguro", "No asegurado", "En negociación"]

  const servicesByCategory = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, typeof services>)

  const servicesByInsurance = services.reduce((acc, service) => {
    if (!acc[service.insuranceType]) {
      acc[service.insuranceType] = []
    }
    acc[service.insuranceType].push(service)
    return acc
  }, {} as Record<string, typeof services>)

  if (!selectedClinicId) {
    return (
      <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
        <Alert>
          <AlertDescription>
            Por favor, selecciona una clínica para ver sus servicios.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando servicios...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Catálogo de Servicios</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {user?.multiClinicView ? (
              <>Gestiona los servicios de todas tus clínicas <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Vista Unificada</span></>
            ) : (
              <>Gestiona los servicios y precios de {selectedClinic?.clinic_name}</>
            )}
          </p>
          <Alert className="max-w-2xl mt-3">
            <AlertDescription className="text-sm">
              <strong>Nota:</strong> Los precios pueden ser modificados para casos especiales como pacientes de escasos recursos, 
              familiares del personal o personal del centro médico. Usa el botón <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 inline" /> 
              junto a cada servicio para ajustar precios.
            </AlertDescription>
          </Alert>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} size="sm" className="text-xs sm:text-sm">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Agregar Servicio</span>
              <span className="sm:hidden">Agregar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingService ? "Editar Servicio" : "Agregar Nuevo Servicio"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingService ? "Modifica los detalles del servicio" : "Crea un nuevo servicio para el catálogo"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nombre del Servicio</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Consulta + EKG"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción detallada del servicio"
                  required
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="basePrice">Precio Base (RD$)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="insuranceCoveragePercentage">Cobertura Seguro (%)</Label>
                  <Input
                    id="insuranceCoveragePercentage"
                    type="number"
                    value={formData.insuranceCoveragePercentage}
                    onChange={(e) => setFormData({ ...formData, insuranceCoveragePercentage: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="insuranceType">Tipo de Seguro</Label>
                  <Select value={formData.insuranceType} onValueChange={(value) => setFormData({ ...formData, insuranceType: value as any })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {insuranceTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Servicio Activo</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingService ? "Actualizar" : "Crear"} Servicio
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full sm:w-auto">
          <TabsTrigger value="all" className="text-xs sm:text-sm">Todos los Servicios</TabsTrigger>
          <TabsTrigger value="category" className="text-xs sm:text-sm">Por Categoría</TabsTrigger>
          <TabsTrigger value="insurance" className="text-xs sm:text-sm">Por Tipo de Seguro</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="font-semibold text-sm sm:text-base">{service.name}</h3>
                        {user?.multiClinicView && service.clinicName && (
                          <Badge variant="outline" className="text-xs bg-green-health-50 text-green-health-700">
                            {service.clinicName}
                          </Badge>
                        )}
                        <Badge variant={service.isActive ? "default" : "secondary"} className="text-xs">
                          {service.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">{service.category}</Badge>
                        <Badge variant={service.insuranceType === "Seguro" ? "default" : "secondary"} className="text-xs">
                          {service.insuranceType}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2">{service.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                          RD$ {service.basePrice.toLocaleString()}
                        </span>
                        {service.insuranceCoveragePercentage > 0 && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                            {service.insuranceCoveragePercentage}% cubierto
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(service)} className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setSelectedServiceForModification(service)
                          setPriceModification({
                            reason: "",
                            discountPercentage: 0,
                            finalPrice: service.basePrice,
                            notes: ""
                          })
                          setShowPriceModifier(true)
                        }}
                        className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                      >
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)} className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                        <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-6">
          {Object.entries(servicesByCategory).map(([category, categoryServices]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
                  {category}
                </CardTitle>
                <CardDescription className="text-sm">
                  {(categoryServices as any[]).length} servicio{(categoryServices as any[]).length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(categoryServices as any[]).map((service: any) => (
                    <div key={service.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm sm:text-base">{service.name}</h4>
                          {user?.multiClinicView && service.clinicName && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {service.clinicName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="font-semibold text-sm sm:text-base">RD$ {service.basePrice.toLocaleString()}</span>
                        <Badge variant={service.insuranceType === "Seguro" ? "default" : "secondary"} className="text-xs">
                          {service.insuranceType}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(service)} className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)} className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                            <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="insurance" className="space-y-6">
          {Object.entries(servicesByInsurance).map(([insuranceType, insuranceServices]) => (
            <Card key={insuranceType}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                  {insuranceType}
                </CardTitle>
                <CardDescription className="text-sm">
                  {(insuranceServices as any[]).length} servicio{(insuranceServices as any[]).length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(insuranceServices as any[]).map((service: any) => (
                    <div key={service.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-lg gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm sm:text-base">{service.name}</h4>
                          {user?.multiClinicView && service.clinicName && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              {service.clinicName}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{service.description}</p>
                        <Badge variant="outline" className="mt-1 text-xs">{service.category}</Badge>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <span className="font-semibold text-sm sm:text-base">RD$ {service.basePrice.toLocaleString()}</span>
                        {service.insuranceCoveragePercentage > 0 && (
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {service.insuranceCoveragePercentage}% cubierto
                          </span>
                        )}
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(service)} className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(service.id)} className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                            <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Diálogo para modificar precios */}
      <Dialog open={showPriceModifier} onOpenChange={setShowPriceModifier}>
        <DialogContent className="max-w-md w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Modificar Precio de Servicio</DialogTitle>
            <DialogDescription className="text-sm">
              Ajustar precio para casos especiales (pacientes de escasos recursos, familiares del personal, etc.)
            </DialogDescription>
          </DialogHeader>
          {selectedServiceForModification && (
            <div className="space-y-4">
              <div className="p-3 border rounded-lg bg-muted/50">
                <h4 className="font-medium">{selectedServiceForModification.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Precio base: RD$ {selectedServiceForModification.basePrice.toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="reason">Motivo del ajuste</Label>
                <Select 
                  value={priceModification.reason} 
                  onValueChange={(value) => setPriceModification({...priceModification, reason: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="escasez_recursos">Paciente de escasos recursos</SelectItem>
                    <SelectItem value="familiar_personal">Familiar del personal</SelectItem>
                    <SelectItem value="personal_centro">Personal del centro médico</SelectItem>
                    <SelectItem value="otro">Otro motivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discountPercentage">Porcentaje de descuento (%)</Label>
                <Input
                  id="discountPercentage"
                  type="number"
                  value={priceModification.discountPercentage}
                  onChange={(e) => {
                    const discount = parseFloat(e.target.value) || 0
                    const finalPrice = selectedServiceForModification.basePrice * (1 - discount / 100)
                    setPriceModification({
                      ...priceModification,
                      discountPercentage: discount,
                      finalPrice: Math.round(finalPrice)
                    })
                  }}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <Label htmlFor="finalPrice">Precio final (RD$)</Label>
                <Input
                  id="finalPrice"
                  type="number"
                  value={priceModification.finalPrice}
                  onChange={(e) => setPriceModification({...priceModification, finalPrice: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={priceModification.notes}
                  onChange={(e) => setPriceModification({...priceModification, notes: e.target.value})}
                  placeholder="Detalles adicionales sobre el ajuste de precio..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowPriceModifier(false)} size="sm" className="text-xs sm:text-sm">
                  Cancelar
                </Button>
                <Button onClick={() => {
                  // Aquí se aplicaría la modificación del precio
                  alert(`Precio modificado para ${selectedServiceForModification.name}:\nPrecio base: RD$ ${selectedServiceForModification.basePrice.toLocaleString()}\nPrecio final: RD$ ${priceModification.finalPrice.toLocaleString()}\nMotivo: ${priceModification.reason}`)
                  setShowPriceModifier(false)
                }} size="sm" className="text-xs sm:text-sm">
                  Aplicar Modificación
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 