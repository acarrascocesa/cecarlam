"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "../utils/prescriptionFormatters"
import type { Patient } from "@/types/patient"

interface PatientInfoCardProps {
  patient: Patient
}

export function PatientInfoCard({ patient }: PatientInfoCardProps) {
  return (
    <div className="p-3 sm:p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
          <AvatarFallback className="text-sm sm:text-lg font-medium">
            {getInitials(patient.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h4 className="font-medium text-sm sm:text-base">{patient.name}</h4>
          {patient.email && (
            <p className="text-xs sm:text-sm text-muted-foreground">{patient.email}</p>
          )}
        </div>
      </div>
      <div className="grid gap-1 sm:gap-2 text-xs sm:text-sm">
        {patient.phone && (
          <div className="flex justify-between">
            <span>Teléfono:</span>
            <span>{patient.phone}</span>
          </div>
        )}
        {patient.insuranceProvider && (
          <div className="flex justify-between">
            <span>Seguro:</span>
            <Badge variant="outline" className="text-xs">
              {patient.insuranceProvider}
            </Badge>
          </div>
        )}
        <div className="flex justify-between">
          <span>Estado:</span>
          <Badge variant={patient.status === "Activo" ? "default" : "secondary"} className="text-xs">
            {patient.status || "Activo"}
          </Badge>
        </div>
      </div>
    </div>
  )
}
