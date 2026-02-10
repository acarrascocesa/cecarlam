"use client";

import { useEffect, useState, use } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/context/app-context";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Edit, Trash, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
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
} from "@/components/ui/alert-dialog";

export default function AppointmentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    appointments,
    updateAppointment,
    deleteAppointment,
    addMedicalRecord,
    addNotification,
    selectedClinicId,
  } = useAppContext();
  const [appointment, setAppointment] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (id) {
      const foundAppointment = appointments.find((a) => a.id === id);
      if (foundAppointment) {
        setAppointment(foundAppointment);
        setStatus(foundAppointment.status);
        setNotes(foundAppointment.notes || "");
      }
    }
  }, [id, appointments]);

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold">Cita no encontrada</h1>
        <p className="text-muted-foreground">
          La cita que estás buscando no existe o ha sido eliminada.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/citas">Volver a citas</Link>
        </Button>
      </div>
    );
  }

  const handleSaveChanges = () => {
    updateAppointment(appointment.id, {
      status: status as "Confirmada" | "Pendiente" | "Cancelada" | "Completada",
      notes,
    });
    setIsEditing(false);
  };

  const handleDeleteAppointment = () => {
    deleteAppointment(appointment.id);
    router.push("/dashboard/citas");
  };

  const handleCreateMedicalRecord = async () => {
    if (!selectedClinicId) {
      addNotification({
        type: "error",
        title: "Error",
        message: "No se ha seleccionado una clínica",
      });
      return;
    }

    try {
      const newRecord = {
        patient_id: appointment.patient.id,
        clinic_id: selectedClinicId,
        record_date: appointment.appointment_date,
        record_type: "Consulta General",
        diagnosis: appointment.reason || "Consulta programada",
        status: "Completo",
        notes:
          appointment.notes ||
          `Cita completada el ${new Date().toLocaleDateString()}. ${
            appointment.reason || ""
          }`,
      };

      await addMedicalRecord(newRecord);

      addNotification({
        type: "success",
        title: "Éxito",
        message: "Registro médico creado correctamente",
      });

      // Redirigir al registro médico creado
      router.push("/dashboard/historia-clinica");
    } catch (error) {
      console.error("Error creando registro médico:", error);
      addNotification({
        type: "error",
        title: "Error",
        message: "Error al crear el registro médico",
      });
    }
  };

  const formatAppointmentDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (!isValid(dateObj)) return "Fecha inválida";
    return format(dateObj, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <div className="flex flex-col gap-6 max-w-9xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/citas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Detalles de la Cita
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Información de la Cita</CardTitle>
                <CardDescription>
                  Detalles sobre la cita programada
                </CardDescription>
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
                className="ml-auto"
              >
                {appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha</p>
                <p className="font-medium">
                  {formatAppointmentDate(appointment.date)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hora</p>
                <p className="font-medium">
                  {appointment.time} ({appointment.duration} minutos)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-2 rounded-full">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Doctor</p>
                <p className="font-medium">{appointment.doctor}</p>
              </div>
            </div>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Tipo de Cita</p>
              <Badge variant="outline">{appointment.type}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Motivo de la Cita</p>
              <p className="text-sm text-muted-foreground">
                {appointment.reason || "No especificado"}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              <Edit className="mr-2 h-4 w-4" />
              {isEditing ? "Cancelar Edición" : "Editar Cita"}
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Eliminar Cita
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará
                    permanentemente la cita del sistema.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAppointment}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Paciente</CardTitle>
              <CardDescription>Información del paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={appointment.patient.image || "/placeholder.svg"}
                    alt={appointment.patient.name}
                  />
                  <AvatarFallback>
                    {appointment.patient.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link
                    href={`/dashboard/pacientes/${appointment.patient.id}`}
                    className="text-lg font-medium hover:underline"
                  >
                    {appointment.patient.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    ID: {appointment.patient.id}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <Link href={`/dashboard/pacientes/${appointment.patient.id}`}>
                  Ver Perfil del Paciente
                </Link>
              </Button>
              {appointment.status === "Completada" && (
                <Button
                  onClick={handleCreateMedicalRecord}
                  className="flex-1"
                  variant="default"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Crear Registro Médico
                </Button>
              )}
            </CardFooter>
          </Card>

          {isEditing ? (
            <Card>
              <CardHeader>
                <CardTitle>Editar Cita</CardTitle>
                <CardDescription>
                  Actualice el estado y las notas de la cita
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Estado de la Cita
                  </label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Confirmada">Confirmada</SelectItem>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Cancelada">Cancelada</SelectItem>
                      <SelectItem value="Completada">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notas</label>
                  <Textarea
                    placeholder="Añadir notas sobre la cita..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={5}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveChanges} className="w-full">
                  Guardar Cambios
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Notas</CardTitle>
                <CardDescription>
                  Notas adicionales sobre la cita
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {appointment.notes ||
                    "No hay notas disponibles para esta cita."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
