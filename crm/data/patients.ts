import type { Patient } from "@/types/patient"

// Pacientes de la Clínica Abreu (Dr. Luis)
export const luisClinicAbreuPatients: Patient[] = [
  {
    id: "luis_abreu_1",
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "(809) 555-0101",
    dateOfBirth: "1985-03-15",
    gender: "Femenino",
    address: "Calle Principal #123, Santo Domingo",
    emergencyContact: {
      name: "Carlos González",
      phone: "(809) 555-0102",
      relationship: "Esposo"
    },
    insurance: "ARS Humano",
    insuranceNumber: "HUM-123456789",
    bloodType: "O+",
    allergies: ["Penicilina", "Polen"],
    chronicConditions: ["Hipertensión"],
    status: "Activo",
    image: "/woman-face-2.png",
    notes: "Paciente con hipertensión controlada. Requiere seguimiento mensual.",
    createdAt: "2024-01-15",
    updatedAt: "2024-07-15",
    clinicId: "clinic_abreu"
  },
  {
    id: "luis_abreu_2",
    name: "Juan Carlos Rodríguez",
    email: "juan.rodriguez@email.com",
    phone: "(809) 555-0201",
    dateOfBirth: "1978-07-22",
    gender: "Masculino",
    address: "Avenida Independencia #456, Santiago",
    emergencyContact: {
      name: "Ana Rodríguez",
      phone: "(809) 555-0202",
      relationship: "Esposa"
    },
    insurance: "ARS Universal",
    insuranceNumber: "UNI-987654321",
    bloodType: "A+",
    allergies: ["Sulfas"],
    chronicConditions: ["Diabetes Tipo 2"],
    status: "Activo",
    image: "/man-face.png",
    notes: "Paciente diabético con buen control. Monitoreo de glucosa diario.",
    createdAt: "2024-02-10",
    updatedAt: "2024-07-20",
    clinicId: "clinic_abreu"
  }
]

// Pacientes del Centro Médico Elohim (Dr. Luis)
export const luisElohimPatients: Patient[] = [
  {
    id: "luis_elohim_1",
    name: "Roberto Antonio Martínez",
    email: "roberto.martinez@email.com",
    phone: "(809) 555-0401",
    dateOfBirth: "1965-12-03",
    gender: "Masculino",
    address: "Calle Sánchez #321, San Pedro de Macorís",
    emergencyContact: {
      name: "Isabel Martínez",
      phone: "(809) 555-0402",
      relationship: "Hija"
    },
    insurance: "ARS Monumental",
    insuranceNumber: "MON-789123456",
    bloodType: "AB+",
    allergies: ["Mariscos"],
    chronicConditions: ["Artritis", "Hipertensión"],
    status: "Activo",
    image: "/man-face-2.png",
    notes: "Paciente con artritis reumatoide. Requiere tratamiento especializado.",
    createdAt: "2024-01-20",
    updatedAt: "2024-07-18",
    clinicId: "clinic_elohim"
  }
]

// Pacientes del Centro Médico Haina (Dr. Luis)
export const luisHainaPatients: Patient[] = [
  {
    id: "luis_haina_1",
    name: "Carmen Elena Santos",
    email: "carmen.santos@email.com",
    phone: "(809) 555-0301",
    dateOfBirth: "1990-11-08",
    gender: "Femenino",
    address: "Calle Duarte #789, Haina",
    emergencyContact: {
      name: "José Santos",
      phone: "(809) 555-0302",
      relationship: "Esposo"
    },
    insurance: "ARS Humano",
    insuranceNumber: "HUM-456789123",
    bloodType: "B+",
    allergies: ["Ibuprofeno"],
    chronicConditions: ["Hipotiroidismo"],
    status: "Activo",
    image: "/woman-face-3.png",
    notes: "Paciente con hipotiroidismo controlado. Seguimiento trimestral.",
    createdAt: "2024-01-25",
    updatedAt: "2024-07-21",
    clinicId: "clinic_haina"
  },
  {
    id: "luis_haina_2",
    name: "Miguel Ángel Pérez",
    email: "miguel.perez@email.com",
    phone: "(809) 555-0303",
    dateOfBirth: "1982-06-14",
    gender: "Masculino",
    address: "Avenida Central #456, Haina",
    emergencyContact: {
      name: "Rosa Pérez",
      phone: "(809) 555-0304",
      relationship: "Esposa"
    },
    insurance: "ARS Universal",
    insuranceNumber: "UNI-654321987",
    bloodType: "AB-",
    allergies: ["Polen"],
    chronicConditions: ["Hipertensión"],
    status: "Activo",
    image: "/man-face-4.png",
    notes: "Paciente hipertenso con control regular. Monitoreo semanal.",
    createdAt: "2024-02-15",
    updatedAt: "2024-07-17",
    clinicId: "clinic_haina"
  }
]

// Pacientes de la Clínica de la Dra. Linda (Clínica 1)
export const lindaClinic1Patients: Patient[] = [
  {
    id: "linda_clinic1_1",
    name: "Ana Sofía López",
    email: "ana.lopez@email.com",
    phone: "(809) 555-0501",
    dateOfBirth: "1995-05-18",
    gender: "Femenino",
    address: "Avenida 27 de Febrero #654, Santo Domingo",
    emergencyContact: {
      name: "Pedro López",
      phone: "(809) 555-0502",
      relationship: "Hermano"
    },
    insurance: "ARS Humano",
    insuranceNumber: "HUM-321654987",
    bloodType: "O-",
    allergies: ["Látex"],
    chronicConditions: ["Asma"],
    status: "Activo",
    image: "/woman-face-4.png",
    notes: "Paciente asmática con crisis ocasionales. Uso de inhalador prescrito.",
    createdAt: "2024-04-12",
    updatedAt: "2024-07-22",
    clinicId: "clinic_linda_1"
  },
  {
    id: "linda_clinic1_2",
    name: "Carlos Enrique Ramírez",
    email: "carlos.ramirez@email.com",
    phone: "(809) 555-0801",
    dateOfBirth: "1972-04-12",
    gender: "Masculino",
    address: "Calle Hostos #258, Santo Domingo",
    emergencyContact: {
      name: "María Ramírez",
      phone: "(809) 555-0802",
      relationship: "Esposa"
    },
    insurance: "ARS Monumental",
    insuranceNumber: "MON-258147369",
    bloodType: "O+",
    allergies: ["Polen", "Ácaros"],
    chronicConditions: ["Rinitis alérgica"],
    status: "Activo",
    image: "/man-face-4.png",
    notes: "Paciente con rinitis alérgica estacional. Tratamiento antihistamínico.",
    createdAt: "2024-03-18",
    updatedAt: "2024-07-19",
    clinicId: "clinic_linda_1"
  }
]

// Pacientes del Centro Médico Dra. Linda (Clínica 2)
export const lindaClinic2Patients: Patient[] = [
  {
    id: "linda_clinic2_1",
    name: "Luis Miguel Fernández",
    email: "luis.fernandez@email.com",
    phone: "(809) 555-0601",
    dateOfBirth: "1980-09-25",
    gender: "Masculino",
    address: "Calle Las Damas #147, Santo Domingo",
    emergencyContact: {
      name: "Rosa Fernández",
      phone: "(809) 555-0602",
      relationship: "Madre"
    },
    insurance: "ARS Universal",
    insuranceNumber: "UNI-147258369",
    bloodType: "A-",
    allergies: ["Polvo"],
    chronicConditions: ["Migraña"],
    status: "Activo",
    image: "/man-face-3.png",
    notes: "Paciente con migrañas frecuentes. Evaluación neurológica recomendada.",
    createdAt: "2024-02-28",
    updatedAt: "2024-07-16",
    clinicId: "clinic_linda_2"
  }
]

// Todos los pacientes combinados
export const initialPatients: Patient[] = [
  ...luisClinicAbreuPatients,
  ...luisElohimPatients,
  ...luisHainaPatients,
  ...lindaClinic1Patients,
  ...lindaClinic2Patients
] 