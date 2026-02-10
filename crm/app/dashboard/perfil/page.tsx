"use client"

import { useState } from "react"
import { useAppContext } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X } from "lucide-react"

export default function ProfilePage() {
  const { currentUser, clinics } = useAppContext()
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState(currentUser)

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h1 className="text-2xl font-bold">No se encontró información del usuario</h1>
        <p className="text-muted-foreground">Por favor, inicie sesión nuevamente.</p>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedUser) return

    setEditedUser({
      ...editedUser,
      [e.target.name]: e.target.value,
    })
  }

  const handleSave = () => {
    // Aquí se implementaría la lógica para guardar los cambios
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedUser(currentUser)
    setIsEditing(false)
  }

  const userClinics = clinics.filter(clinic => clinic.user_id === currentUser.id)

  return (
    <div className="flex flex-col gap-6 max-w-9xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Gestiona tu información personal y profesional</p>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} size="sm" className="text-xs sm:text-sm">
              <Edit className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Editar Perfil</span>
              <span className="sm:hidden">Editar</span>
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} size="sm" className="text-xs sm:text-sm">
                <X className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Cancelar</span>
                <span className="sm:hidden">Cancelar</span>
              </Button>
              <Button onClick={handleSave} size="sm" className="text-xs sm:text-sm">
                <Save className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Guardar</span>
                <span className="sm:hidden">Guardar</span>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>Datos básicos de tu perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUser.avatarUrl || "/placeholder.svg"} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{currentUser.name}</h3>
                <Badge variant="outline">{currentUser.role === "doctor" ? "Médico" : "Secretaria"}</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    value={editedUser?.email || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Nombre Completo</Label>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    value={editedUser?.name || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {currentUser.licenseNumber && (
                <div>
                  <Label htmlFor="license">Número de Licencia</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="license"
                      name="licenseNumber"
                      value={editedUser?.licenseNumber || ""}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clínicas Asociadas</CardTitle>
            <CardDescription>Centros médicos donde trabajas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userClinics.map((clinic) => (
                <div key={clinic.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{clinic.clinic_name}</h4>
                    <p className="text-sm text-muted-foreground">{clinic.clinic_address}</p>
                    <p className="text-sm text-muted-foreground">{clinic.clinic_phone}</p>
                  </div>
                  <Badge variant="secondary">Activa</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de Seguridad</CardTitle>
          <CardDescription>Gestiona tu contraseña y configuraciones de seguridad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <div>
              <Label htmlFor="currentPassword">Contraseña Actual</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Ingresa tu contraseña actual"
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                disabled={!isEditing}
              />
            </div>
          </div>
          
          {isEditing && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Cambiar Contraseña
              </Button>
              <Button variant="outline" size="sm">
                Activar Autenticación de Dos Factores
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
          <CardDescription>Configura tus preferencias de la aplicación</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notifications">Notificaciones</Label>
              <Textarea
                id="notifications"
                placeholder="Configura tus preferencias de notificaciones..."
                rows={3}
                disabled={!isEditing}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  disabled={!isEditing}
                  defaultChecked
                />
                <Label htmlFor="emailNotifications">Notificaciones por correo</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="smsNotifications"
                  disabled={!isEditing}
                />
                <Label htmlFor="smsNotifications">Notificaciones por SMS</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 