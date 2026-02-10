"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useAppContext } from "@/context/app-context";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { es } from "date-fns/locale";
import TurnosView from "@/components/TurnosView";

export default function AppointmentsPage() {
  const { appointments, updateAppointment, currentUser, selectedClinicId } =
    useAppContext();
  const searchParams = useSearchParams();

  // Función para obtener iniciales del nombre y apellido
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(
        0
      )}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<string>("lista");
  const [view, setView] = useState<"day" | "week" | "month">("day");
  const [doctor, setDoctor] = useState<string>("todos");
  const [status, setStatus] = useState<string>("todos");
  const [type, setType] = useState<string>("todos");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Manejar parámetro de tab desde URL
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['lista', 'agenda', 'turnos'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Función para formatear fechas relativas
  const formatRelativeDate = (dateValue: Date | string) => {
    const date =
      typeof dateValue === "string" ? new Date(dateValue) : dateValue;

    if (isToday(date)) return "Hoy";
    if (isTomorrow(date)) return "Mañana";
    if (isYesterday(date)) return "Ayer";

    return format(date, "d 'de' MMMM", { locale: es });
  };

  // Filtrar citas según los criterios seleccionados
  const filteredAppointments = appointments.filter((appointment) => {
    // Filtro por fecha
    if (date) {
      // Convertir appointment.date de string a Date para comparaciones, evitando problemas de timezone
      const appointmentDate = (() => {
        if (typeof appointment.date === "string") {
          // Si la fecha viene como YYYY-MM-DD, parsear como fecha local
          if (appointment.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = appointment.date.split("-").map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0);
          }

          // Si la fecha viene como ISO string (YYYY-MM-DDTHH:mm:ss.sssZ), extraer solo la fecha
          if (appointment.date.includes("T")) {
            const dateOnly = appointment.date.split("T")[0]; // Extraer YYYY-MM-DD
            const [year, month, day] = dateOnly.split("-").map(Number);
            return new Date(year, month - 1, day, 12, 0, 0, 0);
          }

          // Fallback para otros formatos
          return new Date(appointment.date);
        }
        return appointment.date;
      })();

      if (view === "day") {
        if (
          appointmentDate.getDate() !== date.getDate() ||
          appointmentDate.getMonth() !== date.getMonth() ||
          appointmentDate.getFullYear() !== date.getFullYear()
        ) {
          return false;
        }
      } else if (view === "week") {
        // Implementar filtro por semana si es necesario
      } else if (view === "month") {
        if (
          appointmentDate.getMonth() !== date.getMonth() ||
          appointmentDate.getFullYear() !== date.getFullYear()
        ) {
          return false;
        }
      }
    }

    // Filtro por doctor
    if (doctor !== "todos" && appointment.doctor !== doctor) {
      return false;
    }

    // Filtro por estado
    if (status !== "todos" && appointment.status !== status) {
      return false;
    }

    // Filtro por tipo
    if (type !== "todos" && appointment.type !== type) {
      return false;
    }

    // Filtro por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        appointment.patient.name.toLowerCase().includes(query) ||
        appointment.type.toLowerCase().includes(query) ||
        appointment.doctor.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Ordenar citas por fecha y hora
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    // Convertir fechas de string a Date para comparaciones, evitando problemas de timezone
    const dateA = (() => {
      if (typeof a.date === "string") {
        if (a.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = a.date.split("-").map(Number);
          return new Date(year, month - 1, day, 12, 0, 0, 0);
        }
        if (a.date.includes("T")) {
          const dateOnly = a.date.split("T")[0];
          const [year, month, day] = dateOnly.split("-").map(Number);
          return new Date(year, month - 1, day, 12, 0, 0, 0);
        }
        return new Date(a.date);
      }
      return a.date;
    })();

    const dateB = (() => {
      if (typeof b.date === "string") {
        if (b.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = b.date.split("-").map(Number);
          return new Date(year, month - 1, day, 12, 0, 0, 0);
        }
        if (b.date.includes("T")) {
          const dateOnly = b.date.split("T")[0];
          const [year, month, day] = dateOnly.split("-").map(Number);
          return new Date(year, month - 1, day, 12, 0, 0, 0);
        }
        return new Date(b.date);
      }
      return b.date;
    })();

    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }

    // Si las fechas son iguales, ordenar por hora
    const timeA = a.time.split(":").map(Number);
    const timeB = b.time.split(":").map(Number);

    if (timeA[0] !== timeB[0]) {
      return timeA[0] - timeB[0];
    }

    return timeA[1] - timeB[1];
  });

  // Obtener lista única de doctores del centro médico seleccionado
  const doctorsList = (() => {
    if (!selectedClinicId) return [];

    // Filtrar citas que pertenecen al centro médico seleccionado
    const clinicAppointments = appointments.filter((appointment) => {
      return appointment.clinicId === selectedClinicId;
    });

    // Obtener doctores únicos de las citas del centro
    const doctors = Array.from(
      new Set(clinicAppointments.map((appointment) => appointment.doctor))
    );

    // Si es una secretaria, asegurar que no aparezca ella misma en la lista
    if (currentUser?.role === "secretary") {
      return doctors.filter((doctorName) => doctorName !== currentUser.name);
    }

    // Debug: mostrar información
    // Logs removidos para limpiar la consola

    return doctors;
  })();

  // Obtener lista única de tipos de cita
  const typesList = Array.from(
    new Set(appointments.map((appointment) => appointment.type))
  );

  const handlePrevDay = () => {
    if (date) {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() - 1);
      setDate(newDate);
    }
  };

  const handleNextDay = () => {
    if (date) {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 1);
      setDate(newDate);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "";

    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString("es-ES", options);
  };

  // Agrupar citas por fecha para la vista de lista
  const appointmentsByDate = sortedAppointments.reduce(
    (groups, appointment) => {
      // appointment.date ya viene parseado correctamente desde el hook
      const appointmentDate = appointment.date;

      const dateKey = format(appointmentDate, "yyyy-MM-dd");

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(appointment);
      return groups;
    },
    {} as Record<string, any[]>
  );

  return (
    <div className="flex flex-col gap-4 max-w-9xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Citas</h1>
          <p className="text-muted-foreground">
            Gestione su agenda y citas médicas
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild>
            <Link href="/dashboard/citas/nueva">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Cita
            </Link>
          </Button>
        </div>
      </div>

      {/* Filtros horizontales */}
      <Card className="col-span-full">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Doctor</label>
                <Select value={doctor} onValueChange={setDoctor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {doctorsList.map((doctor) => (
                      <SelectItem key={doctor} value={doctor}>
                        {doctor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Estado</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Confirmada">Confirmada</SelectItem>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                    <SelectItem value="Completada">Completada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {typesList.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex-1 min-w-[200px]">
                <label className="text-sm font-medium">Vista</label>
                <Select
                  value={view}
                  onValueChange={(value) =>
                    setView(value as "day" | "week" | "month")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Día</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por paciente, tipo o doctor..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contenido principal: citas a la izquierda, calendario a la derecha */}
      <div className="grid gap-4 md:grid-cols-[1fr_300px]">
        {/* Citas del día - Ahora a la izquierda */}
        <Card>
          <CardHeader className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>
                  Citas{" "}
                  {view === "day"
                    ? "del Día"
                    : view === "week"
                    ? "de la Semana"
                    : "del Mes"}
                </CardTitle>
                <CardDescription>
                  {date ? formatDate(date) : "Seleccione una fecha"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={handlePrevDay}>
                  <ChevronLeft className="h-4 w-4" />
                  <span className="sr-only">Día anterior</span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextDay}>
                  <ChevronRight className="h-4 w-4" />
                  <span className="sr-only">Día siguiente</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="px-4">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="lista" className="flex-1">
                    Lista
                  </TabsTrigger>
                  <TabsTrigger value="agenda" className="flex-1">
                    Agenda
                  </TabsTrigger>
                  <TabsTrigger value="turnos" className="flex-1">
                    Turnos
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="lista" className="m-0">
                <div className="space-y-4 p-4">
                  {Object.keys(appointmentsByDate).length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No hay citas programadas para este período
                      </p>
                    </div>
                  ) : (
                    Object.entries(appointmentsByDate).map(
                      ([dateKey, dateAppointments]) => (
                        <div key={dateKey} className="space-y-2">
                          <h3 className="font-medium text-sm text-muted-foreground">
                            {formatRelativeDate(
                              (() => {
                                const [year, month, day] = dateKey
                                  .split("-")
                                  .map(Number);
                                return new Date(
                                  year,
                                  month - 1,
                                  day,
                                  12,
                                  0,
                                  0,
                                  0
                                );
                              })()
                            )}
                          </h3>
                          <div className="space-y-2">
                            {(dateAppointments as any[]).map(
                              (appointment: any) => (
                                <div
                                  key={appointment.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 w-16 text-center">
                                      <span className="text-sm font-medium">
                                        {appointment.time}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {appointment.duration} min
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Avatar>
                                        <AvatarFallback className="text-sm font-medium">
                                          {getInitials(
                                            appointment.patient.name
                                          )}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <Link
                                          href={`/dashboard/pacientes/${appointment.patient.id}`}
                                          className="font-medium hover:underline"
                                        >
                                          {appointment.patient.name}
                                        </Link>
                                        <div className="text-sm text-muted-foreground">
                                          {appointment.type}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
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
                                    <div className="text-sm text-muted-foreground">
                                      {appointment.doctor}
                                    </div>
                                    <div className="flex gap-2">
                                      {appointment.status === "Pendiente" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={async () => {
                                            try {
                                              await updateAppointment(
                                                appointment.id,
                                                {
                                                  status: "Confirmada",
                                                  arrivalTimestamp:
                                                    new Date().toISOString(),
                                                }
                                              );
                                            } catch (error) {
                                              console.error(
                                                "Error al marcar llegada:",
                                                error
                                              );
                                            }
                                          }}
                                        >
                                          Llegó
                                        </Button>
                                      )}
                                      <Button variant="ghost" size="sm" asChild>
                                        <Link
                                          href={`/dashboard/citas/${appointment.id}`}
                                        >
                                          Ver
                                        </Link>
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="turnos" className="m-0">
                <div className="p-4">
                  <TurnosView date={date} />
                </div>
              </TabsContent>

              <TabsContent value="agenda" className="m-0">
                <div className="p-4">
                  <div className="space-y-1">
                    {/* Horas del día */}
                    {Array.from({ length: 12 }).map((_, index) => {
                      const hour = index + 8; // Empezar desde las 8 AM
                      const hourFormatted = `${
                        hour > 12 ? hour - 12 : hour
                      }:00 ${hour >= 12 ? "PM" : "AM"}`;

                      // Filtrar citas para esta hora
                      const hourAppointments = sortedAppointments.filter(
                        (appointment) => {
                          const [h, m] = appointment.time.split(":");
                          const isPM = appointment.time.includes("PM");
                          let appointmentHour = Number.parseInt(h);

                          if (isPM && appointmentHour !== 12) {
                            appointmentHour += 12;
                          } else if (!isPM && appointmentHour === 12) {
                            appointmentHour = 0;
                          }

                          return appointmentHour === hour;
                        }
                      );

                      return (
                        <div
                          key={hour}
                          className="grid grid-cols-[80px_1fr] gap-2"
                        >
                          <div className="text-sm text-muted-foreground py-2">
                            {hourFormatted}
                          </div>
                          <div className="border-l pl-4 py-2">
                            {hourAppointments.length > 0 ? (
                              <div className="space-y-2">
                                {hourAppointments.map((appointment) => (
                                  <Link
                                    key={appointment.id}
                                    href={`/dashboard/citas/${appointment.id}`}
                                    className="block p-2 rounded-md border bg-background hover:bg-accent/50 transition-colors"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div className="font-medium">
                                        {appointment.patient.name}
                                      </div>
                                      <Badge
                                        variant={
                                          appointment.status === "Confirmada"
                                            ? "default"
                                            : appointment.status === "Pendiente"
                                            ? "outline"
                                            : appointment.status ===
                                              "Completada"
                                            ? "secondary"
                                            : "destructive"
                                        }
                                      >
                                        {appointment.status}
                                      </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground flex justify-between">
                                      <span>{appointment.type}</span>
                                      <span>
                                        {appointment.time} (
                                        {appointment.duration} min)
                                      </span>
                                    </div>
                                  </Link>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Calendario - Ahora a la derecha */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="p-4">
              <CardTitle>Calendario</CardTitle>
              <CardDescription>
                Seleccione una fecha para ver las citas
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="border rounded-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4">
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total de citas:</span>
                  <span className="font-medium">
                    {filteredAppointments.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Confirmadas:</span>
                  <span className="font-medium">
                    {
                      filteredAppointments.filter(
                        (a) => a.status === "Confirmada"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pendientes:</span>
                  <span className="font-medium">
                    {
                      filteredAppointments.filter(
                        (a) => a.status === "Pendiente"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Completadas:</span>
                  <span className="font-medium">
                    {
                      filteredAppointments.filter(
                        (a) => a.status === "Completada"
                      ).length
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Canceladas:</span>
                  <span className="font-medium">
                    {
                      filteredAppointments.filter(
                        (a) => a.status === "Cancelada"
                      ).length
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
