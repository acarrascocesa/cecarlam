"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, Clock, Edit, FileText, Mail, MapPin, Phone, Trash, User, Plus, X } from "lucide-react"
import { HtmlContent } from "@/components/ui/html-content"
import Link from "next/link"
import { useAppContext } from "@/context/app-context"
import { usePatientAttachments } from "@/hooks/usePatientAttachments"
import { useRealClinics } from "@/hooks/useRealClinics"
import { useAuth } from "@/context/auth-context"
import { usePrescriptionPagination } from "@/hooks/usePrescriptionPagination"
import { usePrescriptions } from "@/hooks/usePrescriptions"
import { PatientAttachmentUpload, PatientAttachmentList } from "@/components/attachments"
import { LuisPrescriptionView } from "@/components/dashboard/luis-prescription-view"
import { LindaPrescriptionView } from "@/components/dashboard/linda-prescription-view"
import type { Patient } from "@/types/patient"
import { formatDateToISO } from "@/lib/utils"
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

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { patients, appointments, medicalRecords, invoices, prescriptions, updatePatient, deletePatient, addNotification, selectedClinicId } =
    useAppContext()

  const { user } = useAuth()
  const { clinics } = useRealClinics()
  const { deletePrescription } = usePrescriptions(selectedClinicId || undefined, undefined, user?.id)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [patientAppointments, setPatientAppointments] = useState<any[]>([])
  const [patientRecords, setPatientRecords] = useState<any[]>([])
  const [patientInvoices, setPatientInvoices] = useState<any[]>([])
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [editedPatient, setEditedPatient] = useState<Patient | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null)
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false)

  // Hook para paginación e impresión de recetas
  const { printPrescriptionWithValidation } = usePrescriptionPagination()



  // Estados y hook para attachments
  const [selectedAttachmentCategory, setSelectedAttachmentCategory] = useState("all")
  const {
    attachments: patientAttachments,
    loading: attachmentsLoading,
    uploading,
    error: attachmentsError,
    uploadProgress,
    uploadAttachments,
    downloadAttachment,
    deleteAttachment,
    clearError: clearAttachmentsError
  } = usePatientAttachments(params.id as string, selectedAttachmentCategory)

  // Funciones para manejar attachments
  const handleUploadPatientSuccess = async (files: File[], category: string, description: string) => {
    try {
      const result = await uploadAttachments(files, category, description)
      addNotification({
        type: "success",
        title: "Documentos subidos",
        message: `${files.length} documento(s) subido(s) exitosamente`,
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
      return result
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error al subir documentos",
        message: error instanceof Error ? error.message : "Error desconocido",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
      throw error
    }
  }

  const handleDownloadPatientFile = async (filename: string) => {
    try {
      await downloadAttachment(filename)
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error al descargar archivo",
        message: error instanceof Error ? error.message : "Error desconocido",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
    }
  }

  const handleDeletePatientFile = async (attachmentId: string) => {
    try {
      await deleteAttachment(attachmentId)
      addNotification({
        type: "success",
        title: "Documento eliminado",
        message: "El documento fue eliminado exitosamente",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error al eliminar documento",
        message: error instanceof Error ? error.message : "Error desconocido",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
    }
  }

  // Función para obtener iniciales del nombre y apellido
  const getInitials = (name: string) => {
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Función para calcular la edad
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  // Validar formulario
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!editedPatient?.name?.trim()) {
      errors.name = "El nombre es obligatorio"
    }

    // El correo electrónico no es obligatorio, pero si se proporciona debe ser válido
    if (editedPatient?.email?.trim() && !/\S+@\S+\.\S+/.test(editedPatient.email)) {
      errors.email = "El correo electrónico no es válido"
    }

    if (!editedPatient?.phone?.trim()) {
      errors.phone = "El teléfono es obligatorio"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Cargar datos del paciente
  useEffect(() => {
    const patientId = params.id as string
    const foundPatient = patients.find((p) => p.id === patientId)

    if (foundPatient) {
      setPatient(foundPatient)
      setEditedPatient(foundPatient)

      // Filtrar citas, registros médicos, facturas y prescripciones del paciente
      setPatientAppointments(appointments.filter((a) => a && a.patient && a.patient.id === patientId))
      setPatientRecords(medicalRecords.filter((r) => r && r.patient_id === patientId))
      setPatientInvoices(invoices.filter((i) => i && i.patient_id === patientId))
      // Las prescripciones pueden usar patientId o patient.id dependiendo de la estructura
      setPatientPrescriptions(prescriptions.filter((p) => p && p.patient_id === patientId))
    } else {
      // Si no se encuentra el paciente, redirigir a la lista de pacientes
      router.push("/dashboard/pacientes")
    }
  }, [params.id, patients, appointments, medicalRecords, invoices, prescriptions, router])

  // Manejar cambios en el formulario de edición
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedPatient) return

    const { name, value } = e.target

    // Manejar campos especiales
    if (name === 'allergies') {
      setEditedPatient({
        ...editedPatient,
        allergies: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
      })
    } else if (name === 'chronicConditions') {
      setEditedPatient({
        ...editedPatient,
        chronicConditions: value.split(',').map(s => s.trim()).filter(s => s.length > 0)
      })
          } else if (name === 'emergencyContactName') {
        setEditedPatient({
          ...editedPatient,
          emergencyContactName: value
        })
      } else if (name === 'emergencyContactPhone') {
        setEditedPatient({
          ...editedPatient,
          emergencyContactPhone: value
        })
      } else if (name === 'emergencyContactRelationship') {
        setEditedPatient({
          ...editedPatient,
          emergencyContactRelationship: value
        })
    } else {
      setEditedPatient({
        ...editedPatient,
        [name]: value,
      })
    }
  }

  // Manejar cambios en selects
  const handleSelectChange = (name: string, value: string) => {
    if (!editedPatient) return

    setEditedPatient({
      ...editedPatient,
      [name]: value,
    })
  }

  // Guardar cambios
  const saveChanges = async () => {
    if (!patient || !editedPatient) return

    if (!validateForm()) {
      return
    }

    try {
      await updatePatient(patient.id, editedPatient)
      setPatient(editedPatient)
      setIsEditing(false)
      setValidationErrors({})

      // Añadir notificación
      addNotification({
        title: "Paciente actualizado",
        message: `Se ha actualizado la información de ${editedPatient.name}`,
        type: "success",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
    } catch (error) {
      console.error("Error al actualizar paciente:", error)
      // Añadir notificación de error
      addNotification({
        title: "Error al actualizar",
        message: "No se pudo actualizar la información del paciente",
        type: "error",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
    }
  }

  // Eliminar paciente
  const handleDeletePatient = async () => {
    if (!patient) return

    try {
      await deletePatient(patient.id)
      router.push("/dashboard/pacientes")

      // Añadir notificación
      addNotification({
        title: "Paciente eliminado",
        message: `Se ha eliminado a ${patient.name} del sistema`,
        type: "warning",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
    } catch (error) {
      console.error("Error al eliminar paciente:", error)
      // Añadir notificación de error
      addNotification({
        title: "Error al eliminar",
        message: "No se pudo eliminar el paciente",
        type: "error",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
    }
  }

  // Eliminar prescripción
  const handleDeletePrescription = async (prescriptionId: string) => {
    try {
      await deletePrescription(prescriptionId)
      
      // Actualizar la lista local de prescripciones del paciente
      setPatientPrescriptions(prev => prev.filter(p => p.id !== prescriptionId))

      // Añadir notificación
      addNotification({
        title: "Receta eliminada",
        message: "La receta médica ha sido eliminada exitosamente",
        type: "success",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
    } catch (error) {
      console.error("Error al eliminar prescripción:", error)
      // Añadir notificación de error
      addNotification({
        title: "Error al eliminar",
        message: "No se pudo eliminar la receta médica",
        type: "error",
        date: new Date(),
        read: false,
        clinicId: selectedClinicId!,
      })
    }
  }

  // Si no hay paciente, mostrar cargando
  if (!patient) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando información del paciente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-9xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/pacientes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Ficha del Paciente</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Información del paciente */}
        <Card className="md:col-span-1">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle>Información Personal</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar</span>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Eliminar</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará permanentemente al paciente {patient.name} y no se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeletePatient} className="bg-red-500 hover:bg-red-600">
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-col items-center mb-6">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="text-2xl font-medium">
                  {getInitials(patient.name)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{patient.name}</h2>
              <Badge
                variant={
                  patient.status === "Activo" ? "default" : patient.status === "Pendiente" ? "outline" : "secondary"
                }
                className="mt-2"
              >
                {patient.status}
              </Badge>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  <Input id="name" name="name" value={editedPatient?.name || ""} onChange={handleInputChange} />
                  {validationErrors.name && <p className="text-sm text-red-500">{validationErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cedula">Número de cédula</Label>
                  <Input id="cedula" name="cedula" value={editedPatient?.cedula || ""} onChange={handleInputChange} placeholder="123-4567890-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Fecha de nacimiento</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={editedPatient?.dateOfBirth ? (editedPatient.dateOfBirth instanceof Date ? editedPatient.dateOfBirth.toISOString().split('T')[0] : editedPatient.dateOfBirth) : ""}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Género</Label>
                    <Select
                      value={editedPatient?.gender || ""}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Femenino">Femenino</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editedPatient?.email || ""}
                    onChange={handleInputChange}
                  />
                  {validationErrors.email && <p className="text-sm text-red-500">{validationErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" name="phone" value={editedPatient?.phone || ""} onChange={handleInputChange} />
                  {validationErrors.phone && <p className="text-sm text-red-500">{validationErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    value={editedPatient?.address || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicId">Clínica</Label>
                  <Select
                    value={editedPatient?.clinicId || ""}
                    onValueChange={(value) => handleSelectChange("clinicId", value)}
                  >
                    <SelectTrigger id="clinicId">
                      <SelectValue placeholder="Seleccionar clínica" />
                    </SelectTrigger>
                    <SelectContent>
                      {clinics.map((clinic) => (
                        <SelectItem key={clinic.clinic_id} value={clinic.clinic_id}>
                          {clinic.clinic_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                                 <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                     <Label htmlFor="insuranceProvider">Proveedor de seguro</Label>
                                            <Select
                         value={editedPatient?.insuranceProvider || "SIN SEGURO"}
                         onValueChange={(value) => handleSelectChange("insuranceProvider", value)}
                       >
                       <SelectTrigger id="insuranceProvider">
                         <SelectValue placeholder="Seleccionar proveedor de seguro" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="SIN SEGURO">Sin seguro</SelectItem>
                         <SelectItem value="SENASA_PENSIONADO">SENASA Pensionado</SelectItem>
                         <SelectItem value="SENASA_CONTRIBUTIVO">SENASA Contributivo</SelectItem>
                         <SelectItem value="MAPFRE">MAPFRE</SelectItem>
                         <SelectItem value="HUMANO">ARS Humano</SelectItem>
                         <SelectItem value="ARS_PRIMERA">ARS Primera</SelectItem>
                         <SelectItem value="ARS_UNIVERSAL">ARS Universal</SelectItem>
                         <SelectItem value="ARS_FUTURO">ARS Futuro</SelectItem>
                                                   <SelectItem value="ARS_GMA">ARS GMA</SelectItem>
                          <SelectItem value="ARS_MONUMENTAL">ARS Monumental</SelectItem>
                          <SelectItem value="ARS_RENACER">ARS Renacer</SelectItem>
                          <SelectItem value="ARS_BANCO_CENTRAL">ARS Banco Central</SelectItem>
                          <SelectItem value="ARS_METASALUD">ARS Metasalud</SelectItem>
                          <SelectItem value="ARS_SIGMA">ARS Sigma</SelectItem>
                          <SelectItem value="APS">APS (Asmar Planes de Salud)</SelectItem>
                          <SelectItem value="ARS_CMD">ARS CMD (Colegio Médico)</SelectItem>
                          <SelectItem value="ARS_PLAN_SALUD_BC">ARS Plan Salud BC</SelectItem>
                          <SelectItem value="ARS_RESERVAS">ARS Reservas</SelectItem>
                          <SelectItem value="SEMMA">SEMMA</SelectItem>
                          <SelectItem value="YUNEN">YUNEN</SelectItem>
                       </SelectContent>
                     </Select>
                   </div>
                  <div className="space-y-2">
                    <Label htmlFor="insuranceNumber">Número de seguro</Label>
                    <Input
                      id="insuranceNumber"
                      name="insuranceNumber"
                      value={editedPatient?.insuranceNumber || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Tipo de sangre</Label>
                    <Input
                      id="bloodType"
                      name="bloodType"
                      value={editedPatient?.bloodType || ""}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContactName">Contacto de emergencia</Label>
                                         <Input
                       id="emergencyContactName"
                       name="emergencyContactName"
                       value={editedPatient?.emergencyContactName || ""}
                       onChange={handleInputChange}
                       placeholder="Nombre completo"
                     />
                   </div>
                   <div className="space-y-2">
                     <Label htmlFor="emergencyContactPhone">Teléfono de emergencia</Label>
                     <Input
                       id="emergencyContactPhone"
                       name="emergencyContactPhone"
                       value={editedPatient?.emergencyContactPhone || ""}
                       onChange={handleInputChange}
                       placeholder="809-555-1234"
                     />
                   </div>
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="emergencyContactRelationship">Relación</Label>
                   <Input
                     id="emergencyContactRelationship"
                     name="emergencyContactRelationship"
                     value={editedPatient?.emergencyContactRelationship || ""}
                     onChange={handleInputChange}
                     placeholder="Familiar, Amigo, etc."
                   />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias (separadas por comas)</Label>
                  <Textarea
                    id="allergies"
                    name="allergies"
                    value={editedPatient?.allergies?.join(', ') || ""}
                    onChange={handleInputChange}
                    placeholder="Penicilina, Mariscos, etc."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chronicConditions">Condiciones crónicas (separadas por comas)</Label>
                  <Textarea
                    id="chronicConditions"
                    name="chronicConditions"
                    value={editedPatient?.chronicConditions?.join(', ') || ""}
                    onChange={handleInputChange}
                    placeholder="Hipertensión, Diabetes, etc."
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select
                    value={editedPatient?.status || ""}
                    onValueChange={(value) => handleSelectChange("status", value as Patient["status"])}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activo">Activo</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={editedPatient?.notes || ""}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Número de cédula</p>
                    <p>{patient.cedula || "No especificado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Fecha de nacimiento</p>
                    <p>{patient.dateOfBirth ? (() => {
                      const dateValue = patient.dateOfBirth;
                      
                      if (dateValue instanceof Date) {
                        return `${dateValue.getDate().toString().padStart(2, '0')}/${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
                      }
                      
                      const dateStr = String(dateValue);
                      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        const [year, month, day] = dateStr.split('-').map(Number);
                        return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                      }
                      
                      if (dateStr.includes('T')) {
                        const dateOnly = dateStr.split('T')[0];
                        const [year, month, day] = dateOnly.split('-').map(Number);
                        return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                      }
                      
                      const date = new Date(dateStr);
                      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                    })() : "No especificado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Edad</p>
                    <p>{patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth instanceof Date ? patient.dateOfBirth.toISOString().split('T')[0] : String(patient.dateOfBirth))} años` : "No especificado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Género</p>
                    <p>{patient.gender || "No especificado"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Correo electrónico</p>
                    <p>{patient.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Teléfono</p>
                    <p>{patient.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Dirección</p>
                    <p>{patient.address || "No especificada"}</p>
                  </div>
                </div>
                                 <div className="flex items-center gap-2">
                   <FileText className="h-4 w-4 text-muted-foreground" />
                   <div className="space-y-1">
                     <p className="text-sm text-muted-foreground">Proveedor de seguro</p>
                     <p>{patient.insuranceProvider || "No especificado"}</p>
                   </div>
                 </div>
                 <div className="flex items-center gap-2">
                   <FileText className="h-4 w-4 text-muted-foreground" />
                   <div className="space-y-1">
                     <p className="text-sm text-muted-foreground">Número de seguro</p>
                     <p>{patient.insuranceNumber || "No especificado"}</p>
                   </div>
                 </div>
                 {patient.emergencyContactName && (
                  <>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Contacto de emergencia</p>
                                                 <p>{patient.emergencyContactName} - {patient.emergencyContactPhone}</p>
                         <p className="text-xs text-muted-foreground">{patient.emergencyContactRelationship}</p>
                      </div>
                    </div>
                  </>
                )}
                {patient.allergies && patient.allergies.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Alergias</p>
                      <p className="text-sm">{patient.allergies.join(', ')}</p>
                    </div>
                  </div>
                )}
                {patient.chronicConditions && patient.chronicConditions.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Condiciones crónicas</p>
                      <p className="text-sm">{patient.chronicConditions.join(', ')}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Última actualización</p>
                    <p>{patient.updatedAt ? (() => {
                      const dateValue = patient.updatedAt;
                      
                      if (dateValue instanceof Date) {
                        return `${dateValue.getDate().toString().padStart(2, '0')}/${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
                      }
                      
                      const dateStr = String(dateValue);
                      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        const [year, month, day] = dateStr.split('-').map(Number);
                        return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                      }
                      
                      if (dateStr.includes('T')) {
                        const dateOnly = dateStr.split('T')[0];
                        const [year, month, day] = dateOnly.split('-').map(Number);
                        return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                      }
                      
                      const date = new Date(dateStr);
                      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                    })() : "No disponible"}</p>
                  </div>
                </div>
                {patient.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium mb-1">Notas:</p>
                    <p className="text-sm">{patient.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter className="p-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  setEditedPatient(patient)
                  setValidationErrors({})
                }}
              >
                Cancelar
              </Button>
              <Button onClick={saveChanges}>Guardar cambios</Button>
            </CardFooter>
          )}
        </Card>

        {/* Pestañas con información relacionada */}
        <div className="md:col-span-2">
          <Tabs defaultValue="general" className="space-y-6 sm:space-y-6">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 gap-1">
              <TabsTrigger value="general" className="text-xs sm:text-sm">General</TabsTrigger>
              <TabsTrigger value="historia" className="text-xs sm:text-sm">Mi Historial</TabsTrigger>
              <TabsTrigger value="citas" className="text-xs sm:text-sm">Citas</TabsTrigger>
              <TabsTrigger value="facturas" className="text-xs sm:text-sm">Facturas</TabsTrigger>
              <TabsTrigger value="prescripciones" className="text-xs sm:text-sm">Recetas</TabsTrigger>
              <TabsTrigger value="documentos" className="text-xs sm:text-sm">Documentos</TabsTrigger>
            </TabsList>

            {/* Información General */}
            <TabsContent value="general">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle>Información General</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Nombre completo</Label>
                        <p className="text-sm">{patient?.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-sm">{patient?.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                        <p className="text-sm">{patient?.phone}</p>
                      </div>
                                             <div>
                         <Label className="text-sm font-medium text-muted-foreground">Proveedor de seguro</Label>
                         <Badge variant="outline">{patient?.insuranceProvider || "Sin seguro"}</Badge>
                       </div>
                       <div>
                         <Label className="text-sm font-medium text-muted-foreground">Número de seguro</Label>
                         <p className="text-sm">{patient?.insuranceNumber || "No especificado"}</p>
                       </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Fecha de nacimiento</Label>
                        <p className="text-sm">{patient?.dateOfBirth ? (() => {
                          const dateValue = patient.dateOfBirth;
                          
                          if (dateValue instanceof Date) {
                            return `${dateValue.getDate().toString().padStart(2, '0')}/${(dateValue.getMonth() + 1).toString().padStart(2, '0')}/${dateValue.getFullYear()}`;
                          }
                          
                          const dateStr = String(dateValue);
                          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const [year, month, day] = dateStr.split('-').map(Number);
                            return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                          }
                          
                          if (dateStr.includes('T')) {
                            const dateOnly = dateStr.split('T')[0];
                            const [year, month, day] = dateOnly.split('-').map(Number);
                            return `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year}`;
                          }
                          
                          const date = new Date(dateStr);
                          return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
                        })() : "No especificado"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Edad</Label>
                        <p className="text-sm">{patient?.dateOfBirth ? `${calculateAge(patient.dateOfBirth instanceof Date ? patient.dateOfBirth.toISOString().split('T')[0] : String(patient.dateOfBirth))} años` : "No especificado"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Género</Label>
                        <p className="text-sm">{patient?.gender || "No especificado"}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Clínica</Label>
                        <p className="text-sm">{patient?.clinicName || "No especificada"}</p>
                      </div>
                    </div>
                                         {patient?.emergencyContactName && (
                       <div className="border-t pt-4">
                         <Label className="text-sm font-medium text-muted-foreground">Contacto de emergencia</Label>
                         <div className="mt-2 p-3 bg-muted rounded-md">
                           <p className="text-sm"><strong>{patient.emergencyContactName}</strong></p>
                           <p className="text-sm text-muted-foreground">{patient.emergencyContactPhone}</p>
                           <p className="text-xs text-muted-foreground">{patient.emergencyContactRelationship}</p>
                         </div>
                       </div>
                     )}
                    {(patient?.allergies?.length > 0 || patient?.chronicConditions?.length > 0) && (
                      <div className="border-t pt-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          {patient?.allergies?.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Alergias</Label>
                              <p className="text-sm">{patient.allergies.join(', ')}</p>
                            </div>
                          )}
                          {patient?.chronicConditions?.length > 0 && (
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">Condiciones crónicas</Label>
                              <p className="text-sm">{patient.chronicConditions.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Historia Clínica */}
            <TabsContent value="historia">
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Historial Médico</CardTitle>
                    <Button asChild>
                      <Link href={`/dashboard/historia-clinica/nuevo?patientId=${patient.id}&returnTo=paciente&patientId=${patient.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nuevo Registro
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {patientRecords.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">No hay registros médicos para este paciente</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {patientRecords.map((record) => (
                        <div key={record.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{new Date(record.record_date).toLocaleDateString()}</span>
                            </div>
                            <Badge variant={record.status === "Completo" ? "default" : "outline"}>
                              {record.status}
                            </Badge>
                          </div>
                          <h3 className="font-medium">
                            {record.diagnosis ? (
                              <HtmlContent content={record.diagnosis} className="text-sm" />
                            ) : (
                              'Sin diagnóstico'
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {record.record_type} - {record.doctor_name}
                          </p>
                          {record.notes && <p className="text-sm line-clamp-2">{record.notes}</p>}
                          <div className="mt-2 flex justify-end">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/historia-clinica/${record.id}`}>Ver detalles</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Citas */}
            <TabsContent value="citas">
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Citas</CardTitle>
                    <Button asChild>
                      <Link href={`/dashboard/citas/nueva?patientId=${patient.id}&returnTo=paciente&patientId=${patient.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Cita
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {patientAppointments.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">No hay citas programadas para este paciente</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {patientAppointments.map((appointment) => (
                        <div key={appointment.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {appointment.date instanceof Date
                                  ? appointment.date.toLocaleDateString()
                                  : appointment.date}{" "}
                                - {appointment.time}
                              </span>
                            </div>
                            <Badge
                              variant={
                                appointment.status === "Confirmada"
                                  ? "default"
                                  : appointment.status === "Pendiente"
                                    ? "outline"
                                    : appointment.status === "Completada"
                                      ? "secondary"
                                      : "destructive"
                              }
                            >
                              {appointment.status}
                            </Badge>
                          </div>
                          <h3 className="font-medium">{appointment.type}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{appointment.doctor}</p>
                          {appointment.notes && <p className="text-sm line-clamp-2">{appointment.notes}</p>}
                          <div className="mt-2 flex justify-end">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/citas/${appointment.id}`}>Ver detalles</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Facturas */}
            <TabsContent value="facturas">
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Facturas</CardTitle>
                    <Button asChild>
                      <Link href={`/dashboard/facturacion/nueva?patientId=${patient.id}&returnTo=paciente&patientId=${patient.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Factura
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {patientInvoices.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">No hay facturas para este paciente</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {patientInvoices.map((invoice) => (
                        <div key={invoice.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{(invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : "N/A")}</span>
                            </div>
                            <Badge
                              variant={
                                invoice.status === "Pagada"
                                  ? "default"
                                  : invoice.status === "Pendiente"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <h3 className="font-medium">{invoice.id}</h3>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{(invoice.insurance_provider || "Sin seguro") || "Sin seguro"}</p>
                            <p className="font-medium">RD$ {(invoice.total_services ? parseFloat(invoice.total_services).toLocaleString() : "0")}</p>
                          </div>
                          <div className="mt-2 flex justify-end">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/dashboard/facturacion/${invoice.id}`}>Ver detalles</Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Prescripciones */}
            <TabsContent value="prescripciones">
              <Card>
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <CardTitle>Recetas</CardTitle>
                    <Button asChild>
                      <Link href={`/dashboard/recetario?patientId=${patient.id}&returnTo=paciente&patientId=${patient.id}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Nueva Prescripción
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {patientPrescriptions.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-muted-foreground">No hay recetas para este paciente</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {patientPrescriptions.map((prescription) => (
                        <div key={prescription.id} className="p-4 hover:bg-muted/50 transition-colors w-full overflow-hidden">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{new Date(prescription.prescription_date).toLocaleDateString()}</span>
                            </div>
                            <Badge
                              variant={
                                prescription.status === "Activa"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {prescription.status}
                            </Badge>
                          </div>
                          <h3 className="font-medium">Prescripción #{prescription.id}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{prescription.doctor_name}</p>
                          <div className="mt-2 p-3 bg-muted rounded-lg w-full overflow-hidden">
                            <p className="text-sm whitespace-pre-line line-clamp-3 break-words w-full">
                              {prescription.prescription_text}
                            </p>
                          </div>
                          <div className="mt-3 flex flex-wrap justify-end gap-1 sm:gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2"
                              onClick={() => {
                                setSelectedPrescription(prescription)
                                setShowPrescriptionModal(true)
                              }}
                            >
                              Ver Receta
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2"
                              onClick={() => {
                                // Determinar qué diseño usar basado en el doctor
                                const isLinda = prescription.doctor_name?.toLowerCase().includes("linda")
                                

                                
                                // Usar el sistema reutilizable para imprimir
                                printPrescriptionWithValidation({
                                  content: prescription.prescription_text || "",
                                  patient: {
                                    id: patient.id,
                                    name: patient.name,
                                    dateOfBirth: patient.dateOfBirth || undefined,
                                    email: patient.email,
                                    phone: patient.phone
                                  },
                                  doctor: {
                                    id: prescription.doctor_id || "unknown",
                                    name: prescription.doctor_name || "Doctor",
                                    licenseNumber: prescription.doctor_license,
                                    specialty: isLinda ? "Alergología" : "Cardiología"
                                  },
                                  clinic: {
                                    clinic_id: prescription.clinic_id || "unknown",
                                    clinic_name: prescription.clinic_name || "Clínica",
                                    clinic_address: prescription.clinic_address || "Dirección de la clínica",
                                    clinic_phone: prescription.clinic_phone || "809-555-1234",
                                    clinic_email: prescription.clinic_email || "info@hsalud-pro.com"
                                  },
                                  isLinda,
                                  showSignature: !isLinda, // Para Luis siempre mostrar firma
                                  prescriptionDate: prescription.prescription_date ? new Date(prescription.prescription_date) : undefined
                                })
                              }}
                            >
                              <FileText className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                              Imprimir
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-xs px-2 py-1 sm:text-sm sm:px-3 sm:py-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                                  Eliminar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar receta médica?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará permanentemente la receta médica del {new Date(prescription.prescription_date).toLocaleDateString()} y no se puede deshacer.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeletePrescription(prescription.id)}
                                    className="bg-red-500 hover:bg-red-600"
                                  >
                                    Eliminar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documentos */}
            <TabsContent value="documentos">
              <div className="space-y-6">
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle>Documentos del Paciente</CardTitle>
                      <Badge variant="outline">
                        {patientAttachments.length} documento{patientAttachments.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-6">
                    {/* Componente de Upload */}
                    <PatientAttachmentUpload
                      patientId={params.id as string}
                      onUploadSuccess={handleUploadPatientSuccess}
                      uploading={uploading}
                      uploadProgress={uploadProgress}
                    />

                    {/* Mostrar error si existe */}
                    {attachmentsError && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error con documentos</h3>
                            <p className="text-sm text-red-700 mt-1">{attachmentsError}</p>
                            <button
                              onClick={clearAttachmentsError}
                              className="text-sm text-red-600 underline hover:text-red-500 mt-2"
                            >
                              Cerrar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lista de Documentos */}
                    <PatientAttachmentList
                      attachments={patientAttachments}
                      loading={attachmentsLoading}
                      onDownload={handleDownloadPatientFile}
                      onDelete={handleDeletePatientFile}
                      onCategoryChange={setSelectedAttachmentCategory}
                      selectedCategory={selectedAttachmentCategory}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal para ver receta completa */}
      {showPrescriptionModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Receta Médica</h2>
                  <p className="text-sm text-gray-600">
                    {selectedPrescription.doctor_name} • {new Date(selectedPrescription.prescription_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Determinar qué diseño usar basado en el doctor
                      const isLinda = selectedPrescription.doctor_name?.toLowerCase().includes("linda")
                      
                      // Usar el sistema reutilizable para imprimir
                      printPrescriptionWithValidation({
                        content: selectedPrescription.prescription_text || "",
                        patient: {
                          id: patient.id,
                          name: patient.name,
                          dateOfBirth: patient.dateOfBirth || undefined,
                          email: patient.email,
                          phone: patient.phone
                        },
                        doctor: {
                          id: selectedPrescription.doctor_id || "unknown",
                          name: selectedPrescription.doctor_name || "Doctor",
                          licenseNumber: selectedPrescription.doctor_license,
                          specialty: isLinda ? "Alergología" : "Cardiología"
                        },
                        clinic: {
                          clinic_id: selectedPrescription.clinic_id || "unknown",
                          clinic_name: selectedPrescription.clinic_name || "Clínica",
                          clinic_address: selectedPrescription.clinic_address || "Dirección de la clínica",
                          clinic_phone: selectedPrescription.clinic_phone || "809-555-1234",
                          clinic_email: selectedPrescription.clinic_email || "info@hsalud-pro.com"
                        },
                        isLinda,
                        showSignature: !isLinda, // Para Luis siempre mostrar firma
                        prescriptionDate: selectedPrescription.prescription_date ? new Date(selectedPrescription.prescription_date) : undefined
                      })
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Imprimir
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPrescriptionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              
              {/* Usar los nuevos componentes de prescripción según el doctor */}
              {selectedPrescription.doctor_name?.toLowerCase().includes("linda") || selectedPrescription.doctor_name?.toLowerCase().includes("mily") ? (
                <LindaPrescriptionView
                  patient={patient}
                  prescription={selectedPrescription.prescription_text || ""}
                  doctorName={selectedPrescription.doctor_name || "Dra. Mily"}
                  doctorSpecialty="Cirujana - Oftalmóloga"
                  doctorLicense={selectedPrescription.doctor_license || "N/A"}
                  clinicAddress={selectedPrescription.clinic_address || "Dirección de la clínica"}
                  clinicPhone={selectedPrescription.clinic_phone || "809-555-1234"}
                  clinicEmail={selectedPrescription.clinic_email || "info@hsalud-pro.com"}
                  clinicWebsite={selectedPrescription.clinic_website || "hsalud-pro.com"}
                  doctorId={selectedPrescription.doctor_id}
                  allClinics={[]}
                  doctorEmail="dramilypenac@yahoo.es"
                  doctorPhone="809-524-7298"
                  doctorCell="849-201-0850"
                />
              ) : (
                <LuisPrescriptionView
                  patient={patient}
                  prescription={selectedPrescription.prescription_text || ""}
                  doctorName={selectedPrescription.doctor_name || "Dr. Luis"}
                  doctorSpecialty="Cardiología"
                  doctorLicense={selectedPrescription.doctor_license || "N/A"}
                  clinicAddress={selectedPrescription.clinic_address || "Dirección de la clínica"}
                  clinicPhone={selectedPrescription.clinic_phone || "809-555-1234"}
                  clinicEmail={selectedPrescription.clinic_email || "info@hsalud-pro.com"}
                  clinicWebsite={selectedPrescription.clinic_website || "hsalud-pro.com"}
                  doctorId={selectedPrescription.doctor_id}
                  allClinics={[]}
                  doctorEmail=""
                  doctorPhone=""
                  doctorCell=""
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
