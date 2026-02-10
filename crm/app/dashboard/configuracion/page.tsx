"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  User,
  Lock,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useConfigContext } from "@/context/config-context"
import useConfig from "@/hooks/useConfig"
import { toast } from "sonner"

export default function ConfigurationPage() {
  const { user } = useAuth()
  const { settings: globalSettings, updateSettings, refreshSettings } = useConfigContext()
  const { 
    isLoading, 
    error, 
    getDoctorProfile, 
    saveDoctorProfile, 
    changePassword 
  } = useConfig()
  
  // Configuración básica - usar el contexto global
  const [basicSettings, setBasicSettings] = useState(globalSettings)

  // Perfil del doctor
  const [doctorProfile, setDoctorProfile] = useState({
    fullName: user?.name || "",
    specialty: "Cardiología",
    licenseNumber: "",
    phone: "",
    consultationHours: "8:00 AM - 5:00 PM"
  })

  // Cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Actualizar settings locales cuando cambien los globales
  useEffect(() => {
    setBasicSettings(globalSettings)
  }, [globalSettings])

  // Cargar perfil del doctor al inicializar
  useEffect(() => {
    const loadDoctorProfile = async () => {
      try {
        const profile = await getDoctorProfile()
        setDoctorProfile(profile)
      } catch (error) {
        console.error('Error al cargar perfil:', error)
        toast.error('Error al cargar el perfil del doctor')
      }
    }
    
    loadDoctorProfile()
  }, [])

  // Validar cambio de contraseña
  const validatePasswordChange = () => {
    const newErrors: Record<string, string> = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es obligatoria"
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "La nueva contraseña es obligatoria"
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "La contraseña debe tener al menos 8 caracteres"
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Debe confirmar la nueva contraseña"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Guardar configuración básica usando el contexto
  const handleSaveBasicSettings = async () => {
    setIsSaving(true)
    try {
      await updateSettings(basicSettings)
      toast.success('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error al guardar configuración:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  // Guardar perfil del doctor
  const handleSaveDoctorProfile = async () => {
    setIsSaving(true)
    try {
      await saveDoctorProfile(doctorProfile)
      toast.success('Perfil actualizado exitosamente')
    } catch (error) {
      console.error('Error al guardar perfil:', error)
      toast.error('Error al guardar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  // Cambiar contraseña
  const handleChangePassword = async () => {
    if (!validatePasswordChange()) {
      return
    }

    setIsSaving(true)
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      // Limpiar formulario
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      setErrors({})
      
      toast.success('Contraseña cambiada exitosamente')
    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      toast.error(error instanceof Error ? error.message : 'Error al cambiar la contraseña')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-9xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestiona tu configuración personal y preferencias del sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Configuración Básica */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Configuración Básica
            </CardTitle>
            <CardDescription>
              Configuración general del sistema y preferencias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="clinicName">Nombre de la Clínica</Label>
              <Input
                id="clinicName"
                value={basicSettings.clinicName}
                onChange={(e) => setBasicSettings(prev => ({ ...prev, clinicName: e.target.value }))}
                placeholder="Nombre de la clínica"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="timezone">Zona Horaria</Label>
              <Select 
                value={basicSettings.timezone} 
                onValueChange={(value) => setBasicSettings(prev => ({ ...prev, timezone: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Santo_Domingo">Santo Domingo (GMT-4)</SelectItem>
                  <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Ángeles (GMT-8)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select 
                value={basicSettings.language} 
                onValueChange={(value) => setBasicSettings(prev => ({ ...prev, language: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <Button 
              onClick={handleSaveBasicSettings} 
              disabled={isSaving || isLoading}
              className="w-full sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar Configuración"}
            </Button>
          </CardContent>
        </Card>

        {/* Perfil del Doctor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Perfil del Doctor
            </CardTitle>
            <CardDescription>
              Información personal y profesional
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nombre Completo</Label>
              <Input
                id="fullName"
                value={doctorProfile.fullName}
                onChange={(e) => setDoctorProfile(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder="Dr. Juan Pérez"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="specialty">Especialidad</Label>
              <Select 
                value={doctorProfile.specialty} 
                onValueChange={(value) => setDoctorProfile(prev => ({ ...prev, specialty: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardiología">Cardiología</SelectItem>
                  <SelectItem value="Alergología">Alergología</SelectItem>
                  <SelectItem value="Medicina General">Medicina General</SelectItem>
                  <SelectItem value="Pediatría">Pediatría</SelectItem>
                  <SelectItem value="Dermatología">Dermatología</SelectItem>
                  <SelectItem value="Otra">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="licenseNumber">Número de Licencia Médica</Label>
              <Input
                id="licenseNumber"
                value={doctorProfile.licenseNumber}
                onChange={(e) => setDoctorProfile(prev => ({ ...prev, licenseNumber: e.target.value }))}
                placeholder="12345"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="phone">Teléfono de Contacto</Label>
              <Input
                id="phone"
                value={doctorProfile.phone}
                onChange={(e) => setDoctorProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="809-555-1234"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="consultationHours">Horario de Consulta</Label>
              <Input
                id="consultationHours"
                value={doctorProfile.consultationHours}
                onChange={(e) => setDoctorProfile(prev => ({ ...prev, consultationHours: e.target.value }))}
                placeholder="8:00 AM - 5:00 PM"
                disabled={isLoading}
              />
            </div>

            <Separator />

            <Button 
              onClick={handleSaveDoctorProfile} 
              disabled={isSaving || isLoading}
              className="w-full sm:w-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar Perfil"}
            </Button>
          </CardContent>
        </Card>

        {/* Cambio de Contraseña */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lock className="h-5 w-5" />
              Cambiar Contraseña
            </CardTitle>
            <CardDescription>
              Actualiza tu contraseña de acceso al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Ingresa tu contraseña actual"
                  className={errors.currentPassword ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  className={errors.newPassword ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Repite la nueva contraseña"
                  className={errors.confirmPassword ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <Separator />

            <Button 
              onClick={handleChangePassword} 
              disabled={isSaving || isLoading}
              className="w-full sm:w-auto"
            >
              <Lock className="mr-2 h-4 w-4" />
              {isSaving ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
