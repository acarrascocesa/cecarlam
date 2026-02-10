import type { Reference } from "@/context/app-context"

export const initialReferences: Reference[] = [
  // Referencias de la Clínica Abreu (Dr. Luis)
  {
    id: "1",
    patient: {
      id: "luis_abreu_1",
      name: "María González",
      image: "/woman-face-2.png"
    },
    date: "2024-07-20",
    specialist: "Dr. Carlos Mendoza",
    specialty: "Cardiología",
    hospital: "Centro Cardiovascular",
    status: "Pendiente",
    priority: "Normal",
    reason: "Evaluación cardiológica por hipertensión arterial",
    clinicId: "luis_1"
  },
  {
    id: "2",
    patient: {
      id: "luis_abreu_2",
      name: "Juan Carlos Rodríguez",
      image: "/man-face.png"
    },
    date: "2024-07-22",
    specialist: "Dra. Ana Martínez",
    specialty: "Endocrinología",
    hospital: "Hospital General",
    status: "En proceso",
    priority: "Alta",
    reason: "Control especializado de diabetes mellitus tipo 2",
    clinicId: "luis_1"
  },
  // Referencias de Corazones Unidos (Dr. Luis)
  {
    id: "3",
    patient: {
      id: "luis_corazones_1",
      name: "Roberto Antonio Martínez",
      image: "/man-face-2.png"
    },
    date: "2024-07-19",
    specialist: "Dr. Roberto Sánchez",
    specialty: "Reumatología",
    hospital: "Instituto de Reumatología",
    status: "Completada",
    priority: "Alta",
    reason: "Evaluación y tratamiento de artritis reumatoide",
    clinicId: "luis_2"
  },
  // Referencias de la Clínica de Inmunología (Dra. Linda)
  {
    id: "4",
    patient: {
      id: "linda_inmuno_1",
      name: "Ana Sofía López",
      image: "/woman-face-4.png"
    },
    date: "2024-07-23",
    specialist: "Dr. Miguel Torres",
    specialty: "Neumología",
    hospital: "Centro Respiratorio",
    status: "Pendiente",
    priority: "Normal",
    reason: "Evaluación neumológica por asma bronquial",
    clinicId: "linda_1"
  },
  {
    id: "5",
    patient: {
      id: "linda_inmuno_2",
      name: "Carlos Enrique Ramírez",
      image: "/man-face-4.png"
    },
    date: "2024-07-21",
    specialist: "Dra. Patricia López",
    specialty: "Alergología",
    hospital: "Centro de Alergias",
    status: "Completada",
    priority: "Normal",
    reason: "Pruebas cutáneas y evaluación alergológica",
    clinicId: "linda_1"
  },
  // Referencias del Centro de Alergias (Dra. Linda)
  {
    id: "6",
    patient: {
      id: "linda_alergias_1",
      name: "Luis Miguel Fernández",
      image: "/man-face-3.png"
    },
    date: "2024-07-18",
    specialist: "Dr. José García",
    specialty: "Neurología",
    hospital: "Instituto Neurológico",
    status: "En proceso",
    priority: "Alta",
    reason: "Evaluación neurológica por migrañas frecuentes",
    clinicId: "linda_2"
  }
]
