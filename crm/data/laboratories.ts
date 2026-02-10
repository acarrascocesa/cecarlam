import type { Laboratory } from "@/context/app-context"

export const initialLaboratories: Laboratory[] = [
  // Laboratorios de la Clínica Abreu (Dr. Luis)
  {
    id: "1",
    name: "Laboratorio Clínico Abreu",
    logo: "/placeholder.svg?key=abreu",
    status: "Conectado",
    lastSync: "2024-07-29 10:30",
    apiKey: "abreu_api_key_123",
    pendingResults: 3,
    clinicId: "luis_1"
  },
  {
    id: "2",
    name: "Centro de Diagnóstico Integral",
    logo: "/placeholder.svg?key=cdi",
    status: "Conectado",
    lastSync: "2024-07-29 09:15",
    apiKey: "cdi_api_key_456",
    pendingResults: 1,
    clinicId: "luis_1"
  },
  // Laboratorios de Corazones Unidos (Dr. Luis)
  {
    id: "3",
    name: "Laboratorio Especializado en Cardiología",
    logo: "/placeholder.svg?key=cardio",
    status: "Conectado",
    lastSync: "2024-07-29 11:45",
    apiKey: "cardio_api_key_789",
    pendingResults: 2,
    clinicId: "luis_2"
  },
  // Laboratorios de la Clínica de Inmunología (Dra. Linda)
  {
    id: "4",
    name: "Laboratorio de Inmunología Avanzada",
    logo: "/placeholder.svg?key=immuno",
    status: "Conectado",
    lastSync: "2024-07-29 08:20",
    apiKey: "immuno_api_key_101",
    pendingResults: 4,
    clinicId: "linda_1"
  },
  {
    id: "5",
    name: "Centro de Alergias y Pruebas Especializadas",
    logo: "/placeholder.svg?key=allergy",
    status: "Pendiente",
    lastSync: "2024-07-28 16:30",
    apiKey: "allergy_api_key_202",
    pendingResults: 0,
    clinicId: "linda_1"
  },
  // Laboratorios del Centro de Alergias (Dra. Linda)
  {
    id: "6",
    name: "Laboratorio de Alergias y Asma",
    logo: "/placeholder.svg?key=asthma",
    status: "Conectado",
    lastSync: "2024-07-29 12:00",
    apiKey: "asthma_api_key_303",
    pendingResults: 1,
    clinicId: "linda_2"
  }
]
