"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pill, Search, Plus } from "lucide-react"
import Link from "next/link"
import type { Medication } from "@/types/recetario"

interface MedicationSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medications: Medication[]
  searchTerm: string
  onSearchChange: (value: string) => void
  onSelect: (medication: Medication) => void
}

export function MedicationSelector({
  open,
  onOpenChange,
  medications,
  searchTerm,
  onSearchChange,
  onSelect
}: MedicationSelectorProps) {
  // Filtrar medicamentos localmente
  const filteredMedications = searchTerm.trim()
    ? medications.filter(medication =>
        medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medication.dosage?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : medications

  return (
    <Dialog 
      open={open} 
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) onSearchChange("")
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Seleccionar Medicamento</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Elige un medicamento de tu catálogo para agregarlo a la prescripción
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar medicamentos por nombre, genérico, categoría o dosis..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-slate-200 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100"
              onClick={() => onSearchChange("")}
            >
              ×
            </Button>
          )}
        </div>

        <div className="grid gap-4">
          {medications.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Pill className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No hay medicamentos</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Primero debes agregar medicamentos a tu catálogo
              </p>
              <Button asChild size="sm" className="text-xs sm:text-sm">
                <Link href="/dashboard/medicamentos">
                  Ir a Medicamentos
                </Link>
              </Button>
            </div>
          ) : filteredMedications.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Search className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No se encontraron medicamentos</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                Intenta con otros términos de búsqueda
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm"
                onClick={() => onSearchChange("")}
              >
                Limpiar búsqueda
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {searchTerm && (
                <div className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Mostrando {filteredMedications.length} de {medications.length} medicamentos
                </div>
              )}
              {filteredMedications.map((medication) => (
                <Card key={medication.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardContent className="p-3 sm:p-4" onClick={() => onSelect(medication)}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                          <h3 className="font-semibold text-sm sm:text-lg">{medication.name}</h3>
                          {medication.genericName && (
                            <Badge variant="outline" className="text-xs">
                              {medication.genericName}
                            </Badge>
                          )}
                          {medication.category && (
                            <Badge variant="secondary" className="text-xs">
                              {medication.category}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                          {medication.dosage && (
                            <div>
                              <span className="font-medium">Dosis:</span>
                              <p className="text-muted-foreground">{medication.dosage}</p>
                            </div>
                          )}
                          {medication.frequency && (
                            <div>
                              <span className="font-medium">Frecuencia:</span>
                              <p className="text-muted-foreground">{medication.frequency}</p>
                            </div>
                          )}
                          {medication.typicalDuration && (
                            <div>
                              <span className="font-medium">Duración:</span>
                              <p className="text-muted-foreground">{medication.typicalDuration}</p>
                            </div>
                          )}
                          {medication.instructions && (
                            <div>
                              <span className="font-medium">Instrucciones:</span>
                              <p className="text-muted-foreground line-clamp-2">{medication.instructions}</p>
                            </div>
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
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
