// Utilidades para formatear prescripciones

import type { Medication, Service, Analytic } from "@/types/recetario"
import { ITEM_PATTERN, MEDICATION_PATTERN, AUTO_NUMBER_TRIGGER, MEDICATION_KEYWORDS, USAGE_KEYWORDS, COMMON_MEDICATIONS } from "./prescriptionConstants"

/**
 * Obtener iniciales del nombre
 */
export const getInitials = (name: string): string => {
  if (!name) return ""
  const names = name.split(' ')
  if (names.length >= 2) {
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
  }
  return name.charAt(0).toUpperCase()
}

/**
 * Contar items existentes en el texto de prescripción
 */
export const countExistingItems = (text: string): number => {
  return text.split('\n').filter(line => ITEM_PATTERN.test(line.trim())).length
}

/**
 * Detectar si una línea necesita auto-numeración
 */
export const needsAutoNumbering = (line: string, medications: Medication[] = []): boolean => {
  // Detectar trigger especial
  if (line === AUTO_NUMBER_TRIGGER) return true
  
  // Si ya tiene número, no necesita numeración
  if (MEDICATION_PATTERN.test(line)) return false
  
  // Si es muy corta, probablemente no es un medicamento
  if (line.trim().length < 5) return false
  
  const lineLower = line.toLowerCase().trim()
  
  // Verificar palabras clave de medicamentos
  const hasMedicationKeywords = MEDICATION_KEYWORDS.some(keyword => 
    lineLower.includes(keyword)
  )
  
  // Verificar palabras de uso
  const hasUsageKeywords = USAGE_KEYWORDS.some(keyword => 
    lineLower.includes(keyword)
  )
  
  // Verificar nombres comunes de medicamentos
  const hasCommonMedication = COMMON_MEDICATIONS.some(med => 
    lineLower.startsWith(med) || lineLower.includes(` ${med}`)
  )
  
  // Usar catálogo real si está disponible
  const matchesCatalog = medications.length > 0 && medications.some(med =>
    lineLower.includes(med.name.toLowerCase()) ||
    (med.genericName && lineLower.includes(med.genericName.toLowerCase()))
  )
  
  return hasMedicationKeywords || hasUsageKeywords || hasCommonMedication || matchesCatalog
}

/**
 * Auto-numerar una línea
 */
export const autoNumberLine = (line: string, existingCount: number): string => {
  if (line === AUTO_NUMBER_TRIGGER) {
    return `${existingCount + 1}. `
  }
  return `${existingCount + 1}. ${line}`
}

/**
 * Formatear medicamento para prescripción
 */
export const formatMedicationText = (medication: Medication, number: number): string => {
  const dosage = medication.dosage || "Dosis no especificada"
  const frequency = medication.frequency || "Frecuencia no especificada"
  const typicalDuration = medication.typicalDuration || "Duración no especificada"
  const instructions = medication.instructions || "Sin instrucciones específicas"
  
  return `${number}. ${medication.name} ${dosage} - ${frequency} - ${typicalDuration}\nInstrucciones: ${instructions}\n\n`
}

/**
 * Formatear servicio para prescripción
 */
export const formatServiceText = (service: Service, number: number): string => {
  const description = service.description || "Sin descripción"
  const category = service.category || "Sin categoría"
  const basePrice = service.basePrice || 0
  
  return `${number}. SERVICIO RECOMENDADO: ${service.name}\nDescripción: ${description}\nCategoría: ${category}\nPrecio estimado: RD$ ${basePrice.toLocaleString()}\n\n`
}

/**
 * Formatear analítica para prescripción
 */
export const formatAnalyticText = (analytic: Analytic, number: number): string => {
  const description = analytic.description || "Sin descripción"
  const instructions = analytic.instructions || "Sin instrucciones"
  const preparation = analytic.preparation || "Sin preparación específica"
  const contraindications = analytic.contraindications || "Sin contraindicaciones"
  
  return `${number}. ANÁLISIS SOLICITADO: ${analytic.name}\nDescripción: ${description}\nInstrucciones: ${instructions}\nPreparación: ${preparation}\nContraindicaciones: ${contraindications}\n\n`
}

/**
 * Obtener configuración del doctor basado en nombre
 */
import { DOCTOR_CONFIGS } from "./prescriptionConstants"

export const getDoctorConfig = (doctorName: string) => {
  return DOCTOR_CONFIGS.find((config) => 
    config.namePattern.test(doctorName)
  ) || null
}
