import { useCallback } from 'react'
import { splitContentIntoPages, generatePrescriptionHTML, printPrescription } from '@/utils/prescriptionUtils'
import type { PrescriptionPrintParams } from '@/types/prescription'

/**
 * Hook personalizado para manejar la paginación e impresión de recetas médicas
 * @returns Funciones para trabajar con recetas
 */
export const usePrescriptionPagination = () => {
  /**
   * Función para dividir contenido en páginas
   */
  const splitIntoPages = useCallback((content: string, maxItemsPerPage: number = 7) => {
    return splitContentIntoPages(content, maxItemsPerPage)
  }, [])

  /**
   * Función para generar HTML de receta
   */
  const generateHTML = useCallback((params: PrescriptionPrintParams) => {
    return generatePrescriptionHTML(params)
  }, [])

  /**
   * Función para imprimir receta
   */
  const print = useCallback((params: PrescriptionPrintParams) => {
    printPrescription(params)
  }, [])

  /**
   * Función completa para imprimir receta con validaciones
   */
  const printPrescriptionWithValidation = useCallback((params: PrescriptionPrintParams) => {
    // Validaciones básicas
    if (!params.content || !params.content.trim()) {
      console.warn('No hay contenido de prescripción para imprimir')
      return
    }

    if (!params.patient || !params.patient.name) {
      console.warn('Información del paciente requerida')
      return
    }

    if (!params.doctor || !params.doctor.name) {
      console.warn('Información del doctor requerida')
      return
    }

    if (!params.clinic || !params.clinic.clinic_name) {
      console.warn('Información de la clínica requerida')
      return
    }

    // Imprimir la receta
    printPrescription(params)
  }, [])

  return {
    splitIntoPages,
    generateHTML,
    print,
    printPrescriptionWithValidation
  }
}
