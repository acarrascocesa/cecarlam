"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  ArrowRight,
  ChevronRight,
  FlaskRoundIcon as Flask,
  Link2,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Unlock,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function IntegracionesPage() {
  const [selectedTab, setSelectedTab] = useState("laboratorios")

  // Datos de ejemplo para laboratorios
  const laboratories = [
    {
      id: "1",
      name: "Laboratorio Amadita",
      logo: "/placeholder.svg?key=veg9u",
      status: "Conectado",
      lastSync: "Hoy, 10:30 AM",
      apiKey: "••••••••••••3456",
      pendingResults: 5,
    },
    {
      id: "2",
      name: "Referencia Laboratorio Clínico",
      logo: "/placeholder.svg?key=8cgve",
      status: "Conectado",
      lastSync: "Ayer, 3:45 PM",
      apiKey: "••••••••••••7890",
      pendingResults: 2,
    },
    {
      id: "3",
      name: "Laboratorio Clínico Patria Rivas",
      logo: "/placeholder.svg?key=1d566",
      status: "Desconectado",
      lastSync: "12/05/2023",
      apiKey: "••••••••••••1234",
      pendingResults: 0,
    },
    {
      id: "4",
      name: "Laboratorio Clínico Rodríguez Objío",
      logo: "/placeholder.svg?key=qek2g",
      status: "Pendiente",
      lastSync: "-",
      apiKey: "-",
      pendingResults: 0,
    },
  ]

  // Datos de ejemplo para farmacias
  const pharmacies = [
    {
      id: "1",
      name: "Farmacia Carol",
      logo: "/placeholder.svg?key=kgo3h",
      status: "Conectado",
      lastSync: "Hoy, 9:15 AM",
      apiKey: "••••••••••••5678",
      pendingPrescriptions: 3,
    },
    {
      id: "2",
      name: "Farmacia GBC",
      logo: "/placeholder.svg?key=ikltd",
      status: "Conectado",
      lastSync: "Ayer, 2:30 PM",
      apiKey: "••••••••••••9012",
      pendingPrescriptions: 1,
    },
    {
      id: "3",
      name: "Farmacia Los Girasoles",
      logo: "/placeholder.svg?key=3aews",
      status: "Desconectado",
      lastSync: "10/05/2023",
      apiKey: "••••••••••••3456",
      pendingPrescriptions: 0,
    },
  ]

  // Datos de ejemplo para centros de imágenes
  const imagingCenters = [
    {
      id: "1",
      name: "CEDIMAT",
      logo: "/placeholder.svg?key=fjtvd",
      status: "Conectado",
      lastSync: "Hoy, 11:45 AM",
      apiKey: "••••••••••••7890",
      pendingStudies: 2,
    },
    {
      id: "2",
      name: "Centro de Diagnóstico Medicina Avanzada (CEDIMAT)",
      logo: "/placeholder.svg?key=8idaz",
      status: "Conectado",
      lastSync: "Ayer, 4:20 PM",
      apiKey: "••••••••••••1234",
      pendingStudies: 1,
    },
    {
      id: "3",
      name: "Centro de Diagnóstico Dr. Betances",
      logo: "/placeholder.svg?key=32nrp",
      status: "Pendiente",
      lastSync: "-",
      apiKey: "-",
      pendingStudies: 0,
    },
  ]

  // Datos de ejemplo para seguros médicos
  const insurances = [
    {
      id: "1",
      name: "SENASA Pensionado",
      logo: "/placeholder.svg?key=0nm2r",
      status: "Conectado",
      lastSync: "Hoy, 8:30 AM",
      apiKey: "••••••••••••5678",
      pendingClaims: 7,
    },
    {
      id: "2",
      name: "ARS Humano",
      logo: "/placeholder.svg?key=aif3v",
      status: "Conectado",
      lastSync: "Ayer, 1:15 PM",
      apiKey: "••••••••••••9012",
      pendingClaims: 4,
    },
    {
      id: "3",
      name: "ARS Universal",
      logo: "/placeholder.svg?key=ypnaz",
      status: "Conectado",
      lastSync: "Ayer, 5:45 PM",
      apiKey: "••••••••••••3456",
      pendingClaims: 2,
    },
    {
      id: "4",
      name: "ARS Palic",
      logo: "/placeholder.svg?key=palic",
      status: "Desconectado",
      lastSync: "15/05/2023",
      apiKey: "••••••••••••7890",
      pendingClaims: 0,
    },
    {
      id: "5",
      name: "Mapfre Salud",
      logo: "/placeholder.svg?key=mapfre",
      status: "Pendiente",
      lastSync: "-",
      apiKey: "-",
      pendingClaims: 0,
    },
  ]

  // Datos de ejemplo para registros de actividad
  const activityLogs = [
    {
      id: "1",
      date: "Hoy, 10:30 AM",
      action: "Sincronización de resultados",
      entity: "Laboratorio Amadita",
      status: "Éxito",
      user: "Dr. Martínez",
    },
    {
      id: "2",
      date: "Hoy, 9:15 AM",
      action: "Envío de receta",
      entity: "Farmacia Carol",
      status: "Éxito",
      user: "Dr. Martínez",
    },
    {
      id: "3",
      date: "Ayer, 4:20 PM",
      action: "Recepción de imágenes",
      entity: "CEDIMAT",
      status: "Éxito",
      user: "Sistema",
    },
    {
      id: "4",
      date: "Ayer, 3:45 PM",
      action: "Sincronización de resultados",
      entity: "Referencia Laboratorio Clínico",
      status: "Éxito",
      user: "Sistema",
    },
    {
      id: "5",
      date: "Ayer, 1:15 PM",
      action: "Envío de reclamación",
      entity: "ARS Humano",
      status: "Error",
      user: "Dr. Martínez",
    },
  ]

  return (
    <div className="space-y-6 max-w-9xl mx-auto w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Integraciones</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gestione las conexiones con laboratorios, farmacias y otros sistemas externos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="text-xs sm:text-sm">
            <Plus className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Nueva integración
          </Button>
        </div>
      </div>

      <Tabs defaultValue="laboratorios" value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid grid-cols-5 md:w-[800px]">
          <TabsTrigger value="laboratorios">Laboratorios</TabsTrigger>
          <TabsTrigger value="farmacias">Farmacias</TabsTrigger>
          <TabsTrigger value="imagenes">Centros de Imágenes</TabsTrigger>
          <TabsTrigger value="seguros">Seguros Médicos</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="laboratorios" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle>Laboratorios Conectados</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Conectar laboratorio
                </Button>
              </div>
              <CardDescription>
                Gestione las conexiones con laboratorios clínicos para recibir resultados automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Laboratorio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última sincronización</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Resultados pendientes</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {laboratories.map((lab) => (
                    <TableRow key={lab.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={lab.logo || "/placeholder.svg"} alt={lab.name} />
                            <AvatarFallback>{lab.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{lab.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lab.status === "Conectado"
                              ? "default"
                              : lab.status === "Desconectado"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {lab.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{lab.lastSync}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{lab.apiKey}</span>
                          {lab.status === "Conectado" && (
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lab.pendingResults > 0 ? (
                          <Badge variant="secondary">{lab.pendingResults}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {lab.status === "Conectado" && (
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sincronizar
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configurar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle>Configuración de Laboratorio</CardTitle>
                <CardDescription>Laboratorio Amadita</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key</Label>
                  <div className="flex gap-2">
                    <Input id="api-key" value="••••••••••••3456" readOnly />
                    <Button variant="outline" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL de Webhook</Label>
                  <div className="flex gap-2">
                    <Input id="webhook-url" value="https://medicos-crm.vercel.app/api/webhooks/amadita" readOnly />
                    <Button variant="outline" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sync-frequency">Frecuencia de sincronización</Label>
                  <Select defaultValue="hourly">
                    <SelectTrigger id="sync-frequency">
                      <SelectValue placeholder="Seleccionar frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realtime">Tiempo real</SelectItem>
                      <SelectItem value="hourly">Cada hora</SelectItem>
                      <SelectItem value="daily">Diaria</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-import">Importación automática</Label>
                    <p className="text-sm text-muted-foreground">
                      Importar automáticamente los resultados a la historia clínica
                    </p>
                  </div>
                  <Switch id="auto-import" checked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notify-patient">Notificar al paciente</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificación al paciente cuando los resultados estén disponibles
                    </p>
                  </div>
                  <Switch id="notify-patient" checked />
                </div>
              </CardContent>
              <CardFooter className="p-4 flex justify-between">
                <Button variant="outline">
                  <Link2 className="mr-2 h-4 w-4" />
                  Probar conexión
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-red-500 hover:text-red-500">
                    <Unlock className="mr-2 h-4 w-4" />
                    Desconectar
                  </Button>
                  <Button>Guardar cambios</Button>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle>Resultados Pendientes</CardTitle>
                <CardDescription>Resultados recibidos pendientes de revisión</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-4">
                  <div className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flask className="h-4 w-4 text-mint-soft" />
                        <span className="font-medium">Hemograma completo</span>
                      </div>
                      <Badge>Nuevo</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">María Rodríguez</span>
                      <span className="text-muted-foreground">Recibido: Hoy, 10:30 AM</span>
                    </div>
                  </div>
                  <div className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flask className="h-4 w-4 text-mint-soft" />
                        <span className="font-medium">Perfil lipídico</span>
                      </div>
                      <Badge>Nuevo</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Juan Pérez</span>
                      <span className="text-muted-foreground">Recibido: Hoy, 9:45 AM</span>
                    </div>
                  </div>
                  <div className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flask className="h-4 w-4 text-mint-soft" />
                        <span className="font-medium">Glucosa en ayunas</span>
                      </div>
                      <Badge>Nuevo</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Ana Gómez</span>
                      <span className="text-muted-foreground">Recibido: Hoy, 8:15 AM</span>
                    </div>
                  </div>
                  <div className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flask className="h-4 w-4 text-mint-soft" />
                        <span className="font-medium">Perfil tiroideo</span>
                      </div>
                      <Badge>Nuevo</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Carlos Díaz</span>
                      <span className="text-muted-foreground">Recibido: Ayer, 4:30 PM</span>
                    </div>
                  </div>
                  <div className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Flask className="h-4 w-4 text-mint-soft" />
                        <span className="font-medium">Prueba COVID-19</span>
                      </div>
                      <Badge>Nuevo</Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Laura Sánchez</span>
                      <span className="text-muted-foreground">Recibido: Ayer, 2:15 PM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4">
                <Button className="w-full">
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Ver todos los resultados
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="farmacias" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle>Farmacias Conectadas</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Conectar farmacia
                </Button>
              </div>
              <CardDescription>Gestione las conexiones con farmacias para enviar recetas electrónicas</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmacia</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última sincronización</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Recetas pendientes</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pharmacies.map((pharmacy) => (
                    <TableRow key={pharmacy.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={pharmacy.logo || "/placeholder.svg"} alt={pharmacy.name} />
                            <AvatarFallback>{pharmacy.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{pharmacy.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            pharmacy.status === "Conectado"
                              ? "default"
                              : pharmacy.status === "Desconectado"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {pharmacy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{pharmacy.lastSync}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{pharmacy.apiKey}</span>
                          {pharmacy.status === "Conectado" && (
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {pharmacy.pendingPrescriptions > 0 ? (
                          <Badge variant="secondary">{pharmacy.pendingPrescriptions}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {pharmacy.status === "Conectado" && (
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sincronizar
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configurar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imagenes" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle>Centros de Imágenes Conectados</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Conectar centro
                </Button>
              </div>
              <CardDescription>
                Gestione las conexiones con centros de imágenes para recibir estudios automáticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Centro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última sincronización</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Estudios pendientes</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {imagingCenters.map((center) => (
                    <TableRow key={center.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={center.logo || "/placeholder.svg"} alt={center.name} />
                            <AvatarFallback>{center.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{center.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            center.status === "Conectado"
                              ? "default"
                              : center.status === "Desconectado"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {center.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{center.lastSync}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{center.apiKey}</span>
                          {center.status === "Conectado" && (
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {center.pendingStudies > 0 ? (
                          <Badge variant="secondary">{center.pendingStudies}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {center.status === "Conectado" && (
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sincronizar
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configurar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguros" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle>Seguros Médicos Conectados</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Conectar seguro
                </Button>
              </div>
              <CardDescription>
                Gestione las conexiones con seguros médicos para facturación y reclamaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Seguro</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Última sincronización</TableHead>
                    <TableHead>API Key</TableHead>
                    <TableHead>Reclamaciones pendientes</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {insurances.map((insurance) => (
                    <TableRow key={insurance.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={insurance.logo || "/placeholder.svg"} alt={insurance.name} />
                            <AvatarFallback>{insurance.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{insurance.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            insurance.status === "Conectado"
                              ? "default"
                              : insurance.status === "Desconectado"
                                ? "destructive"
                                : "outline"
                          }
                        >
                          {insurance.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{insurance.lastSync}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{insurance.apiKey}</span>
                          {insurance.status === "Conectado" && (
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {insurance.pendingClaims > 0 ? (
                          <Badge variant="secondary">{insurance.pendingClaims}</Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {insurance.status === "Conectado" && (
                            <Button variant="ghost" size="sm">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sincronizar
                            </Button>
                          )}
                          <Button variant="ghost" size="sm">
                            <Settings className="mr-2 h-4 w-4" />
                            Configurar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actividad" className="space-y-4">
          <Card>
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle>Registro de Actividad</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="search" placeholder="Buscar actividad..." className="pl-8 w-[250px]" />
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las actividades</SelectItem>
                      <SelectItem value="sync">Sincronizaciones</SelectItem>
                      <SelectItem value="error">Errores</SelectItem>
                      <SelectItem value="auth">Autenticación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>Historial de actividades de integración con sistemas externos</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y hora</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead className="text-right">Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.date}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.entity}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === "Éxito" ? "default" : "destructive"}>{log.status}</Badge>
                      </TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="p-4 flex justify-between">
              <div className="text-sm text-muted-foreground">Mostrando 5 de 124 actividades</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  Anterior
                </Button>
                <Button variant="outline" size="sm">
                  Siguiente
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Eye(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function Copy(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  )
}
