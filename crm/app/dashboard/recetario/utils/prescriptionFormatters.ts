// Utilidades para formatear contenido de prescripciones

import type { Medication, Service, Analytic } from "@/types/recetario"
import { PRESCRIPTION_CONSTANTS, MEDICATION_KEYWORDS, USAGE_KEYWORDS, COMMON_MEDICATION_NAMES } from "./constants"

/**
 * Contar items numerados existentes en el texto
 */
export const countExistingItems = (text: string): number => {
  return text.split('\n').filter(line => PRESCRIPTION_CONSTANTS.MEDICATION_PATTERN.test(line.trim())).length
}

/**
 * Obtener el siguiente número para numeración
 */
export const getNextItemNumber = (text: string): number => {
  return countExistingItems(text) + 1
}

/**
 * Formatear texto de medicamento para agregar a prescripción
 */
export const formatMedicationText = (medication: Medication, number: number): string => {
  const dosage = medication.dosage || "Dosis no especificada"
  const frequency = medication.frequency || "Frecuencia no especificada"
  const typicalDuration = medication.typicalDuration || "Duración no especificada"
  const instructions = medication.instructions || "Sin instrucciones específicas"
  
  return `${number}. ${medication.name} ${dosage} - ${frequency} - ${typicalDuration}\nInstrucciones: ${instructions}\n\n`
}

/**
 * Formatear texto de servicio para agregar a prescripción
 */
export const formatServiceText = (service: Service, number: number): string => {
  const description = service.description || "Sin descripción"
  const category = service.category || "Sin categoría"
  const basePrice = service.basePrice || 0
  
  return `${number}. SERVICIO RECOMENDADO: ${service.name}\nDescripción: ${description}\nCategoría: ${category}\nPrecio estimado: RD$ ${basePrice.toLocaleString()}\n\n`
}

/**
 * Formatear texto de analítica para agregar a prescripción
 */
export const formatAnalyticText = (analytic: Analytic, number: number): string => {
  const description = analytic.description || "Sin descripción"
  const instructions = analytic.instructions || "Sin instrucciones"
  const preparation = analytic.preparation || "Sin preparación específica"
  const contraindications = analytic.contraindications || "Sin contraindicaciones"
  
  return `${number}. ANÁLISIS SOLICITADO: ${analytic.name}\nDescripción: ${description}\nInstrucciones: ${instructions}\nPreparación: ${preparation}\nContraindicaciones: ${contraindications}\n\n`
}

/**
 * Detectar si una línea necesita auto-numeración
 */
export const needsAutoNumbering = (line: string, medications: Medication[] = []): boolean => {
  // Detectar trigger especial
  if (line === PRESCRIPTION_CONSTANTS.AUTO_NUMBER_TRIGGER) {
    return true
  }
  
  // Ya tiene numeración
  if (PRESCRIPTION_CONSTANTS.MEDICATION_PATTERN.test(line)) {
    return false
  }
  
  const trimmedLine = line.trim()
  const lineLower = trimmedLine.toLowerCase()
  
  // Detectar keywords de medicamentos
  const medicationKeywordsRegex = new RegExp(`\\b(${MEDICATION_KEYWORDS.join('|')})\\b`, 'i')
  if (medicationKeywordsRegex.test(trimmedLine)) {
    return true
  }
  
  // Detectar keywords de uso
  const usageKeywordsRegex = new RegExp(`\\b(${USAGE_KEYWORDS.join('|')})\\b`, 'i')
  if (usageKeywordsRegex.test(trimmedLine)) {
    return true
  }
  
  // Detectar nombres comunes de medicamentos
  const commonMedicationsRegex = new RegExp(`^(${COMMON_MEDICATION_NAMES.join('|')})`, 'i')
  if (commonMedicationsRegex.test(trimmedLine)) {
    return true
  }
  
  // Intentar detectar usando el catálogo real de medicamentos
  if (medications.length > 0) {
    return medications.some(med => 
      med.name.toLowerCase().includes(lineLower) ||
      med.genericName?.toLowerCase().includes(lineLower)
    )
  }
  
  return false
}

/**
 * Auto-numerar una línea
 */
export const autoNumberLine = (line: string, existingCount: number): string => {
  if (line === PRESCRIPTION_CONSTANTS.AUTO_NUMBER_TRIGGER) {
    return `${existingCount + 1}. `
  }
  
  // Si ya tiene contenido después del trigger, mantenerlo
  if (line.startsWith(PRESCRIPTION_CONSTANTS.AUTO_NUMBER_TRIGGER)) {
    const contentAfterTrigger = line.substring(PRESCRIPTION_CONSTANTS.AUTO_NUMBER_TRIGGER.length)
    return `${existingCount + 1}.${contentAfterTrigger}`
  }
  
  return `${existingCount + 1}. ${line}`
}

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
