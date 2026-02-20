"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/app-context";
import { useAuth } from "@/context/auth-context";
import { useRealClinics } from "@/hooks/useRealClinics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatDateToISO, cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getClinicDisplayName } from "@/lib/clinicDisplayNames";
import { apiClient } from "@/lib/api/client";
import { getAppointmentTypesForUser, AppointmentTypeConfig } from "@/lib/appointmentTypes";
import { useToast } from "@/hooks/use-toast";
import { SelectGroup, SelectLabel, SelectSeparator } from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";

// Función para formatear hora en formato 12h
const formatTime12Hour = (hour: number, minute: number) => {
  const period = hour < 12 ? 'AM' : 'PM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
};

// Generar horarios recomendados (cada 15 minutos)
const generateRecommendedTimeSlots = () => {
  const slots: string[] = [];
  
  // Mañana: 8:00 AM - 12:00 PM
  for (let hour = 8; hour < 12; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push(formatTime12Hour(hour, minute));
    }
  }
  
  // Tarde: 2:00 PM - 6:00 PM
  for (let hour = 14; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      slots.push(formatTime12Hour(hour, minute));
    }
  }
  
  return slots;
};

// Generar otros horarios (cada 5 minutos, excluyendo los recomendados)
const generateOtherTimeSlots = () => {
  const slots: string[] = [];
  const recommendedSlots = new Set(generateRecommendedTimeSlots());
  
  // Mañana: 8:00 AM - 12:00 PM
  for (let hour = 8; hour < 12; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const timeSlot = formatTime12Hour(hour, minute);
      if (!recommendedSlots.has(timeSlot)) {
        slots.push(timeSlot);
      }
    }
  }
  
  // Tarde: 2:00 PM - 6:00 PM
  for (let hour = 14; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const timeSlot = formatTime12Hour(hour, minute);
      if (!recommendedSlots.has(timeSlot)) {
        slots.push(timeSlot);
      }
    }
  }
  
  return slots;
};

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    patients,
    addAppointment,
    selectedClinicId,
    currentUser,
    appointments,
  } = useAppContext();
  const { user } = useAuth();
  const hasMultiClinicView = user?.multiClinicView && (user?.role === "doctor" || user?.role === "secretary");
  const { clinics } = useRealClinics();
  const { toast } = useToast();

  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState<string>("8:00 AM");
  const [duration, setDuration] = useState<string>("30");
  const [type, setType] = useState<string>("Consulta General");
  const [status] = useState<string>("Pendiente"); // Estado fijo, no editable
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedFormClinicId, setSelectedFormClinicId] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentTypeConfig[]>([]);
  const [patientComboboxOpen, setPatientComboboxOpen] = useState(false);
  const [patientSearchValue, setPatientSearchValue] = useState("");

  // Generar slots de horarios
  const recommendedTimeSlots = generateRecommendedTimeSlots();
  const otherTimeSlots = generateOtherTimeSlots();

  // Filtrar pacientes para el combobox
  const filteredPatients = patients.filter(patient => {
    if (!patientSearchValue) return true;
    const searchLower = patientSearchValue.toLowerCase();
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      (patient.email && patient.email.toLowerCase().includes(searchLower)) ||
      (patient.phone && patient.phone.toLowerCase().includes(searchLower))
    );
  });



  // Obtener tipos de citas según el usuario y clínica
  useEffect(() => {
    const activeClinicId = hasMultiClinicView
      ? selectedFormClinicId
      : selectedClinicId;
    
    const types = getAppointmentTypesForUser(user?.email || null, activeClinicId);
    setAppointmentTypes(types);
    
    // Si el tipo actual no está en los nuevos tipos, usar el primero disponible
    if (types.length > 0 && !types.find(t => t.value === type)) {
      setType(types[0].value);
    }
  }, [user?.email, selectedClinicId, selectedFormClinicId, hasMultiClinicView]);

  // Cargar doctores (rol doctor) cuando cambie la clínica
  useEffect(() => {
    const activeClinicId = hasMultiClinicView
      ? selectedFormClinicId
      : selectedClinicId;
    if (activeClinicId && (currentUser?.role === "secretary" || currentUser?.role === "admin" || currentUser?.role === "doctor")) {
      loadAvailableDoctors(activeClinicId);
    }
  }, [
    selectedClinicId,
    selectedFormClinicId,
    hasMultiClinicView,
    currentUser?.role,
  ]);

  // Función para cargar doctores disponibles
  const loadAvailableDoctors = async (clinicId: string) => {
    try {
      const clinicUsers = (await apiClient.getClinicUsers(clinicId)) as any[];
      const doctors = clinicUsers.filter(
        (user: any) => user.user_role === "doctor"
      );
      setAvailableDoctors(doctors);

      // Si solo hay un doctor, seleccionarlo automáticamente
      if (doctors.length === 1) {
        setSelectedDoctor(doctors[0].user_id);
      } else if (currentUser?.role === "doctor" && doctors.some((d: any) => d.user_id === currentUser.id)) {
        // Si el usuario es doctor, preseleccionarse
        setSelectedDoctor(currentUser.id);
      }
    } catch (error) {
      setAvailableDoctors([]);
    }
  };

  // Función para obtener el doctor correcto para la cita
  const getDoctorForAppointment = async () => {
    // Si hay doctor seleccionado en el formulario, usarlo
    if (selectedDoctor) {
      return selectedDoctor;
    }

    // Si el usuario es doctor, usar su ID
    if (currentUser?.role === "doctor") {
      return currentUser.id;
    }

    // Fallback: primer doctor disponible
    if (availableDoctors.length > 0) {
      return availableDoctors[0].user_id;
    }

    return currentUser?.id || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!selectedPatient) {
      alert("Por favor, seleccione un paciente");
      return;
    }

    // Validar clínica para usuarios con vista unificada
    if (hasMultiClinicView && !selectedFormClinicId) {
      alert("Debe seleccionar un centro médico para la cita");
      return;
    }

    const patientData = patients.find((p) => p.id === selectedPatient);

    if (!patientData) {
      alert("Paciente no encontrado");
      return;
    }

    // Convertir tiempo de formato 12h a 24h
    const convertTo24Hour = (time12h: string) => {
      const [time, modifier] = time12h.split(" ");
      let [hours, minutes] = time.split(":");
      if (hours === "12") {
        hours = "00";
      }
      if (modifier === "PM") {
        hours = (parseInt(hours, 10) + 12).toString();
      }
      return `${hours}:${minutes}`;
    };

    // Formatear fecha y hora para el backend
    // SOLUCIÓN DEFINITIVA: Usar el método 3 que funciona correctamente
    // Usar toISOString().split('T')[0] para evitar problemas de zona horaria
    // CORRECCIÓN: Usar métodos locales para evitar problemas de zona horaria
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const appointmentDate = `${year}-${month}-${day}`;
    const appointmentTime = convertTo24Hour(time);

    // Obtener el doctor correcto
    const doctorId = await getDoctorForAppointment();

    const newAppointment = {
      patientId: patientData.id,
      clinicId: hasMultiClinicView ? selectedFormClinicId : selectedClinicId!,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      reason: reason || type,
      notes: notes,
      status: status,
      type: type,
      doctor_id: doctorId,
      duration: Number.parseInt(duration),
    };

    try {
      await addAppointment(newAppointment);
      
      toast({
        title: "Cita creada exitosamente",
        description: `Cita agendada para ${patientData.name} el ${format(date, "PPP", { locale: es })} a las ${time}`,
      });
      
      // Navegación de retorno según parámetro
      const returnTo = searchParams.get('returnTo')
      if (returnTo === 'historia-clinica') {
        const recordId = searchParams.get('recordId')
        router.push(`/dashboard/historia-clinica/${recordId}`)
      } else if (returnTo === 'facturacion') {
        const invoiceId = searchParams.get('invoiceId')
        router.push(`/dashboard/facturacion/${invoiceId}`)
      } else if (returnTo === 'pacientes') {
        router.push("/dashboard/pacientes")
      } else if (returnTo === 'paciente') {
        const patientId = searchParams.get('patientId')
        router.push(`/dashboard/pacientes/${patientId}`)
      } else {
        router.push("/dashboard/citas");
      }
    } catch (error) {
      toast({
        title: "Error al crear la cita",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            const returnTo = searchParams.get('returnTo')
            if (returnTo === 'historia-clinica') {
              const recordId = searchParams.get('recordId')
              router.push(`/dashboard/historia-clinica/${recordId}`)
            } else if (returnTo === 'facturacion') {
              const invoiceId = searchParams.get('invoiceId')
              router.push(`/dashboard/facturacion/${invoiceId}`)
            } else if (returnTo === 'pacientes') {
              router.push("/dashboard/pacientes")
            } else if (returnTo === 'paciente') {
              const patientId = searchParams.get('patientId')
              router.push(`/dashboard/pacientes/${patientId}`)
            } else {
              router.push("/dashboard/citas")
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Nueva Cita</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Paciente</CardTitle>
            <CardDescription>
              Seleccione el paciente para la cita
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campo selector de clínica para usuarios con vista unificada */}
            {hasMultiClinicView && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Label
                  htmlFor="clinic-selector"
                  className="text-sm font-medium text-blue-800"
                >
                  Centro Médico donde agendar la cita{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={selectedFormClinicId}
                  onValueChange={setSelectedFormClinicId}
                >
                  <SelectTrigger
                    className={`mt-2 ${errors.clinic ? "border-red-500" : ""}`}
                  >
                    <SelectValue placeholder="Seleccionar centro médico..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem
                        key={clinic.clinic_id}
                        value={clinic.clinic_id}
                      >
                        {getClinicDisplayName(user?.email || "", clinic)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clinic && (
                  <p className="text-sm text-red-500 mt-1">{errors.clinic}</p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="patient">Paciente</Label>
              <Popover open={patientComboboxOpen} onOpenChange={setPatientComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={patientComboboxOpen}
                    className="w-full justify-between h-10"
                  >
                    {selectedPatient ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={patients.find(p => p.id === selectedPatient)?.image} />
                          <AvatarFallback>
                            {patients.find(p => p.id === selectedPatient)?.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{patients.find(p => p.id === selectedPatient)?.name}</span>
                      </div>
                    ) : (
                      "Seleccionar paciente..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[300px] p-0" align="start">
                  <div className="border-b px-3 py-2">
                    <input
                      type="text"
                      placeholder="Buscar paciente..."
                      className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                      value={patientSearchValue}
                      onChange={(e) => setPatientSearchValue(e.target.value)}
                    />
                  </div>
                  <div className="max-h-[200px] overflow-y-auto">
                    {filteredPatients.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {patientSearchValue ? "No se encontraron pacientes." : "No hay pacientes disponibles."}
                      </div>
                    ) : (
                      filteredPatients.map((patient) => (
                        <div
                          key={patient.id}
                          className="flex items-center gap-2 w-full p-2 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedPatient(patient.id);
                            setPatientComboboxOpen(false);
                            setPatientSearchValue("");
                          }}
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={patient.image} />
                            <AvatarFallback>
                              {patient.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col text-left flex-1">
                            <span className="font-medium">{patient.name}</span>
                            {(patient.email || patient.phone) && (
                              <span className="text-xs text-muted-foreground">
                                {patient.email || patient.phone}
                              </span>
                            )}
                          </div>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              selectedPatient === patient.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Selector de doctor - usuarios con rol doctor en la clínica */}
            {(currentUser?.role === "secretary" || currentUser?.role === "admin" || currentUser?.role === "doctor") &&
              availableDoctors.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="doctor">Doctor</Label>
                  <Select
                    value={selectedDoctor}
                    onValueChange={setSelectedDoctor}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDoctors.map((doctor) => (
                        <SelectItem key={doctor.user_id} value={doctor.user_id}>
                          {doctor.user_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Cita</CardTitle>
            <CardDescription>
              Configure la fecha, hora y tipo de cita
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? (
                      format(date, "PPP", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="time">Hora</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar hora" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectGroup>
                      <SelectLabel>Horarios Recomendados ⭐</SelectLabel>
                      {recommendedTimeSlots.map((timeSlot) => (
                        <SelectItem key={timeSlot} value={timeSlot}>
                          {timeSlot}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <SelectSeparator />
                    <SelectGroup>
                      <SelectLabel>Otros Horarios</SelectLabel>
                      {otherTimeSlots.map((timeSlot) => (
                        <SelectItem key={timeSlot} value={timeSlot}>
                          {timeSlot}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duración (min)</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Duración" />
                  </SelectTrigger>
                  <SelectContent>
                    {["15", "30", "45", "60"].map((dur) => (
                      <SelectItem key={dur} value={dur}>
                        {dur} minutos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Cita</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((appointmentType) => (
                      <SelectItem key={appointmentType.value} value={appointmentType.value}>
                        {appointmentType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>



            <div className="space-y-2">
              <Label htmlFor="reason">Motivo de la consulta</Label>
              <Textarea
                id="reason"
                placeholder="Describe el motivo de la cita..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Añadir notas sobre la cita..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" asChild>
            <Link href="/dashboard/citas">Cancelar</Link>
          </Button>
          <Button type="submit">Crear Cita</Button>
        </div>
      </form>
    </div>
  );
}
