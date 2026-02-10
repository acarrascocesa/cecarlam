import type { MedicalService } from "@/context/app-context"

export const initialServices: MedicalService[] = [
  // CLÍNICA HAINA (clinic_haina)
  {
    id: "haina_consulta_egk_seguro",
    name: "Consulta + EKG",
    category: "Consulta",
    description: "Consulta médica con electrocardiograma incluido",
    basePrice: 1500,
    insuranceCoverage: 100, // 100% cubierto por seguro
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "haina_consulta_seguro",
    name: "Consulta",
    category: "Consulta", 
    description: "Consulta médica general",
    basePrice: 1500,
    insuranceCoverage: 100,
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "haina_evaluacion_prequirurgica_seguro",
    name: "Evaluación cardiovascular prequirúrgica",
    category: "Procedimiento",
    description: "Evaluación cardiovascular completa para cirugía",
    basePrice: 2000,
    insuranceCoverage: 100,
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "haina_resultados_seguro",
    name: "Resultados",
    category: "Laboratorio",
    description: "Entrega de resultados (menos de 21 días)",
    basePrice: 500,
    insuranceCoverage: 100,
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "Seguro"
  },
  // No asegurado - HAINA
  {
    id: "haina_consulta_egk_no_seguro",
    name: "Consulta + EKG",
    category: "Consulta",
    description: "Consulta médica con electrocardiograma incluido",
    basePrice: 2000,
    insuranceCoverage: 0,
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "haina_consulta_no_seguro",
    name: "Consulta",
    category: "Consulta",
    description: "Consulta médica general",
    basePrice: 2000,
    insuranceCoverage: 0,
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "haina_evaluacion_prequirurgica_no_seguro",
    name: "Evaluación cardiovascular prequirúrgica",
    category: "Procedimiento",
    description: "Evaluación cardiovascular completa para cirugía",
    basePrice: 2500,
    insuranceCoverage: 0,
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "haina_resultados_no_seguro",
    name: "Resultados",
    category: "Laboratorio",
    description: "Entrega de resultados (menos de 21 días)",
    basePrice: 500,
    insuranceCoverage: 0,
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "No asegurado"
  },

  // CLÍNICAS ELOHIM Y ABREU (clinic_elohim, clinic_abreu)
  {
    id: "elohim_abreu_consulta_egk_seguro",
    name: "Consulta + EKG",
    category: "Consulta",
    description: "Consulta médica con electrocardiograma incluido",
    basePrice: 2000,
    insuranceCoverage: 100,
    clinicId: "clinic_abreu", // Abreu
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "elohim_abreu_consulta_egk_seguro_2",
    name: "Consulta + EKG",
    category: "Consulta",
    description: "Consulta médica con electrocardiograma incluido",
    basePrice: 2000,
    insuranceCoverage: 100,
    clinicId: "clinic_elohim", // Elohim
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "elohim_abreu_consulta_seguro",
    name: "Consulta",
    category: "Consulta",
    description: "Consulta médica general",
    basePrice: 2000,
    insuranceCoverage: 100,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "elohim_abreu_consulta_seguro_2",
    name: "Consulta",
    category: "Consulta",
    description: "Consulta médica general",
    basePrice: 2000,
    insuranceCoverage: 100,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "elohim_abreu_evaluacion_prequirurgica_seguro",
    name: "Evaluación cardiovascular prequirúrgica",
    category: "Procedimiento",
    description: "Evaluación cardiovascular completa para cirugía",
    basePrice: 3000,
    insuranceCoverage: 100,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "elohim_abreu_evaluacion_prequirurgica_seguro_2",
    name: "Evaluación cardiovascular prequirúrgica",
    category: "Procedimiento",
    description: "Evaluación cardiovascular completa para cirugía",
    basePrice: 3000,
    insuranceCoverage: 100,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "elohim_abreu_resultados_seguro",
    name: "Resultados",
    category: "Laboratorio",
    description: "Entrega de resultados (menos de 21 días)",
    basePrice: 1000,
    insuranceCoverage: 100,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "elohim_abreu_resultados_seguro_2",
    name: "Resultados",
    category: "Laboratorio",
    description: "Entrega de resultados (menos de 21 días)",
    basePrice: 1000,
    insuranceCoverage: 100,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "elohim_abreu_ecocardiograma_seguro",
    name: "Ecocardiograma",
    category: "Procedimiento",
    description: "Ecocardiograma completo",
    basePrice: 2000,
    insuranceCoverage: 100,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "Seguro"
  },
  {
    id: "elohim_abreu_ecocardiograma_seguro_2",
    name: "Ecocardiograma",
    category: "Procedimiento",
    description: "Ecocardiograma completo",
    basePrice: 2000,
    insuranceCoverage: 100,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "Seguro"
  },
  // No asegurado - ELOHIM Y ABREU
  {
    id: "elohim_abreu_consulta_egk_no_seguro",
    name: "Consulta + EKG",
    category: "Consulta",
    description: "Consulta médica con electrocardiograma incluido",
    basePrice: 2500,
    insuranceCoverage: 0,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "elohim_abreu_consulta_egk_no_seguro_2",
    name: "Consulta + EKG",
    category: "Consulta",
    description: "Consulta médica con electrocardiograma incluido",
    basePrice: 2500,
    insuranceCoverage: 0,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "elohim_abreu_consulta_no_seguro",
    name: "Consulta",
    category: "Consulta",
    description: "Consulta médica general",
    basePrice: 2500,
    insuranceCoverage: 0,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "elohim_abreu_consulta_no_seguro_2",
    name: "Consulta",
    category: "Consulta",
    description: "Consulta médica general",
    basePrice: 2500,
    insuranceCoverage: 0,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "elohim_abreu_evaluacion_prequirurgica_no_seguro",
    name: "Evaluación cardiovascular prequirúrgica",
    category: "Procedimiento",
    description: "Evaluación cardiovascular completa para cirugía",
    basePrice: 3500,
    insuranceCoverage: 0,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "elohim_abreu_evaluacion_prequirurgica_no_seguro_2",
    name: "Evaluación cardiovascular prequirúrgica",
    category: "Procedimiento",
    description: "Evaluación cardiovascular completa para cirugía",
    basePrice: 3500,
    insuranceCoverage: 0,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "elohim_abreu_resultados_no_seguro",
    name: "Resultados",
    category: "Laboratorio",
    description: "Entrega de resultados (menos de 21 días)",
    basePrice: 1000,
    insuranceCoverage: 0,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "elohim_abreu_resultados_no_seguro_2",
    name: "Resultados",
    category: "Laboratorio",
    description: "Entrega de resultados (menos de 21 días)",
    basePrice: 1000,
    insuranceCoverage: 0,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "elohim_abreu_ecocardiograma_no_seguro",
    name: "Ecocardiograma",
    category: "Procedimiento",
    description: "Ecocardiograma completo",
    basePrice: 2500,
    insuranceCoverage: 0,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "elohim_abreu_ecocardiograma_no_seguro_2",
    name: "Ecocardiograma",
    category: "Procedimiento",
    description: "Ecocardiograma completo",
    basePrice: 2500,
    insuranceCoverage: 0,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "No asegurado"
  },

  // SERVICIOS ESPECIALES (todas las clínicas)
  {
    id: "evaluacion_plastica",
    name: "Evaluación cardiovascular prequirúrgica para cirugía plástica",
    category: "Procedimiento",
    description: "Evaluación cardiovascular especializada para cirugía plástica",
    basePrice: 5000,
    insuranceCoverage: 0,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "evaluacion_plastica_2",
    name: "Evaluación cardiovascular prequirúrgica para cirugía plástica",
    category: "Procedimiento",
    description: "Evaluación cardiovascular especializada para cirugía plástica",
    basePrice: 5000,
    insuranceCoverage: 0,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "evaluacion_plastica_3",
    name: "Evaluación cardiovascular prequirúrgica para cirugía plástica",
    category: "Procedimiento",
    description: "Evaluación cardiovascular especializada para cirugía plástica",
    basePrice: 5000,
    insuranceCoverage: 0,
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "evaluacion_plastica_ecocardiograma",
    name: "Evaluación cardiovascular prequirúrgica para cirugía plástica + ecocardiograma",
    category: "Procedimiento",
    description: "Evaluación cardiovascular + ecocardiograma para cirugía plástica",
    basePrice: 6000,
    insuranceCoverage: 0,
    clinicId: "clinic_abreu",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "evaluacion_plastica_ecocardiograma_2",
    name: "Evaluación cardiovascular prequirúrgica para cirugía plástica + ecocardiograma",
    category: "Procedimiento",
    description: "Evaluación cardiovascular + ecocardiograma para cirugía plástica",
    basePrice: 6000,
    insuranceCoverage: 0,
    clinicId: "clinic_elohim",
    isActive: true,
    insuranceType: "No asegurado"
  },
  {
    id: "evaluacion_plastica_ecocardiograma_3",
    name: "Evaluación cardiovascular prequirúrgica para cirugía plástica + ecocardiograma",
    category: "Procedimiento",
    description: "Evaluación cardiovascular + ecocardiograma para cirugía plástica",
    basePrice: 6000,
    insuranceCoverage: 0,
    clinicId: "clinic_haina",
    isActive: true,
    insuranceType: "No asegurado"
  },

  // SERVICIOS EN NEGOCIACIÓN
  {
    id: "mapa_holter",
    name: "Colocación de MAPA y HOLTER",
    category: "Procedimiento",
    description: "Colocación de MAPA y HOLTER (en proceso de negociaciones con las ARS)",
    basePrice: 0,
    insuranceCoverage: 0,
    clinicId: "clinic_abreu",
    isActive: false,
    insuranceType: "En negociación"
  },
  {
    id: "mapa_holter_2",
    name: "Colocación de MAPA y HOLTER",
    category: "Procedimiento",
    description: "Colocación de MAPA y HOLTER (en proceso de negociaciones con las ARS)",
    basePrice: 0,
    insuranceCoverage: 0,
    clinicId: "clinic_elohim",
    isActive: false,
    insuranceType: "En negociación"
  },
  {
    id: "mapa_holter_3",
    name: "Colocación de MAPA y HOLTER",
    category: "Procedimiento",
    description: "Colocación de MAPA y HOLTER (en proceso de negociaciones con las ARS)",
    basePrice: 0,
    insuranceCoverage: 0,
    clinicId: "clinic_haina",
    isActive: false,
    insuranceType: "En negociación"
  }
] 