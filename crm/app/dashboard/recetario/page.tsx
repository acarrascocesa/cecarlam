"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { LuisPrescription } from "@/components/dashboard/luis-prescription"
import { LindaPrescription } from "@/components/dashboard/linda-prescription"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, User, FileText, Save, Printer, Pill, Stethoscope, TestTube, Loader2 } from "lucide-react"
import Link from "next/link"
import { usePrescriptionPagination } from "@/hooks/usePrescriptionPagination"
import { usePrescriptionForm } from "./hooks/usePrescriptionForm"
import { usePrescriptionAutoNumber } from "./hooks/usePrescriptionAutoNumber"
import { getDoctorSpecialty, getDoctorDisplayName, isDoctorType } from "./utils/doctorUtils"
import { formatMedicationText, formatServiceText, formatAnalyticText, getNextItemNumber } from "./utils/prescriptionFormatters"
import type { Medication, Service, Analytic } from "@/types/recetario"
import { PatientSelector } from "./components/PatientSelector"
import { MedicationSelector } from "./components/MedicationSelector"
import { ServiceSelector } from "./components/ServiceSelector"
import { AnalyticsSelector } from "./components/AnalyticsSelector"
import { PrescriptionList } from "./components/PrescriptionList"
import { DoctorInfo } from "./components/DoctorInfo"
import { PatientInfoCard } from "./components/PatientInfoCard"

export default function RecetarioPage() {
  const { currentUser, clinics, selectedClinicId, patients, prescriptions, medications, services, analytics, addPrescription } = useAppContext()
  const { user } = useAuth()
  
  // Estados UI
  const [showPrescriptionList, setShowPrescriptionList] = useState(false)
  const [showMedicationSelector, setShowMedicationSelector] = useState(false)
  const [showServiceSelector, setShowServiceSelector] = useState(false)
  const [showAnalyticsSelector, setShowAnalyticsSelector] = useState(false)
  const [showSignature, setShowSignature] = useState(false)
  const [lindaSignatureType, setLindaSignatureType] = useState<'pediatra' | 'alergolo'>('pediatra')
  const [medicationSearchTerm, setMedicationSearchTerm] = useState("")
  const [analyticsSearchTerm, setAnalyticsSearchTerm] = useState("")
  const [patientComboboxOpen, setPatientComboboxOpen] = useState(false)
  const [patientSearchValue, setPatientSearchValue] = useState("")
  
  // Hook para paginación e impresión de recetas
  const { printPrescriptionWithValidation } = usePrescriptionPagination()
  
  // Obtener datos derivados
  const selectedClinic = useMemo(() => 
    clinics.find((c) => c.clinic_id === selectedClinicId) || null,
    [clinics, selectedClinicId]
  )
  
  // Hook para manejo del formulario (debe ir antes de calcular selectedPatient)
  const {
    prescriptionText,
    setPrescriptionText,
    selectedPatientId,
    setSelectedPatientId,
    isSaving,
    savePrescription
  } = usePrescriptionForm({
    addPrescription,
    patients,
    selectedClinicId,
    userMultiClinicView: user?.multiClinicView,
    userRole: user?.role
  })
  
  const selectedPatient = useMemo(() => 
    patients.find((p) => p.id === selectedPatientId) || null,
    [patients, selectedPatientId]
  )
  
  // Hook para auto-numeración
  const { handleTextChange } = usePrescriptionAutoNumber({
    prescriptionText,
    setPrescriptionText,
    medications
  })
  
  // Obtener nombre del doctor de la clínica
  const clinicDoctorName = useMemo(() => {
    if (selectedClinic?.doctor_name) {
      return selectedClinic.doctor_name
    }
    return currentUser?.name || ""
  }, [selectedClinic, currentUser])
  
  const currentUserName = currentUser?.name || ""
  
  // Determinar tipo de doctor usando utilidades
  const isLinda = useMemo(() => 
    isDoctorType(clinicDoctorName, 'linda') || isDoctorType(currentUserName, 'linda'),
    [clinicDoctorName, currentUserName]
  )
  
  const isLuis = useMemo(() => 
    isDoctorType(clinicDoctorName, 'luis') || isDoctorType(currentUserName, 'luis'),
    [clinicDoctorName, currentUserName]
  )
  
  // Obtener información del doctor usando utilidades
  const doctorSpecialty = useMemo(() => 
    getDoctorSpecialty(clinicDoctorName, currentUser?.specialty),
    [clinicDoctorName, currentUser?.specialty]
  )
  
  const doctorDisplayName = useMemo(() => 
    getDoctorDisplayName(clinicDoctorName, currentUser?.name),
    [clinicDoctorName, currentUser?.name]
  )
  
  // Inicializar desde URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const patientIdFromUrl = urlParams.get('patientId')
    if (patientIdFromUrl) {
      setSelectedPatientId(patientIdFromUrl)
    }
  }, [setSelectedPatientId])
  
  // Funciones para agregar items a prescripción
  const handleAddMedication = useCallback((medication: Medication) => {
    const nextNumber = getNextItemNumber(prescriptionText)
    const medicationText = formatMedicationText(medication, nextNumber)
    setPrescriptionText(prev => prev + medicationText)
    setShowMedicationSelector(false)
  }, [prescriptionText, setPrescriptionText])
  
  const handleAddService = useCallback((service: Service) => {
    const nextNumber = getNextItemNumber(prescriptionText)
    const serviceText = formatServiceText(service, nextNumber)
    setPrescriptionText(prev => prev + serviceText)
    setShowServiceSelector(false)
  }, [prescriptionText, setPrescriptionText])
  
  const handleAddAnalytic = useCallback((analytic: Analytic) => {
    const nextNumber = getNextItemNumber(prescriptionText)
    const analyticText = formatAnalyticText(analytic, nextNumber)
    setPrescriptionText(prev => prev + analyticText)
    setShowAnalyticsSelector(false)
  }, [prescriptionText, setPrescriptionText])
  
  // Función para imprimir prescripción
  const handlePrintPrescription = useCallback(() => {
    if (!selectedPatient || !selectedClinic) return
    
    printPrescriptionWithValidation({
      content: prescriptionText || "",
      patient: {
        id: selectedPatient.id,
        name: selectedPatient.name,
        dateOfBirth: selectedPatient.dateOfBirth || undefined,
        email: selectedPatient.email || undefined,
        phone: selectedPatient.phone || undefined
      },
      doctor: {
        id: currentUser?.id || "",
        name: doctorDisplayName,
        licenseNumber: currentUser?.licenseNumber,
        specialty: doctorSpecialty
      },
      clinic: {
        clinic_id: selectedClinic.clinic_id,
        clinic_name: selectedClinic.clinic_name,
        clinic_address: selectedClinic.clinic_address || "",
        clinic_phone: selectedClinic.clinic_phone || "",
        clinic_email: selectedClinic.clinic_email || ""
      },
      isLinda,
      showSignature,
      signatureType: isLinda ? lindaSignatureType : undefined,
      prescriptionDate: new Date()
    })
  }, [
    selectedPatient,
    selectedClinic,
    prescriptionText,
    currentUser,
    doctorDisplayName,
    doctorSpecialty,
    isLinda,
    showSignature,
    lindaSignatureType,
    printPrescriptionWithValidation
  ])
  
  // Validación de datos requeridos
  if (!currentUser || !selectedClinic) {
    return (
      <div className="flex items-center justify-center h-full">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Información no disponible</AlertTitle>
          <AlertDescription>
            Por favor, asegúrese de haber iniciado sesión y seleccionado un centro médico para generar un recetario.
          </AlertDescription>
        </Alert>
      </div>
    )
  }
  
  return (
    <div className="flex flex-col gap-3 sm:gap-4 max-w-9xl mx-auto w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Recetario Médico</h1>
        <div className="flex flex-wrap gap-2">
          {selectedPatient ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm" 
                onClick={() => setShowMedicationSelector(true)}
              >
                <Pill className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Agregar Medicamento</span>
                <span className="sm:hidden">Medicamento</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm" 
                onClick={() => setShowServiceSelector(true)}
              >
                <Stethoscope className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Agregar Servicio</span>
                <span className="sm:hidden">Servicio</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm" 
                onClick={() => setShowAnalyticsSelector(true)}
              >
                <TestTube className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Agregar Analítica</span>
                <span className="sm:hidden">Analítica</span>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm"
              >
                <Link 
                  href={`/dashboard/historia-clinica/nuevo?patientId=${selectedPatient.id}&returnTo=recetario&prescriptionText=${encodeURIComponent(prescriptionText)}`}
                >
                  <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Crear Historia</span>
                  <span className="sm:hidden">Historia</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs sm:text-sm" 
                onClick={savePrescription}
                disabled={isSaving || !prescriptionText.trim()}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    Guardar
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs sm:text-sm" 
              onClick={() => setShowPrescriptionList(true)}
            >
              <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Ver Recetas</span>
              <span className="sm:hidden">Recetas</span>
            </Button>
          )}
        </div>
      </div>

      {/* Selectores */}
      <MedicationSelector
        open={showMedicationSelector}
        onOpenChange={setShowMedicationSelector}
        medications={medications}
        searchTerm={medicationSearchTerm}
        onSearchChange={setMedicationSearchTerm}
        onSelect={handleAddMedication}
      />

      <ServiceSelector
        open={showServiceSelector}
        onOpenChange={setShowServiceSelector}
        services={services}
        onSelect={handleAddService}
      />

      <AnalyticsSelector
        open={showAnalyticsSelector}
        onOpenChange={setShowAnalyticsSelector}
        analytics={analytics}
        searchTerm={analyticsSearchTerm}
        onSearchChange={setAnalyticsSearchTerm}
        onSelect={handleAddAnalytic}
      />

      {/* Contenido principal */}
      {showPrescriptionList ? (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs sm:text-sm" 
              onClick={() => setShowPrescriptionList(false)}
            >
              ← Volver
            </Button>
            <h2 className="text-lg sm:text-xl font-semibold">Recetas Generadas</h2>
          </div>

          <PrescriptionList
            prescriptions={prescriptions}
            onPrint={printPrescriptionWithValidation}
          />
        </div>
      ) : selectedPatientId && selectedPatient ? (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs sm:text-sm" 
              onClick={() => setSelectedPatientId("")}
            >
              ← Cambiar Paciente
            </Button>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="text-xs sm:text-sm" 
                onClick={handlePrintPrescription}
                disabled={!prescriptionText.trim()}
              >
                <Printer className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Imprimir
              </Button>
            </div>
          </div>

          {/* Receta */}
          {isLinda ? (
            <LindaPrescription 
              patient={selectedPatient}
              prescription={prescriptionText}
              setPrescription={handleTextChange}
              doctorName={doctorDisplayName}
              doctorSpecialty={doctorSpecialty}
              doctorLicense={currentUser.licenseNumber || "N/A"}
              clinicAddress={selectedClinic.clinic_address || ""}
              clinicPhone={selectedClinic.clinic_phone || ""}
              clinicEmail={selectedClinic.clinic_email || ""}
              clinicWebsite=""
              doctorId={currentUser.id}
              showSignature={showSignature}
              setShowSignature={setShowSignature}
              signatureType={lindaSignatureType}
              setSignatureType={setLindaSignatureType}
              allClinics={clinics}
              doctorEmail={currentUser.email || ""}
              doctorPhone={selectedClinic.clinic_phone || ""}
              doctorCell="849-201-0850"
            />
          ) : (
            <LuisPrescription 
              patient={selectedPatient}
              prescription={prescriptionText}
              setPrescription={handleTextChange}
              doctorName={doctorDisplayName}
              doctorSpecialty={doctorSpecialty}
              doctorLicense={currentUser.licenseNumber || "N/A"}
              clinicAddress={selectedClinic.clinic_address || ""}
              clinicPhone={selectedClinic.clinic_phone || ""}
              clinicEmail={selectedClinic.clinic_email || ""}
              clinicWebsite=""
              doctorId={currentUser.id}
              showSignature={showSignature}
              setShowSignature={setShowSignature}
              allClinics={clinics}
              doctorEmail={currentUser.email || ""}
              doctorPhone={selectedClinic.clinic_phone || ""}
              doctorCell=""
            />
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {/* Selección de Paciente */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Seleccionar Paciente
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Elige el paciente para el cual generar la receta médica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
              <PatientSelector
                patients={patients}
                selectedPatientId={selectedPatientId}
                onPatientSelect={setSelectedPatientId}
                searchValue={patientSearchValue}
                onSearchChange={setPatientSearchValue}
                open={patientComboboxOpen}
                onOpenChange={setPatientComboboxOpen}
              />

              {selectedPatient && (
                <PatientInfoCard patient={selectedPatient} />
              )}
            </CardContent>
          </Card>

          {/* Información del Doctor */}
          <DoctorInfo
            currentUserName={currentUser.name}
            licenseNumber={currentUser.licenseNumber}
            clinicName={selectedClinic.clinic_name}
            clinicAddress={selectedClinic.clinic_address || ""}
            clinicPhone={selectedClinic.clinic_phone || ""}
          />
        </div>
      )}
    </div>
  )
}
