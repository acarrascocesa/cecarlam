export interface Medication {
  id: string
  name: string
  genericName: string
  category: "Antibióticos" | "Analgésicos" | "Cardiovasculares" | "Antihistamínicos" | "Corticosteroides" | "Otros"
  dosage: string
  frequency: string
  typicalDuration: string
  instructions: string
  contraindications: string
  sideEffects: string
  doctorId: string // Asociado al doctor, no a la clínica
  isActive: boolean
}

export const initialMedications: Medication[] = [
  // MEDICAMENTOS DEL DR. LUIS (CARDIOLOGÍA)
  {
    id: "med_1",
    name: "Amlodipino",
    genericName: "Amlodipine",
    category: "Cardiovasculares",
    dosage: "5-10 mg",
    frequency: "Una vez al día",
    typicalDuration: "Indefinido",
    instructions: "Tomar por la mañana, con o sin alimentos",
    contraindications: "Hipersensibilidad al amlodipino",
    sideEffects: "Edema, mareos, fatiga",
    doctorId: "dr_luis",
    isActive: true
  },
  {
    id: "med_2",
    name: "Losartán",
    genericName: "Losartan",
    category: "Cardiovasculares",
    dosage: "50-100 mg",
    frequency: "Una vez al día",
    typicalDuration: "Indefinido",
    instructions: "Tomar por la mañana, con o sin alimentos",
    contraindications: "Embarazo, hipersensibilidad",
    sideEffects: "Mareos, fatiga, tos seca",
    doctorId: "dr_luis",
    isActive: true
  },
  {
    id: "med_3",
    name: "Atorvastatina",
    genericName: "Atorvastatin",
    category: "Cardiovasculares",
    dosage: "10-80 mg",
    frequency: "Una vez al día",
    typicalDuration: "Indefinido",
    instructions: "Tomar por la noche, con o sin alimentos",
    contraindications: "Enfermedad hepática activa",
    sideEffects: "Dolor muscular, náuseas, dolor de cabeza",
    doctorId: "dr_luis",
    isActive: true
  },
  {
    id: "med_4",
    name: "Aspirina",
    genericName: "Acetylsalicylic Acid",
    category: "Cardiovasculares",
    dosage: "81-325 mg",
    frequency: "Una vez al día",
    typicalDuration: "Indefinido",
    instructions: "Tomar con alimentos para evitar irritación gástrica",
    contraindications: "Úlcera gástrica, alergia a aspirina",
    sideEffects: "Irritación gástrica, sangrado",
    doctorId: "dr_luis",
    isActive: true
  },
  {
    id: "med_5",
    name: "Metoprolol",
    genericName: "Metoprolol",
    category: "Cardiovasculares",
    dosage: "25-200 mg",
    frequency: "Una o dos veces al día",
    typicalDuration: "Indefinido",
    instructions: "Tomar con alimentos, no suspender abruptamente",
    contraindications: "Bradicardia severa, bloqueo AV",
    sideEffects: "Fatiga, mareos, bradicardia",
    doctorId: "dr_luis",
    isActive: true
  },

  // MEDICAMENTOS DE LA DRA. LINDA (ALERGOLOGÍA)
  {
    id: "med_6",
    name: "Loratadina",
    genericName: "Loratadine",
    category: "Antihistamínicos",
    dosage: "10 mg",
    frequency: "Una vez al día",
    typicalDuration: "7-14 días",
    instructions: "Tomar por la mañana, con o sin alimentos",
    contraindications: "Hipersensibilidad a loratadina",
    sideEffects: "Somnolencia, sequedad de boca",
    doctorId: "dra_linda",
    isActive: true
  },
  {
    id: "med_7",
    name: "Cetirizina",
    genericName: "Cetirizine",
    category: "Antihistamínicos",
    dosage: "10 mg",
    frequency: "Una vez al día",
    typicalDuration: "7-14 días",
    instructions: "Tomar por la noche, puede causar somnolencia",
    contraindications: "Hipersensibilidad a cetirizina",
    sideEffects: "Somnolencia, fatiga, sequedad de boca",
    doctorId: "dra_linda",
    isActive: true
  },
  {
    id: "med_8",
    name: "Prednisona",
    genericName: "Prednisone",
    category: "Corticosteroides",
    dosage: "5-60 mg",
    frequency: "Una vez al día por la mañana",
    typicalDuration: "5-14 días",
    instructions: "Tomar por la mañana con alimentos, no suspender abruptamente",
    contraindications: "Infecciones sistémicas, úlcera gástrica",
    sideEffects: "Aumento de peso, insomnio, osteoporosis",
    doctorId: "dra_linda",
    isActive: true
  },
  {
    id: "med_9",
    name: "Montelukast",
    genericName: "Montelukast",
    category: "Antihistamínicos",
    dosage: "10 mg",
    frequency: "Una vez al día por la noche",
    typicalDuration: "Indefinido",
    instructions: "Tomar por la noche, 1 hora antes o 2 horas después de alimentos",
    contraindications: "Hipersensibilidad a montelukast",
    sideEffects: "Dolor de cabeza, dolor abdominal, cambios de humor",
    doctorId: "dra_linda",
    isActive: true
  },
  {
    id: "med_10",
    name: "Fluticasona",
    genericName: "Fluticasone",
    category: "Corticosteroides",
    dosage: "50-500 mcg",
    frequency: "Una o dos veces al día",
    typicalDuration: "Indefinido",
    instructions: "Inhalar según indicaciones, enjuagar boca después",
    contraindications: "Hipersensibilidad a fluticasona",
    sideEffects: "Candidiasis oral, ronquera",
    doctorId: "dra_linda",
    isActive: true
  },

  // MEDICAMENTOS COMUNES PARA AMBOS DOCTORES
  {
    id: "med_11",
    name: "Ibuprofeno",
    genericName: "Ibuprofen",
    category: "Analgésicos",
    dosage: "400-800 mg",
    frequency: "Cada 6-8 horas",
    typicalDuration: "3-7 días",
    instructions: "Tomar con alimentos, no exceder 3200 mg/día",
    contraindications: "Úlcera gástrica, insuficiencia renal",
    sideEffects: "Irritación gástrica, dolor de cabeza",
    doctorId: "dr_luis",
    isActive: true
  },
  {
    id: "med_12",
    name: "Ibuprofeno",
    genericName: "Ibuprofen",
    category: "Analgésicos",
    dosage: "400-800 mg",
    frequency: "Cada 6-8 horas",
    typicalDuration: "3-7 días",
    instructions: "Tomar con alimentos, no exceder 3200 mg/día",
    contraindications: "Úlcera gástrica, insuficiencia renal",
    sideEffects: "Irritación gástrica, dolor de cabeza",
    doctorId: "dra_linda",
    isActive: true
  },
  {
    id: "med_13",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    category: "Analgésicos",
    dosage: "500-1000 mg",
    frequency: "Cada 4-6 horas",
    typicalDuration: "3-7 días",
    instructions: "Tomar con o sin alimentos, no exceder 4000 mg/día",
    contraindications: "Enfermedad hepática, alcoholismo",
    sideEffects: "Náuseas, daño hepático en sobredosis",
    doctorId: "dr_luis",
    isActive: true
  },
  {
    id: "med_14",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    category: "Analgésicos",
    dosage: "500-1000 mg",
    frequency: "Cada 4-6 horas",
    typicalDuration: "3-7 días",
    instructions: "Tomar con o sin alimentos, no exceder 4000 mg/día",
    contraindications: "Enfermedad hepática, alcoholismo",
    sideEffects: "Náuseas, daño hepático en sobredosis",
    doctorId: "dra_linda",
    isActive: true
  }
] 