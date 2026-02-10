"use client"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getInitials } from "../utils/prescriptionFormatters"
import { usePatientFilter } from "../hooks/usePrescriptionFilters"
import type { Patient } from "@/types/patient"

interface PatientSelectorProps {
  patients: Patient[]
  selectedPatientId: string
  onPatientSelect: (patientId: string) => void
  searchValue: string
  onSearchChange: (value: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PatientSelector({
  patients,
  selectedPatientId,
  onPatientSelect,
  searchValue,
  onSearchChange,
  open,
  onOpenChange
}: PatientSelectorProps) {
  const selectedPatient = patients.find(p => p.id === selectedPatientId)
  const filteredPatients = usePatientFilter(patients, searchValue)

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 text-xs sm:text-sm"
        >
          {selectedPatientId ? (
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                <AvatarFallback className="text-xs font-medium">
                  {getInitials(selectedPatient?.name || '')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs sm:text-sm">{selectedPatient?.name}</span>
            </div>
          ) : (
            "Seleccionar paciente"
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0" align="start">
        <div className="border-b px-3 py-2">
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filteredPatients.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchValue ? "No se encontraron pacientes." : "No hay pacientes disponibles."}
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center gap-2 w-full p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                onClick={() => {
                  onPatientSelect(patient.id)
                  onOpenChange(false)
                }}
              >
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                  <AvatarFallback className="text-xs font-medium">
                    {getInitials(patient.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-xs sm:text-sm font-medium">{patient.name}</span>
                  {(patient.email || patient.phone) && (
                    <span className="text-xs text-muted-foreground">
                      {patient.email || patient.phone}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {patient.insuranceProvider || "Sin seguro"}
                  </Badge>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedPatientId === patient.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
