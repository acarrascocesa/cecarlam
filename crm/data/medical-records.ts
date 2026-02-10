import type { MedicalRecord } from "@/context/app-context"

export const initialMedicalRecords: MedicalRecord[] = [
  // Historiales de la Clínica Abreu (Dr. Luis)
  {
    id: "1",
    patient: {
      id: "luis_abreu_1",
      name: "María González",
      image: "/woman-face-2.png"
    },
    date: "2024-07-15",
    doctor: "Dr. Luis Arturo Castillo Roa",
    type: "Consulta General",
    diagnosis: "Hipertensión arterial controlada",
    status: "Completo",
    notes: "Paciente presenta presión arterial 130/85 mmHg. Medicación actual: Losartán 50mg diario. Se mantiene control estable.",
    prescriptions: [
      {
        medication: "Losartán",
        dosage: "50mg",
        frequency: "1 vez al día",
        duration: "Continuar indefinidamente"
      }
    ],
    attachments: [
      {
        name: "Electrocardiograma",
        type: "ECG",
        url: "#"
      }
    ],
    clinicId: "luis_1"
  },
  {
    id: "2",
    patient: {
      id: "luis_abreu_2",
      name: "Juan Carlos Rodríguez",
      image: "/man-face.png"
    },
    date: "2024-07-20",
    doctor: "Dr. Luis Arturo Castillo Roa",
    type: "Consulta Especializada",
    diagnosis: "Diabetes mellitus tipo 2",
    status: "Completo",
    notes: "Glucosa en ayunas: 95 mg/dL. Hemoglobina glicosilada: 6.2%. Control metabólico adecuado.",
    prescriptions: [
      {
        medication: "Metformina",
        dosage: "500mg",
        frequency: "2 veces al día",
        duration: "Continuar indefinidamente"
      },
      {
        medication: "Glimepirida",
        dosage: "1mg",
        frequency: "1 vez al día",
        duration: "Continuar indefinidamente"
      }
    ],
    attachments: [
      {
        name: "Perfil lipídico",
        type: "Laboratorio",
        url: "#"
      }
    ],
    clinicId: "luis_1"
  },
  // Historiales de Corazones Unidos (Dr. Luis)
  {
    id: "3",
    patient: {
      id: "luis_corazones_1",
      name: "Roberto Antonio Martínez",
      image: "/man-face-2.png"
    },
    date: "2024-07-18",
    doctor: "Dr. Luis Arturo Castillo Roa",
    type: "Consulta Especializada",
    diagnosis: "Artritis reumatoide",
    status: "Completo",
    notes: "Paciente refiere dolor articular en manos y rodillas. Factor reumatoide positivo. Inicio de tratamiento con metotrexato.",
    prescriptions: [
      {
        medication: "Metotrexato",
        dosage: "10mg",
        frequency: "1 vez por semana",
        duration: "3 meses"
      },
      {
        medication: "Ácido fólico",
        dosage: "5mg",
        frequency: "1 vez por semana",
        duration: "3 meses"
      }
    ],
    attachments: [
      {
        name: "Radiografía de manos",
        type: "Radiografía",
        url: "#"
      }
    ],
    clinicId: "luis_2"
  },
  // Historiales de la Clínica de Inmunología (Dra. Linda)
  {
    id: "4",
    patient: {
      id: "linda_inmuno_1",
      name: "Ana Sofía López",
      image: "/woman-face-4.png"
    },
    date: "2024-07-22",
    doctor: "Dra. Linda Flor Medina L.",
    type: "Consulta General",
    diagnosis: "Asma bronquial",
    status: "Completo",
    notes: "Paciente presenta sibilancias ocasionales. Espirometría: FEV1 85% del predicho. Control adecuado con broncodilatador.",
    prescriptions: [
      {
        medication: "Salbutamol",
        dosage: "100mcg",
        frequency: "2 inhalaciones cada 4-6 horas según necesidad",
        duration: "Continuar según necesidad"
      }
    ],
    attachments: [
      {
        name: "Espirometría",
        type: "Prueba funcional",
        url: "#"
      }
    ],
    clinicId: "linda_1"
  },
  {
    id: "5",
    patient: {
      id: "linda_inmuno_2",
      name: "Carlos Enrique Ramírez",
      image: "/man-face-4.png"
    },
    date: "2024-07-19",
    doctor: "Dra. Linda Flor Medina L.",
    type: "Consulta General",
    diagnosis: "Rinitis alérgica",
    status: "Completo",
    notes: "Paciente presenta rinorrea, estornudos y congestión nasal. Pruebas cutáneas positivas para polen y ácaros.",
    prescriptions: [
      {
        medication: "Cetirizina",
        dosage: "10mg",
        frequency: "1 vez al día",
        duration: "Durante la temporada alérgica"
      },
      {
        medication: "Fluticasona nasal",
        dosage: "50mcg",
        frequency: "2 inhalaciones en cada fosa nasal, 1 vez al día",
        duration: "Durante la temporada alérgica"
      }
    ],
    attachments: [
      {
        name: "Pruebas cutáneas",
        type: "Alergología",
        url: "#"
      }
    ],
    clinicId: "linda_1"
  },
  // Historiales del Centro de Alergias (Dra. Linda)
  {
    id: "6",
    patient: {
      id: "linda_alergias_1",
      name: "Luis Miguel Fernández",
      image: "/man-face-3.png"
    },
    date: "2024-07-16",
    doctor: "Dra. Linda Flor Medina L.",
    type: "Consulta Especializada",
    diagnosis: "Migraña sin aura",
    status: "Completo",
    notes: "Paciente refiere cefalea pulsátil unilateral de 2-3 días de duración. Sin síntomas neurológicos focales.",
    prescriptions: [
      {
        medication: "Sumatriptán",
        dosage: "50mg",
        frequency: "1 tableta al inicio del dolor",
        duration: "Según necesidad"
      },
      {
        medication: "Ibuprofeno",
        dosage: "400mg",
        frequency: "Cada 6-8 horas según dolor",
        duration: "Según necesidad"
      }
    ],
    attachments: [],
    clinicId: "linda_2"
  }
] 