import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha a formato YYYY-MM-DD sin problemas de zona horaria
 * @param date - La fecha a formatear
 * @returns String en formato YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  // Evitar problemas de zona horaria usando la fecha local
  const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formatea la fecha actual a formato YYYY-MM-DD sin problemas de zona horaria
 * @returns String en formato YYYY-MM-DD
 */
export function getCurrentDateISO(): string {
  const date = new Date()
  return formatDateToISO(date)
}
