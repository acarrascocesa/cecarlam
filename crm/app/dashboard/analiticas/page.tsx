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
  TestTube,
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

export default function AnaliticasPage() {
  const { currentUser, analytics, loading, addAnalytic, updateAnalytic, deleteAnalytic } = useAppContext()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAnalytic, setEditingAnalytic] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    genericName: "",
    category: "Sangre" as const,
    description: "",
    instructions: "",
    preparation: "",
    contraindications: "",
    notes: "",
    isActive: true
  })

  const categories = [
    "Sangre",
    "Orina", 
    "Cardíacas",
    "Pulmonares",
    "Imágenes",
    "Otros"
  ]

  const filteredAnalytics = analytics.filter(analytic => {
    const matchesSearch = analytic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         analytic.genericName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === "all" || analytic.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!currentUser) return

    // Transformar los datos del frontend (camelCase) al formato del backend (snake_case)
    const analyticData = {
      name: formData.name,
      generic_name: formData.genericName,
      category: formData.category,
      description: formData.description,
      instructions: formData.instructions,
      preparation: formData.preparation,
      contraindications: formData.contraindications,
      notes: formData.notes,
      is_active: formData.isActive,
      doctorId: currentUser.id
    }

    try {
      setError(null)
      if (editingAnalytic) {
        await updateAnalytic(editingAnalytic.id, analyticData)
      } else {
        await addAnalytic(analyticData)
      }

      resetForm()
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Error saving analytic:', error)
      setError(error instanceof Error ? error.message : 'Error al guardar la analítica')
    }
  }

  const handleEdit = (analytic: any) => {
    setEditingAnalytic(analytic)
    setFormData({
      name: analytic.name,
      genericName: analytic.genericName,
      category: analytic.category,
      description: analytic.description,
      instructions: analytic.instructions,
      preparation: analytic.preparation,
      contraindications: analytic.contraindications,
      notes: analytic.notes,
      isActive: analytic.isActive
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      setError(null)
      await deleteAnalytic(id)
    } catch (error) {
      console.error('Error deleting analytic:', error)
      setError(error instanceof Error ? error.message : 'Error al eliminar la analítica')
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      genericName: "",
      category: "Sangre",
      description: "",
      instructions: "",
      preparation: "",
      contraindications: "",
      notes: "",
      isActive: true
    })
    setEditingAnalytic(null)
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Sangre": "bg-red-100 text-red-800",
      "Orina": "bg-yellow-100 text-yellow-800",
      "Cardíacas": "bg-blue-100 text-blue-800",
      "Pulmonares": "bg-green-100 text-green-800",
      "Imágenes": "bg-green-light-100 text-green-health-800",
      "Otros": "bg-gray-100 text-gray-800"
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Analíticas</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestiona tu catálogo de analíticas para prescripciones
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()} size="sm" className="text-xs sm:text-sm">
              <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Agregar Analítica</span>
              <span className="sm:hidden">Agregar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">
                {editingAnalytic ? "Editar Analítica" : "Nueva Analítica"}
              </DialogTitle>
              <DialogDescription className="text-sm">
                {editingAnalytic 
                  ? "Modifica la información de la analítica"
                  : "Agrega una nueva analítica a tu catálogo"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre de la analítica</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Hemograma Completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="genericName">Nombre genérico</Label>
                  <Input
                    id="genericName"
                    value={formData.genericName}
                    onChange={(e) => setFormData({...formData, genericName: e.target.value})}
                    placeholder="Ej: CBC"
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
                  <Label htmlFor="description">Descripción</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Descripción de la analítica"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="instructions">Instrucciones para el paciente</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  placeholder="Instrucciones específicas para el paciente"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="preparation">Preparación</Label>
                <Textarea
                  id="preparation"
                  value={formData.preparation}
                  onChange={(e) => setFormData({...formData, preparation: e.target.value})}
                  placeholder="Preparación requerida"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="contraindications">Contraindicaciones</Label>
                <Textarea
                  id="contraindications"
                  value={formData.contraindications}
                  onChange={(e) => setFormData({...formData, contraindications: e.target.value})}
                  placeholder="Contraindicaciones importantes"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Notas adicionales (opcional)"
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAnalytic ? "Actualizar" : "Agregar"}
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
              placeholder="Buscar analíticas..."
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

      {/* Lista de analíticas */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-base sm:text-lg font-medium mb-2">Cargando analíticas...</h3>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">Error al cargar analíticas</h3>
              <p className="text-muted-foreground mb-4 text-sm">{error}</p>
              <Button onClick={() => window.location.reload()} size="sm" className="text-xs sm:text-sm">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : filteredAnalytics.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <TestTube className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base sm:text-lg font-medium mb-2">No hay analíticas</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                {searchTerm || (selectedCategory && selectedCategory !== "all")
                  ? "No se encontraron analíticas con los filtros aplicados"
                  : "Aún no has agregado analíticas a tu catálogo"
                }
              </p>
              {!searchTerm && (!selectedCategory || selectedCategory === "all") && (
                <Button onClick={() => setIsDialogOpen(true)} size="sm" className="text-xs sm:text-sm">
                  <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Agregar Primera Analítica</span>
                  <span className="sm:hidden">Agregar Primera</span>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredAnalytics.map((analytic) => (
            <Card key={analytic.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg">{analytic.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {analytic.genericName}
                      </Badge>
                      <Badge className={getCategoryColor(analytic.category)}>
                        {analytic.category}
                      </Badge>
                      {!analytic.isActive && (
                        <Badge variant="secondary" className="text-xs">Inactiva</Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium">Descripción:</span>
                        <p className="text-muted-foreground">{analytic.description}</p>
                      </div>
                      <div>
                        <span className="font-medium">Instrucciones:</span>
                        <p className="text-muted-foreground">{analytic.instructions}</p>
                      </div>
                      <div>
                        <span className="font-medium">Preparación:</span>
                        <p className="text-muted-foreground">{analytic.preparation}</p>
                      </div>
                      <div>
                        <span className="font-medium">Notas:</span>
                        <p className="text-muted-foreground line-clamp-2">{analytic.notes}</p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div>
                        <span className="font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Contraindicaciones:
                        </span>
                        <p className="text-muted-foreground text-xs">{analytic.contraindications}</p>
                      </div>
                      <div>
                        <span className="font-medium flex items-center gap-1">
                          <Info className="h-3 w-3" />
                          Creado por:
                        </span>
                        <p className="text-muted-foreground text-xs">{analytic.doctorName || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(analytic)}
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
                          <AlertDialogTitle>¿Eliminar analítica?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro de que quieres eliminar "{analytic.name}"? 
                            Esta acción no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(analytic.id)}
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
