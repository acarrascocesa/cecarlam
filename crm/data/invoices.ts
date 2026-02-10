import type { Invoice } from "@/context/app-context"

export const initialInvoices: Invoice[] = [
  // Facturas de la Clínica Abreu (Dr. Luis)
  {
    id: "1",
    patient: {
      id: "luis_abreu_1",
      name: "María González",
      image: "/woman-face-2.png"
    },
    date: "2024-07-15",
    doctor: "Dr. Luis Arturo Castillo Roa",
    clinicId: "luis_1",
    totalServices: 2500,
    insuranceCovers: 2000,
    patientPays: 500,
    insurance: {
      provider: "ARS Humano",
      policyNumber: "HUM-2024-001234",
      coverageVerified: true,
      verifiedBy: "Loreleiby Peguero",
      verifiedDate: "2024-07-15",
      notes: "ARS cubre 80% de consulta y 100% de ECG"
    },
    items: [
      {
        description: "Consulta General",
        amount: 1500,
        insuranceCovers: 1200,
        patientPays: 300
      },
      {
        description: "Electrocardiograma",
        amount: 1000,
        insuranceCovers: 800,
        patientPays: 200
      }
    ],
    status: "Pagada",
    paymentMethod: "Tarjeta de crédito",
    paymentDate: "2024-07-15",
    notes: "Pago completo realizado en la consulta"
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
    clinicId: "luis_1",
    totalServices: 3200,
    insuranceCovers: 2560,
    patientPays: 640,
    insurance: {
      provider: "ARS Universal",
      policyNumber: "UNI-2024-005678",
      coverageVerified: true,
      verifiedBy: "Loreleiby Peguero",
      verifiedDate: "2024-07-20",
      notes: "ARS cubre 80% de consulta especializada y 80% de laboratorio"
    },
    items: [
      {
        description: "Consulta Especializada",
        amount: 2000,
        insuranceCovers: 1600,
        patientPays: 400
      },
      {
        description: "Perfil lipídico",
        amount: 1200,
        insuranceCovers: 960,
        patientPays: 240
      }
    ],
    status: "Pagada",
    paymentMethod: "Efectivo",
    paymentDate: "2024-07-20",
    notes: "Pago en efectivo"
  },
  // Facturas de Corazones Unidos (Dr. Luis)
  {
    id: "3",
    patient: {
      id: "luis_corazones_1",
      name: "Roberto Antonio Martínez",
      image: "/man-face-2.png"
    },
    date: "2024-07-18",
    doctor: "Dr. Luis Arturo Castillo Roa",
    clinicId: "luis_2",
    totalServices: 4500,
    insuranceCovers: 3150,
    patientPays: 1350,
    insurance: {
      provider: "ARS Monumental",
      policyNumber: "MON-2024-009012",
      coverageVerified: true,
      verifiedBy: "Loreleiby Peguero",
      verifiedDate: "2024-07-18",
      notes: "ARS cubre 70% de consulta especializada, 80% de radiografía, 60% de análisis"
    },
    items: [
      {
        description: "Consulta Especializada",
        amount: 2000,
        insuranceCovers: 1400,
        patientPays: 600
      },
      {
        description: "Radiografía de manos",
        amount: 1500,
        insuranceCovers: 1200,
        patientPays: 300
      },
      {
        description: "Análisis de factor reumatoide",
        amount: 1000,
        insuranceCovers: 550,
        patientPays: 450
      }
    ],
    status: "Pendiente",
    notes: "Pendiente de pago por parte del paciente"
  },
  // Facturas de la Clínica de Inmunología (Dra. Linda)
  {
    id: "4",
    patient: {
      id: "linda_inmuno_1",
      name: "Ana Sofía López",
      image: "/woman-face-4.png"
    },
    date: "2024-07-22",
    doctor: "Dra. Linda Flor Medina L.",
    clinicId: "linda_1",
    totalServices: 2800,
    insuranceCovers: 1500,
    patientPays: 1300,
    insurance: {
      provider: "ARS Humano",
      policyNumber: "HUM-2024-003456",
      coverageVerified: true,
      verifiedBy: "Loreleiby Peguero",
      verifiedDate: "2024-07-22",
      notes: "ARS cubre 100% de consulta, 0% de espirometría (no cubierta)"
    },
    items: [
      {
        description: "Consulta General",
        amount: 1500,
        insuranceCovers: 1500,
        patientPays: 0
      },
      {
        description: "Espirometría",
        amount: 1300,
        insuranceCovers: 0,
        patientPays: 1300
      }
    ],
    status: "Parcial",
    paymentMethod: "Transferencia bancaria",
    paymentDate: "2024-07-22",
    notes: "Pago parcial de RD$ 1,500. Pendiente RD$ 1,300"
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
    clinicId: "linda_1",
    totalServices: 3500,
    insuranceCovers: 2800,
    patientPays: 700,
    insurance: {
      provider: "ARS Monumental",
      policyNumber: "MON-2024-007890",
      coverageVerified: true,
      verifiedBy: "Loreleiby Peguero",
      verifiedDate: "2024-07-19",
      notes: "ARS cubre 80% de consulta y 80% de pruebas de alergia"
    },
    items: [
      {
        description: "Consulta General",
        amount: 1500,
        insuranceCovers: 1200,
        patientPays: 300
      },
      {
        description: "Pruebas cutáneas de alergia",
        amount: 2000,
        insuranceCovers: 1600,
        patientPays: 400
      }
    ],
    status: "Pagada",
    paymentMethod: "Cheque",
    paymentDate: "2024-07-19",
    notes: "Cheque recibido y depositado"
  },
  // Facturas del Centro de Alergias (Dra. Linda)
  {
    id: "6",
    patient: {
      id: "linda_alergias_1",
      name: "Luis Miguel Fernández",
      image: "/man-face-3.png"
    },
    date: "2024-07-16",
    doctor: "Dra. Linda Flor Medina L.",
    clinicId: "linda_2",
    totalServices: 2000,
    insuranceCovers: 0,
    patientPays: 2000,
    insurance: {
      provider: "ARS Universal",
      policyNumber: "UNI-2024-004567",
      coverageVerified: true,
      verifiedBy: "Loreleiby Peguero",
      verifiedDate: "2024-07-16",
      notes: "ARS no cubre consultas de migraña - pago directo"
    },
    items: [
      {
        description: "Consulta Especializada",
        amount: 2000,
        insuranceCovers: 0,
        patientPays: 2000
      }
    ],
    status: "Pendiente",
    notes: "Pendiente de autorización de la aseguradora"
  },
  // Facturas futuras
  {
    id: "7",
    patient: {
      id: "luis_abreu_1",
      name: "María González",
      image: "/woman-face-2.png"
    },
    date: "2024-07-30",
    doctor: "Dr. Luis Arturo Castillo Roa",
    clinicId: "luis_1",
    totalServices: 1500,
    insuranceCovers: 1200,
    patientPays: 300,
    insurance: {
      provider: "ARS Humano",
      policyNumber: "HUM-2024-001234",
      coverageVerified: false,
      verifiedBy: "",
      verifiedDate: "",
      notes: "Pendiente verificar cobertura"
    },
    items: [
      {
        description: "Consulta General",
        amount: 1500,
        insuranceCovers: 1200,
        patientPays: 300
      }
    ],
    status: "Pendiente",
    notes: "Cita programada para el 30 de julio"
  },
  {
    id: "8",
    patient: {
      id: "luis_abreu_2",
      name: "Juan Carlos Rodríguez",
      image: "/man-face.png"
    },
    date: "2024-08-06",
    doctor: "Dr. Luis Arturo Castillo Roa",
    clinicId: "luis_1",
    totalServices: 2000,
    insuranceCovers: 1600,
    patientPays: 400,
    insurance: {
      provider: "ARS Universal",
      policyNumber: "UNI-2024-005678",
      coverageVerified: false,
      verifiedBy: "",
      verifiedDate: "",
      notes: "Pendiente verificar cobertura"
    },
    items: [
      {
        description: "Consulta Especializada",
        amount: 2000,
        insuranceCovers: 1600,
        patientPays: 400
      }
    ],
    status: "Pendiente",
    notes: "Cita programada para el 6 de agosto"
  }
] 