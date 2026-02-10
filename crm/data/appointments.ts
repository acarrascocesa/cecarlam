import type { Appointment } from "@/context/app-context"

export const initialAppointments: Appointment[] = [
  // Citas de la Clínica Abreu (Dr. Luis)
  {
    id: "1",
    patient: {
      id: "luis_abreu_1",
      name: "María González",
      image: "/woman-face-2.png"
    },
    date: "2024-07-30",
    time: "09:00",
    duration: 30,
    status: "Confirmada",
    type: "Consulta General",
    doctor: "Dr. Luis Arturo Castillo Roa",
    notes: "Control de hipertensión. Revisar medicación.",
    reason: "Control rutinario",
    clinicId: "clinic_abreu"
  },
  {
    id: "2",
    patient: {
      id: "luis_abreu_2",
      name: "Juan Carlos Rodríguez",
      image: "/man-face.png"
    },
    date: "2024-07-30",
    time: "10:30",
    duration: 45,
    status: "Confirmada",
    type: "Consulta Especializada",
    doctor: "Dr. Luis Arturo Castillo Roa",
    notes: "Control de diabetes. Revisar niveles de glucosa.",
    reason: "Control diabético",
    clinicId: "clinic_abreu"
  },
  // Citas de Corazones Unidos (Dr. Luis)
  {
    id: "3",
    patient: {
      id: "luis_elohim_1",
      name: "Roberto Antonio Martínez",
      image: "/man-face-2.png"
    },
    date: "2024-07-31",
    time: "08:00",
    duration: 60,
    status: "Confirmada",
    type: "Consulta Especializada",
    doctor: "Dr. Luis Arturo Castillo Roa",
    notes: "Evaluación de artritis. Posible cambio de medicación.",
    reason: "Dolor articular",
    clinicId: "clinic_elohim"
  },
  // Citas de la Clínica de Inmunología (Dra. Linda)
  {
    id: "4",
    patient: {
      id: "linda_clinic1_1",
      name: "Ana Sofía López",
      image: "/woman-face-4.png"
    },
    date: "2024-07-31",
    time: "11:00",
    duration: 30,
    status: "Confirmada",
    type: "Consulta General",
    doctor: "Dra. Linda Flor Medina L.",
    notes: "Control de asma. Revisar uso de inhalador.",
    reason: "Control asmático",
    clinicId: "clinic_linda_1"
  },
  {
    id: "5",
    patient: {
      id: "linda_clinic1_2",
      name: "Carlos Enrique Ramírez",
      image: "/man-face-4.png"
    },
    date: "2024-08-02",
    time: "10:00",
    duration: 30,
    status: "Pendiente",
    type: "Consulta General",
    doctor: "Dra. Linda Flor Medina L.",
    notes: "Control de rinitis alérgica. Revisar tratamiento.",
    reason: "Rinitis alérgica",
    clinicId: "clinic_linda_1"
  },
  // Citas del Centro de Alergias (Dra. Linda)
  {
    id: "6",
    patient: {
      id: "linda_alergias_1",
      name: "Luis Miguel Fernández",
      image: "/man-face-3.png"
    },
    date: "2024-08-01",
    time: "09:30",
    duration: 45,
    status: "Pendiente",
    type: "Consulta Especializada",
    doctor: "Dra. Linda Flor Medina L.",
    notes: "Evaluación de migrañas. Posible derivación a neurología.",
    reason: "Migrañas frecuentes",
    clinicId: "linda_2"
  },
  // Citas futuras
  {
    id: "7",
    patient: {
      id: "luis_abreu_1",
      name: "María González",
      image: "/woman-face-2.png"
    },
    date: "2024-08-05",
    time: "16:00",
    duration: 30,
    status: "Pendiente",
    type: "Consulta General",
    doctor: "Dr. Luis Arturo Castillo Roa",
    notes: "Seguimiento de hipertensión.",
    reason: "Seguimiento",
    clinicId: "luis_1"
  },
  {
    id: "8",
    patient: {
      id: "luis_abreu_2",
      name: "Juan Carlos Rodríguez",
      image: "/man-face.png"
    },
    date: "2024-08-06",
    time: "08:30",
    duration: 45,
    status: "Pendiente",
    type: "Consulta Especializada",
    doctor: "Dr. Luis Arturo Castillo Roa",
    notes: "Control diabético. Revisar hemoglobina glicosilada.",
    reason: "Control diabético",
    clinicId: "luis_1"
  }
] 