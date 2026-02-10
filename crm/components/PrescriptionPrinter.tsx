import React from 'react'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import { usePrescriptionPagination } from '@/hooks/usePrescriptionPagination'
import type { PrescriptionPrintParams } from '@/types/prescription'

interface PrescriptionPrinterProps {
  params: PrescriptionPrintParams
  children?: React.ReactNode
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

/**
 * Componente wrapper para imprimir recetas médicas
 * @param params - Parámetros de la receta
 * @param children - Contenido del botón (opcional)
 * @param className - Clases CSS adicionales
 * @param variant - Variante del botón
 * @param size - Tamaño del botón
 */
export const PrescriptionPrinter: React.FC<PrescriptionPrinterProps> = ({
  params,
  children,
  className = '',
  variant = 'outline',
  size = 'sm'
}) => {
  const { printPrescriptionWithValidation } = usePrescriptionPagination()

  const handlePrint = () => {
    printPrescriptionWithValidation(params)
  }

  return (
    <Button
      onClick={handlePrint}
      variant={variant}
      size={size}
      className={className}
    >
      <Printer className="mr-2 h-4 w-4" />
      {children || 'Imprimir Receta'}
    </Button>
  )
}

/**
 * Hook para usar el componente PrescriptionPrinter con datos del contexto
 */
export const usePrescriptionPrinter = () => {
  const { printPrescriptionWithValidation } = usePrescriptionPagination()

  const printFromContext = (params: Omit<PrescriptionPrintParams, 'clinic'> & { clinic?: any }) => {
    // Adaptar datos del contexto a la interfaz esperada
    const adaptedParams: PrescriptionPrintParams = {
      content: params.content,
      patient: {
        id: params.patient.id,
        name: params.patient.name,
        dateOfBirth: params.patient.dateOfBirth,
        email: params.patient.email,
        phone: params.patient.phone
      },
      doctor: {
        id: params.doctor.id,
        name: params.doctor.name,
        licenseNumber: params.doctor.licenseNumber,
        specialty: params.doctor.specialty
      },
      clinic: {
        clinic_id: params.clinic?.clinic_id || params.clinic?.id || '',
        clinic_name: params.clinic?.clinic_name || params.clinic?.name || '',
        clinic_address: params.clinic?.clinic_address || params.clinic?.address || '',
        clinic_phone: params.clinic?.clinic_phone || params.clinic?.phone || '',
        clinic_email: params.clinic?.clinic_email || params.clinic?.email
      },
      isLinda: params.isLinda,
      showSignature: params.showSignature,
      prescriptionDate: params.prescriptionDate
    }

    printPrescriptionWithValidation(adaptedParams)
  }

  return { printFromContext }
}
