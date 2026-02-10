// lib/permissions.ts

export type UserRole = 'doctor' | 'secretary' | 'admin' | 'cajera'

export interface Permission {
  id: string
  label: string
  description: string
}

export interface RolePermissions {
  role: UserRole
  permissions: string[]
  navItems: string[]
}

// Definir todas las funcionalidades disponibles
export const ALL_PERMISSIONS: Permission[] = [
  { id: 'dashboard', label: 'Dashboard', description: 'Acceso al panel principal' },
  { id: 'patients', label: 'Pacientes', description: 'Gestión de pacientes' },
  { id: 'appointments', label: 'Citas', description: 'Gestión de citas médicas' },
  { id: 'medical-records', label: 'Historia Clínica', description: 'Historias clínicas' },
  { id: 'prescriptions', label: 'Recetario', description: 'Gestión de recetas médicas' },
  { id: 'medications', label: 'Medicamentos', description: 'Gestión de medicamentos' },
  { id: 'analytics', label: 'Analíticas', description: 'Gestión de analíticas médicas' },
  { id: 'invoices', label: 'Facturación', description: 'Gestión de facturas' },
  { id: 'services', label: 'Servicios', description: 'Gestión de servicios médicos' },
  { id: 'communication', label: 'Comunicación', description: 'Envío de emails' },
  { id: 'reports', label: 'Reportes', description: 'Generación de reportes' },
  { id: 'configuration', label: 'Configuración', description: 'Configuración del sistema' },
  { id: 'security', label: 'Seguridad', description: 'Gestión de usuarios y permisos' }
]

// Definir permisos por rol
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'doctor',
    permissions: [
      'dashboard', 'patients', 'appointments', 'medical-records', 
      'prescriptions', 'medications', 'analytics', 'invoices', 'services', 
      'communication', 'reports', 'configuration'
    ],
    navItems: [
      '/dashboard', '/dashboard/pacientes', '/dashboard/citas', 
      '/dashboard/historia-clinica', '/dashboard/recetario', 
      '/dashboard/medicamentos', '/dashboard/analiticas', '/dashboard/facturacion', 
      '/dashboard/servicios', '/dashboard/comunicacion', 
      '/dashboard/reportes', '/dashboard/configuracion'
    ]
  },
  {
    role: 'secretary',
    permissions: [
      'dashboard', 'patients', 'appointments', 'invoices', 'services'
    ],
    navItems: [
      '/dashboard', '/dashboard/pacientes', '/dashboard/citas', 
      '/dashboard/facturacion', '/dashboard/servicios'
    ]
  },
  {
    role: 'cajera',
    permissions: ['dashboard', 'invoices'],
    navItems: ['/dashboard', '/dashboard/caja', '/dashboard/facturacion']
  },
  {
    role: 'admin',
    permissions: [
      'dashboard', 'patients', 'appointments', 'medical-records', 
      'prescriptions', 'medications', 'analytics', 'invoices', 'services', 
      'communication', 'reports', 'configuration', 'security'
    ],
    navItems: [
      '/dashboard', '/dashboard/pacientes', '/dashboard/citas', 
      '/dashboard/historia-clinica', '/dashboard/recetario', 
      '/dashboard/medicamentos', '/dashboard/analiticas', '/dashboard/facturacion', 
      '/dashboard/servicios', '/dashboard/comunicacion', 
      '/dashboard/reportes', '/dashboard/configuracion', 
      '/dashboard/seguridad'
    ]
  }
]

// Función para obtener permisos de un rol
export function getRolePermissions(role: UserRole): RolePermissions | undefined {
  return ROLE_PERMISSIONS.find(rp => rp.role === role)
}

// Función para verificar si un usuario tiene un permiso específico
export function hasPermission(userRole: UserRole, permissionId: string): boolean {
  const rolePermissions = getRolePermissions(userRole)
  return rolePermissions?.permissions.includes(permissionId) || false
}

// Función para obtener elementos de navegación permitidos
export function getNavItemsForRole(role: UserRole): string[] {
  const rolePermissions = getRolePermissions(role)
  return rolePermissions?.navItems || []
}

// Función para verificar acceso a una ruta específica
export function canAccessRoute(userRole: UserRole, route: string): boolean {
  // Cajera: solo /dashboard, /dashboard/caja y /dashboard/facturacion (excepto /nueva)
  if (userRole === 'cajera') {
    if (route.startsWith('/dashboard/facturacion/nueva')) return false
    return (route === '/dashboard' || route === '/dashboard/') ||
           route.startsWith('/dashboard/caja') ||
           route.startsWith('/dashboard/facturacion')
  }
  const navItems = getNavItemsForRole(userRole)
  return navItems.some(navItem => route.startsWith(navItem))
}

// Función para obtener permisos específicos por usuario
export function getUserSpecificPermissions(userEmail: string, userRole: UserRole): string[] {
  const basePermissions = getRolePermissions(userRole)?.permissions || []
  
  // Permisos específicos por usuario
  switch (userEmail) {
    case 'lorenpeguero12@gmail.com': // Loreleiby - acceso a recetario
      return [...basePermissions, 'prescriptions']
    default:
      return basePermissions
  }
}

// Función para obtener elementos de navegación específicos por usuario
export function getUserSpecificNavItems(userEmail: string, userRole: UserRole): string[] {
  const baseNavItems = getRolePermissions(userRole)?.navItems || []
  
  // Elementos específicos por usuario
  switch (userEmail) {
    case 'lorenpeguero12@gmail.com': // Loreleiby - acceso a recetario
      return [...baseNavItems, '/dashboard/recetario']
    default:
      return baseNavItems
  }
}
