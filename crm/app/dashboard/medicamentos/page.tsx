"use client"

import { useState } from "react"
import { useAppContext } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  Pill,
  AlertCircle,
  Info
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function MedicamentosPage() {
  const { currentUser, medications, loading, addMedication, updateMedication, deleteMedication } = useAppContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMedication, setEditingMedication] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    category: "Analgésicos" as const,
    dosage: "",
    frequency: "",
    typicalDuration: "",
    instructions: "",
    contraindications: "",
    sideEffects: "",
    isActive: true
  })

  const categories = [
    "Antibióticos",
    "Analgésicos", 
    "Cardiovasculares",
    "Antihistamínicos",
    "Corticosteroides",
    "Otros"
  ]

  const filteredMedications = medications.filter(medication => {
    const matchesSearch = medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medication.genericName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === "all" || medication.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) return

    // Transformar los datos del frontend (camelCase) al formato del backend (snake_case)
    const medicationData = {
      name: formData.name,
      generic_name: formData.genericName,
      category: formData.category,
      dosage: formData.dosage,
      frequency: formData.frequency,
      typical_duration: formData.typicalDuration,
      instructions: formData.instructions,
      contraindications: formData.contraindications,
      side_effects: formData.sideEffects,
      is_active: formData.isActive,
      doctorId: currentUser.id
    }

    try {
      setError(null)
      if (editingMedication) {
        await updateMedication(editingMedication.id, medicationData)
      } else {
        await addMedication(medicationData)
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving medication:', error)
      setError(error instanceof Error ? error.message : 'Error al guardar el medicamento')
      // Aquí podrías mostrar un toast de error
    }
  }

  const handleEdit = (medication: any) => {
    setEditingMedication(medication)
    setFormData({
      name: medication.name,
      genericName: medication.genericName,
      category: medication.category,
      dosage: medication.dosage,
      frequency: medication.frequency,
      typicalDuration: medication.typicalDuration,
      instructions: medication.instructions,
      contraindications: medication.contraindications,
      sideEffects: medication.sideEffects,
      isActive: medication.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      setError(null)
      await deleteMedication(id)
    } catch (error) {
      console.error('Error deleting medication:', error)
      setError(error instanceof Error ? error.message : 'Error al eliminar el medicamento')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      genericName: "",
      category: "Analgésicos",
      dosage: "",
      frequency: "",
      typicalDuration: "",
      instructions: "",
      contraindications: "",
      sideEffects: "",
      isActive: true
    })
    setEditingMedication(null)
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Antibióticos": "bg-blue-100 text-blue-800",
      "Analgésicos": "bg-green-100 text-green-800",
      "Cardiovasculares": "bg-red-100 text-red-800",
      "Antihistamínicos": "bg-green-light-100 text-green-health-800",
      "Corticosteroides": "bg-orange-100 text-orange-800",
      "Otros": "bg-gray-100 text-gray-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Medicamentos</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestiona tu catálogo de medicamentos para prescripciones
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} size="sm" className="text-xs sm:text-sm">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Agregar Medicamento</span>
              <span className="sm:hidden">Agregar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingMedication ? "Editar Medicamento" : "Nuevo Medicamento"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingMedication 
                  ? "Modifica la información del medicamento"
                  : "Agrega un nuevo medicamento a tu catálogo"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre comercial</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Amlodipino"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="genericName">Nombre genérico</Label>
                  <Input
                    id="genericName"
                    value={formData.genericName}
                    onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                    placeholder="Ej: Amlodipine"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value: any) => setFormData({...formData, category: value})}>
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
                <div>
                  <Label htmlFor="dosage">Dosis</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    placeholder="Ej: 5-10 mg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frecuencia</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    placeholder="Ej: Una vez al día"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="typicalDuration">Duración típica</Label>
                  <Input
                    id="typicalDuration"
                    value={formData.typicalDuration}
                    onChange={(e) => setFormData({...formData, typicalDuration: e.target.value})}
                    placeholder="Ej: 7-14 días"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">Instrucciones</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Instrucciones específicas para el paciente (opcional)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contraindications">Contraindicaciones</Label>
                <Textarea
                  id="contraindications"
                  value={formData.contraindications}
                  onChange={(e) => setFormData({...formData, contraindications: e.target.value})}
                  placeholder="Contraindicaciones importantes (opcional)"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="sideEffects">Efectos secundarios</Label>
                <Textarea
                  id="sideEffects"
                  value={formData.sideEffects}
                  onChange={(e) => setFormData({...formData, sideEffects: e.target.value})}
                  placeholder="Efectos secundarios comunes (opcional)"
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingMedication ? "Actualizar" : "Agregar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar medicamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 text-xs sm:text-sm"
            />
          </div>
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px] text-xs sm:text-sm">
            <Filter className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de medicamentos */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-base sm:text-lg font-medium mb-2">Cargando medicamentos...</h3>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Error al cargar medicamentos</h3>
              <p className="text-muted-foreground mb-4 text-sm">{error}</p>
              <Button onClick={() => window.location.reload()} size="sm" className="text-xs sm:text-sm">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredMedications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Pill className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No hay medicamentos</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {searchTerm || (selectedCategory && selectedCategory !== "all")
                  ? "No se encontraron medicamentos con los filtros aplicados"
                  : "Aún no has agregado medicamentos a tu catálogo"
                }
              </p>
              {!searchTerm && (!selectedCategory || selectedCategory === "all") && (
                <Button onClick={() => setIsDialogOpen(true)} size="sm" className="text-xs sm:text-sm">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Agregar Primer Medicamento</span>
                  <span className="sm:hidden">Agregar Primero</span>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredMedications.map((medication) => (
            <Card key={medication.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg">{medication.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {medication.genericName}
                      </Badge>
                      <Badge className={getCategoryColor(medication.category)}>
                        {medication.category}
                      </Badge>
                      {!medication.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">Dosis:</span>
                        <p className="text-muted-foreground">{medication.dosage}</p>
                      </div>
                      <div>
                        <span className="font-medium">Frecuencia:</span>
                        <p className="text-muted-foreground">{medication.frequency}</p>
                      </div>
                      <div>
                        <span className="font-medium">Duración:</span>
                        <p className="text-muted-foreground">{medication.typicalDuration}</p>
                      </div>
                      <div>
                        <span className="font-medium">Instrucciones:</span>
                        <p className="text-muted-foreground line-clamp-2">{medication.instructions}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Contraindicaciones:
                        </span>
                        <p className="text-muted-foreground text-xs">{medication.contraindications}</p>
                      </div>
                      <div>
                        <span className="font-medium flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Efectos secundarios:
                        </span>
                        <p className="text-muted-foreground text-xs">{medication.sideEffects}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(medication)}
                      className="h-8 w-8 sm:h-10 sm:w-10 p-0"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 sm:h-10 sm:w-10 p-0">
                          <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar medicamento?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar "{medication.name}"? 
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(medication.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}