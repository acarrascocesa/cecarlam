"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"

interface DoctorInfoProps {
  currentUserName: string
  licenseNumber?: string | null
  clinicName: string
  clinicAddress: string
  clinicPhone: string
}

export function DoctorInfo({
  currentUserName,
  licenseNumber,
  clinicName,
  clinicAddress,
  clinicPhone
}: DoctorInfoProps) {
  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          Información del Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
        <div>
          <Label className="text-xs sm:text-sm font-medium">Usuario</Label>
          <p className="text-sm sm:text-lg font-semibold">{currentUserName}</p>
        </div>
        <div>
          <Label className="text-xs sm:text-sm font-medium">Licencia</Label>
          <p className="text-xs sm:text-sm">{licenseNumber || "N/A"}</p>
        </div>
        <div>
          <Label className="text-xs sm:text-sm font-medium">Clínica</Label>
          <p className="text-xs sm:text-sm font-medium">{clinicName}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{clinicAddress}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{clinicPhone}</p>
        </div>
      </CardContent>
    </Card>
  )
}
