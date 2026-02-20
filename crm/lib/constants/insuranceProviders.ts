/**
 * Lista única de proveedores de seguro.
 * Usada en: nuevo paciente, editar paciente, reporte por seguros.
 * code = Código del prestador de servicio (para reporte por seguros).
 */
export interface InsuranceProviderOption {
  value: string
  label: string
  code?: string
}

export const INSURANCE_PROVIDERS: InsuranceProviderOption[] = [
  { value: "SIN SEGURO", label: "Sin seguro" },
  { value: "SENASA", label: "SENASA", code: "828033" },
  { value: "SEMMA", label: "SEMMA", code: "14903" },
  { value: "APS", label: "APS", code: "70696" },
  { value: "FUTURO", label: "FUTURO", code: "15786" },
  { value: "METASALUD", label: "METASALUD", code: "12794" },
  { value: "RESERVAS", label: "RESERVAS", code: "10008864" },
  { value: "CMD", label: "CMD", code: "90011255" },
  { value: "MONUMENTAL", label: "MONUMENTAL", code: "10976" },
  { value: "UASD", label: "UASD", code: "6730" },
  { value: "PRIMERA HUMANO", label: "PRIMERA HUMANO", code: "19979" },
  { value: "UNIVERSAL", label: "UNIVERSAL", code: "10950" },
  { value: "ASEMAP", label: "ASEMAP", code: "9007" },
  { value: "MAPFRE", label: "MAPFRE", code: "8277625" },
]

/** Obtener la etiqueta para un valor (para mostrar en badges, listas, etc.) */
export function getInsuranceProviderLabel(value: string | null | undefined): string {
  if (!value) return "No especificado"
  const option = INSURANCE_PROVIDERS.find((p) => p.value === value)
  return option?.label ?? value
}
