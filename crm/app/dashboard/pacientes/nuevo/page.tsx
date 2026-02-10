"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { useRealClinics } from "@/hooks/useRealClinics"
import { getClinicDisplayName } from "@/lib/clinicDisplayNames"

export default function NewPatientPage() {
  const router = useRouter()
  const { addPatient, selectedClinicId } = useAppContext()
  const { user } = useAuth()
  const { clinics } = useRealClinics()
  const [selectedFormClinicId, setSelectedFormClinicId] = useState<string>("")
  
  // Check if user has multi-clinic view
  const hasMultiClinicView = user?.multiClinicView && (user?.role === 'doctor' || user?.role === 'secretary')

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cedula: "",
    insurance: "",
    insuranceNumber: "",
    birthDate: "",
    gender: "",
    address: "",
    bloodType: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    allergies: "",
    chronicConditions: "",
    notes: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })

    // Limpiar error del campo
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      })
    }
  }

  // Manejar cambios en selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })

    // Limpiar error del campo
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // CAMPOS OBLIGATORIOS: nombre, fecha de nacimiento, teléfono, seguro
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "El teléfono es obligatorio"
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "La fecha de nacimiento es obligatoria"
    }

    if (!formData.insurance) {
      newErrors.insurance = "Debe seleccionar un proveedor de seguro"
    }

    // Validar número de seguro si no es "SIN SEGURO"
    if (formData.insurance && formData.insurance !== "SIN SEGURO" && !formData.insuranceNumber.trim()) {
      newErrors.insuranceNumber = "El número de seguro es obligatorio cuando se selecciona un proveedor"
    }

    // Validar clínica para usuarios con vista unificada
    if (hasMultiClinicView && !selectedFormClinicId) {
      newErrors.clinic = "Debe seleccionar un centro médico"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Crear nuevo paciente
      const newPatient = {
        ...formData,
        clinicId: hasMultiClinicView ? selectedFormClinicId : selectedClinicId!,
        insuranceProvider: formData.insurance,
        insuranceNumber: formData.insuranceNumber
      }

      const patientId = await addPatient(newPatient)

      // Redirigir a la página del paciente
      router.push(`/dashboard/pacientes/${patientId}`)
    } catch (error) {
      console.error("Error al crear paciente:", error)
      alert("Error al crear el paciente")
    } finally {
      setIsSubmitting(false)
    }
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
        <h1 className="text-3xl font-bold tracking-tight">Nuevo Paciente</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader className="p-6">
            <CardTitle>Información del Paciente</CardTitle>
            <CardDescription>Ingrese los datos del nuevo paciente</CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-6">
            {/* Campo selector de clínica para usuarios con vista unificada */}
            {hasMultiClinicView && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Label htmlFor="clinic-selector" className="text-sm font-medium text-blue-800">
                  Centro Médico donde registrar el paciente <span className="text-red-500">*</span>
                </Label>
                <Select 
                  value={selectedFormClinicId} 
                  onValueChange={setSelectedFormClinicId}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Seleccionar centro médico..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.clinic_id} value={clinic.clinic_id}>
                        {getClinicDisplayName(user?.email || '', clinic)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!selectedFormClinicId && hasMultiClinicView && (
                  <p className="text-sm text-red-500 mt-1">Debe seleccionar un centro médico</p>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre y apellidos"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Teléfono <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="809-555-1234"
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
              </div>
                            <div className="space-y-2">
                <Label htmlFor="cedula">
                  Cédula
                </Label>
                <Input
                  id="cedula"
                  name="cedula"
                  value={formData.cedula}
                  onChange={handleInputChange}
                  placeholder="001-1234567-8"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">
                  Seguro médico <span className="text-red-500">*</span>
                </Label>
                                  <Select value={formData.insurance} onValueChange={(value) => handleSelectChange("insurance", value)}>
                    <SelectTrigger id="insurance" className={errors.insurance ? "border-red-500" : ""}>
                      <SelectValue placeholder="Seleccionar proveedor de seguro (obligatorio)" />
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
                {errors.insurance && <p className="text-sm text-red-500">{errors.insurance}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">
                  Número de seguro {formData.insurance && formData.insurance !== "SIN SEGURO" && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="insuranceNumber"
                  name="insuranceNumber"
                  value={formData.insuranceNumber}
                  onChange={handleInputChange}
                  placeholder="Número de póliza o tarjeta"
                  className={errors.insuranceNumber ? "border-red-500" : ""}
                />
                {errors.insuranceNumber && <p className="text-sm text-red-500">{errors.insuranceNumber}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de nacimiento <span className="text-red-500">*</span></Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Género</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
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
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle, número, ciudad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodType">Tipo de sangre</Label>
                <Input
                  id="bloodType"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleInputChange}
                  placeholder="A+, O-, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Nombre de contacto de emergencia</Label>
                <Input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Teléfono de contacto de emergencia</Label>
                <Input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="809-555-9876"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelationship">Relación de contacto de emergencia</Label>
                <Input
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange}
                  placeholder="Familia, Amigo, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias (separadas por comas)</Label>
                <Textarea
                  id="allergies"
                  name="allergies"
                  value={formData.allergies}
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
                  value={formData.chronicConditions}
                  onChange={handleInputChange}
                  placeholder="Hipertensión, Diabetes, etc."
                  rows={2}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Información adicional, antecedentes, etc."
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-6 flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/pacientes">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Paciente"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
