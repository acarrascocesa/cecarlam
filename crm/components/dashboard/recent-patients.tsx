import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { useAppContext } from "@/context/app-context"

export function RecentPatients() {
  const { patients } = useAppContext()

  // Tomar los 4 pacientes más recientes
  const recentPatients = patients
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 4)

  // Función para obtener el color del badge según el status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Activo":
        return "default"
      case "Pendiente":
        return "outline"
      case "Inactivo":
        return "secondary"
      default:
        return "outline"
    }
  }

  if (recentPatients.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-mint-soft-100 rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-green-health-600" />
        </div>
        <p className="text-muted-foreground mb-4">No hay pacientes registrados en esta clínica.</p>
        <Button asChild className="bg-gradient-to-r from-gold-institutional-500 to-green-health-600 hover:from-gold-institutional-600 hover:to-green-health-700 text-white border-0 shadow-lg">
          <Link href="/dashboard/pacientes/nuevo">Agregar Paciente</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recentPatients.map((patient) => (
        <div
          key={patient.id}
          className="group relative overflow-hidden border border-mint-soft-200 rounded-lg p-3 sm:p-4 bg-gradient-to-r from-mint-soft-50 to-mint-soft-100 hover:from-mint-soft-100 hover:to-mint-soft-200 transition-all duration-300 hover:shadow-md"
        >
          <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-mint-soft-200 rounded-full -translate-y-6 translate-x-6 opacity-20 group-hover:opacity-30 transition-opacity"></div>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 justify-between relative z-10">
            <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
              <Avatar className="ring-2 ring-mint-soft-200 flex-shrink-0">
                <AvatarImage src={patient.image || "/placeholder.svg"} alt={patient.name} />
                <AvatarFallback className="bg-mint-soft-100 text-mint-soft-700 text-sm sm:text-base">
                  {patient.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link 
                  href={`/dashboard/pacientes/${patient.id}`} 
                  className="font-semibold text-mint-soft-900 hover:text-mint-soft-700 hover:underline transition-colors text-sm sm:text-base block break-words"
                >
                  {patient.name}
                </Link>
                <div className="flex items-center text-xs sm:text-sm text-mint-soft-600 mt-1">
                  <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                  <span className="break-all">{patient.email}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2 sm:space-y-1 flex-shrink-0">
              <Badge 
                variant={getBadgeVariant(patient.status)} 
                className="text-xs font-medium"
              >
                {patient.status}
              </Badge>
              <div className="flex items-center text-xs text-mint-soft-600">
                <Calendar className="mr-1 h-3 w-3" />
                <span>{new Date(patient.updatedAt).toLocaleDateString('es-ES')}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
