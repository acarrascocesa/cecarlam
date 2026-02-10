"use client"

import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { useRealClinics } from "@/hooks/useRealClinics"
import { Building, Loader2, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getClinicDisplayNames, getClinicDisplayName } from "@/lib/clinicDisplayNames"

export function ClinicSelector() {
  const { user } = useAuth()
  const { selectedClinicId, setSelectedClinicId } = useAppContext()
  const { clinics, loading, error } = useRealClinics()

  // Check if user has multi-clinic view
  const hasMultiClinicView = user?.multiClinicView && (user?.role === 'doctor' || user?.role === 'secretary')

  // Obtener nombres de clínicas específicos por usuario
  const clinicDisplayNames = getClinicDisplayNames(user?.email || '', clinics)
  
  // Obtener la clínica seleccionada con nombre específico
  const selectedClinicDisplay = clinicDisplayNames.find(c => c.clinic_id === selectedClinicId)

  useEffect(() => {
    // For multi-clinic users, don't set a default clinic (unified view)
    if (hasMultiClinicView) {
      return // Don't auto-select any clinic for unified view
    }

    // Set a default clinic if none is selected and we have clinics (normal users)
    if (clinics.length > 0 && !selectedClinicId) {
      setSelectedClinicId(clinics[0].clinic_id)
    }
  }, [clinics, selectedClinicId, setSelectedClinicId, hasMultiClinicView])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center gap-2 w-[220px] h-10">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate">
          Cargando clínicas...
        </span>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center gap-2 w-[220px] h-10">
        <Building className="h-5 w-5 text-red-500" />
        <span className="text-sm text-red-500 truncate">
          Error al cargar clínicas
        </span>
      </div>
    )
  }

  // No clinics
  if (clinics.length === 0) {
    return (
      <div className="flex items-center gap-2 w-[220px] h-10">
        <Building className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate">
          Sin clínicas disponibles
        </span>
      </div>
    )
  }

  // Multi-clinic view - show unified view indicator
  if (hasMultiClinicView) {
    return (
      <div className="flex items-center gap-2 w-[220px] h-10">
        <Globe className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-700 truncate">
          Vista Unificada
        </span>
        <Badge variant="secondary" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
          Todas
        </Badge>
      </div>
    )
  }

  // Si solo tiene una clínica, mostrar solo el nombre
  if (clinics.length === 1) {
    const displayName = getClinicDisplayName(user?.email || '', clinics[0])
    return (
      <div className="flex items-center gap-2 w-[220px] h-10">
        <Building className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground truncate">
          {displayName}
        </span>
      </div>
    )
  }

  return (
    <Select onValueChange={setSelectedClinicId} value={selectedClinicId || ""}>
      <SelectTrigger className="w-[220px]">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          <SelectValue placeholder="Seleccionar centro..." />
        </div>
      </SelectTrigger>
      <SelectContent>
        {clinicDisplayNames.map((clinicDisplay) => (
          <SelectItem key={clinicDisplay.clinic_id} value={clinicDisplay.clinic_id}>
            {clinicDisplay.display_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
