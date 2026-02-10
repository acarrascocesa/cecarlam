// Hook para manejar auto-numeración de prescripciones

import { useCallback } from "react"
import type { Medication } from "@/types/recetario"
import {
  needsAutoNumbering,
  autoNumberLine,
  getNextItemNumber
} from "../utils/prescriptionFormatters"
import { PRESCRIPTION_CONSTANTS } from "../utils/constants"

interface UsePrescriptionAutoNumberParams {
  prescriptionText: string
  setPrescriptionText: (text: string) => void
  medications?: Medication[]
}

/**
 * Hook para manejar auto-numeración en el editor de prescripciones
 */
export const usePrescriptionAutoNumber = ({
  prescriptionText,
  setPrescriptionText,
  medications = []
}: UsePrescriptionAutoNumberParams) => {
  
  const handleTextChange = useCallback((value: string) => {
    const lines = value.split('\n')
    const currentLine = lines[lines.length - 1]
    
    // Auto-numeración instantánea cuando se escribe el trigger
    if (currentLine === PRESCRIPTION_CONSTANTS.AUTO_NUMBER_TRIGGER) {
      const existingCount = getNextItemNumber(prescriptionText) - 1
      const formattedLines = [...lines]
      formattedLines[formattedLines.length - 1] = autoNumberLine(currentLine, existingCount)
      setPrescriptionText(formattedLines.join('\n'))
      return
    }
    
    // Auto-numeración cuando empiezas una nueva línea con un medicamento
    if (currentLine.length >= 5 && !PRESCRIPTION_CONSTANTS.MEDICATION_PATTERN.test(currentLine)) {
      if (needsAutoNumbering(currentLine, medications)) {
        const existingCount = getNextItemNumber(prescriptionText) - 1
        const formattedLines = [...lines]
        formattedLines[formattedLines.length - 1] = autoNumberLine(currentLine, existingCount)
        setPrescriptionText(formattedLines.join('\n'))
        return
      }
    }
    
    // Sistema alternativo: detectar cuando se presiona Enter dos veces seguidas
    const lastLine = lines[lines.length - 1]
    const secondLastLine = lines[lines.length - 2]
    const thirdLastLine = lines[lines.length - 3]
    
    if (
      lines.length >= 2 &&
      !lastLine.trim() &&
      thirdLastLine &&
      thirdLastLine.trim() &&
      !secondLastLine.trim()
    ) {
      const textToCheck = thirdLastLine.trim()
      
      // Verificar si la línea empieza con trigger
      if (textToCheck.startsWith(PRESCRIPTION_CONSTANTS.AUTO_NUMBER_TRIGGER)) {
        const existingCount = getNextItemNumber(value) - 1
        const formattedLines = [...lines]
        const contentAfterTrigger = textToCheck.substring(PRESCRIPTION_CONSTANTS.AUTO_NUMBER_TRIGGER.length)
        formattedLines[lines.length - 3] = `${existingCount + 1}.${contentAfterTrigger}`
        formattedLines[lines.length - 1] = ''
        setPrescriptionText(formattedLines.join('\n'))
        return
      }
      
      // Verificar si necesita auto-numeración
      if (needsAutoNumbering(textToCheck, medications)) {
        const existingCount = getNextItemNumber(value) - 1
        
        if (!PRESCRIPTION_CONSTANTS.MEDICATION_PATTERN.test(textToCheck)) {
          const formattedLines = [...lines]
          formattedLines[lines.length - 3] = autoNumberLine(textToCheck, existingCount)
          formattedLines[lines.length - 1] = ''
          setPrescriptionText(formattedLines.join('\n'))
          return
        }
      }
    }
    
    // Si no se aplica ninguna transformación, actualizar normalmente
    setPrescriptionText(value)
  }, [prescriptionText, setPrescriptionText, medications])
  
  return { handleTextChange }
}
