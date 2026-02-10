"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Calendar,
  FileText,
  DollarSign,
  MessageSquare,
  FileBarChart,
  Share2,
  FlaskConical,
  TestTube,
  Shield,
  Settings,
  BookUser,
  ChevronLeft,
  ChevronRight,
  Package,
  Heart,
  X,
  Menu,
  Banknote,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebar } from "@/context/sidebar-context"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/auth-context"
import { getUserSpecificNavItems } from "@/lib/permissions"

export const navItems = [
  { href: "/dashboard", icon: Home, label: "Inicio" },
  { href: "/dashboard/pacientes", icon: Users, label: "Pacientes" },
  { href: "/dashboard/citas", icon: Calendar, label: "Citas" },
  { href: "/dashboard/historia-clinica", icon: FileText, label: "Historia Clínica" },
  { href: "/dashboard/recetario", icon: BookUser, label: "Recetario" },
  { href: "/dashboard/medicamentos", icon: FlaskConical, label: "Medicamentos" },
  { href: "/dashboard/analiticas", icon: TestTube, label: "Analíticas" },
  { href: "/dashboard/facturacion", icon: DollarSign, label: "Facturación" },
  { href: "/dashboard/caja", icon: Banknote, label: "Caja" },
  { href: "/dashboard/servicios", icon: Package, label: "Servicios" },
  // { href: "/dashboard/referencias", icon: Share2, label: "Referencias" },
  { href: "/dashboard/comunicacion", icon: MessageSquare, label: "Comunicación" },
  { href: "/dashboard/reportes", icon: FileBarChart, label: "Reportes" },
  { href: "/dashboard/configuracion", icon: Settings, label: "Configuración" },
]

// Agrupar elementos por categorías lógicas del flujo médico
export const navGroups = [
  {
    title: "Atención Médica",
    items: navItems.slice(0, 7) // Inicio hasta Analíticas
  },
  {
    title: "Administración",
    items: navItems.slice(7, 11) // Facturación, Caja, Servicios
  },
  {
    title: "Sistema",
    items: navItems.slice(11) // Comunicación hasta Configuración
  }
]

// Componente para elementos de navegación
function NavItem({ item, isActive, isCollapsed, isMobile = false, onNavigate }: {
  item: typeof navItems[0]
  isActive: boolean
  isCollapsed: boolean
  isMobile?: boolean
  onNavigate?: () => void
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-4 rounded-xl px-3.5 py-3 text-sm font-medium text-green-health-700 transition-all duration-300 group relative hover:bg-white/60 hover:text-green-health-800 hover:shadow-md hover:shadow-gold-institutional-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-institutional-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-green-health-100",
              isActive && "bg-white text-green-health-800 shadow-lg shadow-gold-institutional-500/30 border border-gold-institutional-500/30 ring-1 ring-gold-institutional-500/20",
              isCollapsed && !isMobile && "justify-center px-3",
              isMobile && "py-4" // Más espacio para touch en móviles
            )}
          >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-gradient-to-b from-gold-institutional-500 via-gold-institutional-600 to-gold-institutional-700 rounded-r-full shadow-lg shadow-gold-institutional-500/50"></div>
            )}
            <item.icon className={cn(
              "transition-all duration-300 text-green-health-600 group-hover:text-gold-institutional-600",
              isCollapsed && !isMobile ? "h-5 w-5" : "h-5 w-5",
              isActive && "text-gold-institutional-600",
              "group-hover:scale-110 group-hover:rotate-3"
            )} />
            {(!isCollapsed || isMobile) && (
              <span className="font-medium truncate">{item.label}</span>
            )}
          </Link>
        </TooltipTrigger>
        {isCollapsed && !isMobile && (
          <TooltipContent side="right" className="bg-gradient-to-r from-gold-institutional-600 to-gold-institutional-700 text-white border-gold-institutional-400 shadow-lg shadow-gold-institutional-500/30">
            <p className="font-medium">{item.label}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

// Componente para el contenido del sidebar
function SidebarContent({ 
  isCollapsed, 
  toggleCollapsed, 
  isMobile = false, 
  onNavigate 
}: {
  isCollapsed: boolean
  toggleCollapsed?: () => void
  isMobile?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { user } = useAuth()
  
  // Obtener elementos de navegación permitidos para el usuario
  const allowedNavItems = user ? getUserSpecificNavItems(user.email, user.role) : []
  
  // Filtrar elementos de navegación según permisos
  const filteredNavItems = navItems.filter(item => 
    allowedNavItems.includes(item.href)
  )
  
  // Agrupar elementos filtrados
  const filteredNavGroups = [
    {
      title: "Atención Médica",
      items: filteredNavItems.slice(0, 6) // Inicio hasta Medicamentos
    },
    {
      title: "Administración",
      items: filteredNavItems.slice(6, 9) // Facturación hasta Referencias
    },
    {
      title: "Sistema",
      items: filteredNavItems.slice(9) // Comunicación hasta Configuración
    }
  ].filter(group => group.items.length > 0) // Solo mostrar grupos con elementos

  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      {/* Header del sidebar */}
      <div           className={cn(
            "flex items-center border-b border-green-health-200 px-4 lg:h-[70px] lg:px-6 justify-between bg-transparent",
            isMobile ? "h-16" : "h-16 lg:h-[70px]"
          )}>
        <Link href="/" className={cn(
          "flex items-center gap-3 font-bold transition-all hover:scale-105 group",
          isCollapsed && !isMobile ? "justify-center w-full" : "flex-1"
        )}>
          <div className={cn(
            "flex items-center justify-center rounded-xl bg-gradient-to-br from-gold-institutional-500 via-gold-institutional-600 to-gold-institutional-700 p-2 shadow-lg shadow-gold-institutional-500/25 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-gold-institutional-500/40 group-hover:scale-110 group-hover:rotate-3",
            isCollapsed && !isMobile ? "h-10 w-10" : "h-12 w-12"
          )}>
            <Heart className={cn(
              "text-gray-professional-500 transition-all duration-200",
              isCollapsed && !isMobile ? "h-5 w-5" : "h-6 w-6"
            )} />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-green-health-800 leading-tight whitespace-nowrap">CECARLAM</span>
              <span className="text-xs text-green-health-600 font-medium">Sistema Médico</span>
            </div>
          )}
        </Link>
        
        {/* Botón de cerrar para móviles - Se maneja automáticamente por el Sheet */}
        
        {/* Botón de colapsar para desktop */}
        {!isMobile && toggleCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            className={cn(
              "h-9 w-9 shrink-0 hover:bg-white/60 hover:text-gold-institutional-600 hover:shadow-md hover:shadow-gold-institutional-500/20 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-institutional-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-green-health-100 text-green-health-700",
              isCollapsed && "absolute right-2"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            ) : (
              <ChevronLeft className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            )}
          </Button>
        )}
      </div>

      {/* Navegación */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <nav className={cn(
          "flex flex-col gap-5",
          isMobile ? "px-4 py-6 pb-8" : "px-3 py-4"
        )}>
          {filteredNavGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              {(!isCollapsed || isMobile) && (
                <div className="px-3 py-2">
                  <h3 className="text-[11px] font-semibold text-green-health-600 uppercase tracking-wide">
                    {group.title}
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    isActive={pathname === item.href}
                    isCollapsed={isCollapsed}
                    isMobile={isMobile}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}

export function Sidebar() {
  const { isCollapsed, toggleCollapsed } = useSidebar()

  return (
    <>
      {/* Sidebar Desktop */}
      <div className={cn(
        "hidden border-r border-green-health-200 bg-gradient-to-b from-green-health-50 to-green-health-100 shadow-xl shadow-green-health-900/10 backdrop-blur-xl md:block transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent isCollapsed={isCollapsed} toggleCollapsed={toggleCollapsed} />
      </div>

      {/* Sidebar Móvil */}
      <Sheet>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            size="icon" 
            className="md:hidden fixed top-4 left-3 z-[60] h-10 w-10 bg-gradient-to-r from-white via-gray-50/50 to-white border border-gray-200/60 shadow-lg shadow-gray-200/50 backdrop-blur-xl hover:shadow-xl hover:scale-105 transition-all duration-200 sm:top-6 sm:left-4"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="left" 
          className="w-80 md:w-96 p-0 border-r-0 bg-gradient-to-b from-green-health-50 to-green-health-100 backdrop-blur-xl shadow-2xl shadow-green-health-900/10"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SidebarContent 
            isCollapsed={false} 
            isMobile={true} 
            onNavigate={() => {
              // Cerrar el sheet al navegar (se maneja automáticamente con el backdrop)
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
