"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Stethoscope, Plus } from "lucide-react"
import Link from "next/link"
import type { Service } from "@/types/recetario"

interface ServiceSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  services: Service[]
  onSelect: (service: Service) => void
}

// Tipos necesarios para Service
type ServiceWithInsurance = Service & {
  insuranceType?: string
}

const SERVICE_CATEGORIES = ['all', 'Consulta', 'Procedimiento', 'Imagenología'] as const

export function ServiceSelector({
  open,
  onOpenChange,
  services,
  onSelect
}: ServiceSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const filteredServices = services.filter(service => {
    if (selectedCategory === 'all') return true
    return service.category === selectedCategory
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Seleccionar Servicio</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Recomienda un servicio de tu catálogo para agregarlo a la prescripción
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {services.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Stethoscope className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No hay servicios</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Primero debes agregar servicios a tu catálogo
              </p>
              <Button asChild size="sm" className="text-xs sm:text-sm">
                <Link href="/dashboard/servicios">
                  Ir a Servicios
                </Link>
              </Button>
            </div>
          ) : (
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
                <TabsTrigger value="all" className="text-xs sm:text-sm">Todos</TabsTrigger>
                {SERVICE_CATEGORIES.filter(cat => cat !== 'all').map(cat => (
                  <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {SERVICE_CATEGORIES.map(category => (
                <TabsContent key={category} value={category} className="space-y-4">
                  {filteredServices.filter(s => category === 'all' || s.category === category).map((service) => (
                    <Card key={service.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardContent className="p-3 sm:p-4" onClick={() => onSelect(service)}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                              <h3 className="font-semibold text-sm sm:text-lg">{service.name}</h3>
                              {service.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {service.category}
                                </Badge>
                              )}
                              {service.insuranceType && (
                                <Badge 
                                  variant={service.insuranceType === "Seguro" ? "default" : "secondary"} 
                                  className="text-xs"
                                >
                                  {service.insuranceType}
                                </Badge>
                              )}
                            </div>
                            
                            {service.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2">{service.description}</p>
                            )}
                            
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                              {service.basePrice !== undefined && (
                                <span className="font-medium">
                                  Precio: RD$ {service.basePrice.toLocaleString()}
                                </span>
                              )}
                              {service.insuranceCoveragePercentage && service.insuranceCoveragePercentage > 0 && (
                                <span className="text-muted-foreground">
                                  ({service.insuranceCoveragePercentage}% cubierto)
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
