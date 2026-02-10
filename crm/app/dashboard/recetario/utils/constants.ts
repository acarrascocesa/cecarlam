// Constantes para el módulo de recetario

export const PRESCRIPTION_CONSTANTS = {
  DEFAULT_TIME: 'T12:00:00.000Z',
  STATUS: {
    ACTIVE: 'Activa',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada'
  } as const,
  AUTO_NUMBER_TRIGGER: '-.',
  MEDICATION_PATTERN: /^\d+\./,
  MAX_ITEMS_PER_PAGE: 6,
} as const

export const DOCTOR_CONFIGS = [
  {
    namePattern: /jorge.*pichardo/i,
    specialty: "Cardiólogo",
    displayName: "Dr. Jorge M. Pichardo Ureña",
    prescriptionTemplate: 'luis' as const
  },
  {
    namePattern: /mily.*peña/i,
    specialty: "Cirujana - Oftalmóloga",
    displayName: "Dra. Mily Peña Canario",
    prescriptionTemplate: 'linda' as const
  }
] as const

export const MEDICATION_KEYWORDS = [
  'mg', 'ml', 'gr', 'g', 'tab', 'tableta', 'tabletas', 
  'capsula', 'capsulas', 'jarabe', 'suspension', 'gotas', 
  'inyeccion', 'ampolla', 'comprimido', 'comprimidos'
] as const

export const USAGE_KEYWORDS = [
  'cada', 'por', 'durante', 'tomar', 'usar', 'aplicar', 
  'via', 'oral', 'topico', 'horas', 'dias', 'semanas', 
  'meses', 'instrucciones', 'uso'
] as const

export const COMMON_MEDICATION_NAMES = [
  'paracetamol', 'acetaminofen', 'ibuprofeno', 'aspirina', 
  'amoxicilina', 'omeprazol', 'loratadina', 'diclofenaco', 
  'metformina', 'losartan', 'enalapril', 'amlodipino', 
  'atorvastatina', 'simvastatina', 'levotiroxina', 'prednisona', 
  'dexametasona', 'furosemida', 'hidroclorotiazida', 'captopril', 
  'propranolol', 'metoprolol', 'carvedilol', 'digoxina', 
  'warfarina', 'clopidogrel', 'insulina', 'glibenclamida', 
  'metoclopramida', 'ranitidina', 'salbutamol', 'beclometasona', 
  'fluticasona', 'montelukast', 'cetirizina', 'difenhidramina', 
  'tramadol', 'ketorolaco', 'naproxeno', 'celecoxib', 
  'clonazepam', 'diazepam', 'alprazolam', 'fluoxetina', 
  'sertralina', 'escitalopram', 'amitriptilina', 'gabapentina', 
  'pregabalina'
] as const
