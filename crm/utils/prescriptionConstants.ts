// Constantes para el módulo de recetario

export const PRESCRIPTION_CONSTANTS = {
  DEFAULT_TIME: 'T12:00:00.000Z',
  STATUS: {
    ACTIVE: 'Activa',
    COMPLETED: 'Completada',
    CANCELLED: 'Cancelada'
  } as const
} as const

// Configuración de doctores
export const DOCTOR_CONFIGS = [
  {
    namePattern: /linda/i,
    specialty: "Alergología",
    displayName: "Dra. Linda Flor Medina Lantigua",
    prescriptionTemplate: 'linda' as const
  },
  {
    namePattern: /luis/i,
    specialty: "Cardiología",
    displayName: "Dr. Luis Arturo Castillo Roa",
    prescriptionTemplate: 'luis' as const
  }
] as const

// Patrones para auto-numeración
export const MEDICATION_KEYWORDS = [
  'mg', 'ml', 'gr', 'g', 'tab', 'tableta', 'tabletas',
  'capsula', 'capsulas', 'jarabe', 'suspension', 'gotas',
  'inyeccion', 'ampolla', 'comprimido', 'comprimidos'
]

export const USAGE_KEYWORDS = [
  'cada', 'por', 'durante', 'tomar', 'usar', 'aplicar',
  'via', 'oral', 'topico', 'horas', 'dias', 'semanas',
  'meses', 'instrucciones', 'uso'
]

export const COMMON_MEDICATIONS = [
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
]

export const AUTO_NUMBER_TRIGGER = '-.'
export const MEDICATION_PATTERN = /^\s*\d+\./
export const ITEM_PATTERN = /^\d+\./
