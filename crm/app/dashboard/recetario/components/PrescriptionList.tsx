"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, Printer } from "lucide-react"
import { getInitials } from "../utils/prescriptionFormatters"
import type { PrescriptionPrintParams } from "@/types/prescription"

interface Prescription {
  id: string
  patient_id?: string
  patient_name: string
  doctor_id?: string
  doctor_name: string
  doctor_license?: string
  clinic_id?: string
  clinic_name?: string
  clinic_address?: string
  clinic_phone?: string
  clinic_email?: string
  prescription_date: string
  prescription_text: string
  status: string
}

interface PrescriptionListProps {
  prescriptions: Prescription[]
  onPrint: (params: PrescriptionPrintParams) => void
}

export function PrescriptionList({ prescriptions, onPrint }: PrescriptionListProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {prescriptions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay recetas generadas</h3>
            <p className="text-muted-foreground mb-4">
              Aún no se han creado recetas para esta clínica.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4">
          {prescriptions.map((prescription) => {
            const doctorName = prescription.doctor_name || ""
            const isLinda = isDoctorType(doctorName, 'linda')
            const doctorSpecialty = getDoctorSpecialty(doctorName)
            
            return (
              <Card key={prescription.id}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarFallback className="text-xs sm:text-sm font-medium">
                          {getInitials(prescription.patient_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm sm:text-base">{prescription.patient_name}</h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {new Date(prescription.prescription_date).toLocaleDateString()} • {prescription.doctor_name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={prescription.status === "Activa" ? "default" : "secondary"} className="text-xs">
                        {prescription.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs" 
                        onClick={() => {
                          onPrint({
                            content: prescription.prescription_text || "",
                            patient: {
                              id: prescription.patient_id || "unknown",
                              name: prescription.patient_name || "Paciente",
                              dateOfBirth: undefined,
                              email: undefined,
                              phone: undefined
                            },
                            doctor: {
                              id: prescription.doctor_id || "unknown",
                              name: prescription.doctor_name || "Doctor",
                              licenseNumber: prescription.doctor_license,
                              specialty: doctorSpecialty
                            },
                            clinic: {
                              clinic_id: prescription.clinic_id || "unknown",
                              clinic_name: prescription.clinic_name || "Clínica",
                              clinic_address: prescription.clinic_address || "Dirección de la clínica",
                              clinic_phone: prescription.clinic_phone || "809-555-1234",
                              clinic_email: prescription.clinic_email || "info@hsalud-pro.com"
                            },
                            isLinda,
                            showSignature: !isLinda,
                            signatureType: isLinda ? 'pediatra' : undefined,
                            prescriptionDate: prescription.prescription_date ? new Date(prescription.prescription_date) : undefined
                          })
                        }}
                      >
                        <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-muted rounded-lg">
                    <p className="text-xs sm:text-sm whitespace-pre-line line-clamp-3">
                      {prescription.prescription_text}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
