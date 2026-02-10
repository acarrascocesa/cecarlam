"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, Calendar, DollarSign, Users, Database, Shield, Smartphone, BarChart3 } from "lucide-react"

export default function InvoiceProposal() {
  const projectDetails = {
    projectName: "Sistema CRM Médico - Médicos RD",
    client: "Clínica/Consultorio Médico",
    totalAmount: 2000,
    initialPayment: 800, // 40%
    finalPayment: 1200, // 60%
    deliveryTime: "2 meses",
    startDate: "Enero 2024",
    deliveryDate: "Marzo 2024",
  }

  const features = [
    {
      icon: Users,
      title: "Gestión de Pacientes",
      description: "Registro completo, historial médico, datos de contacto y seguimiento",
    },
    {
      icon: Calendar,
      title: "Sistema de Citas",
      description: "Programación, recordatorios automáticos y gestión de horarios",
    },
    {
      icon: Database,
      title: "Historia Clínica Digital",
      description: "Expedientes médicos digitales, diagnósticos y prescripciones",
    },
    {
      icon: DollarSign,
      title: "Facturación Integrada",
      description: "Generación de facturas, control de pagos y reportes financieros",
    },
    {
      icon: BarChart3,
      title: "Reportes y Analytics",
      description: "Dashboard con métricas, reportes de ingresos y estadísticas",
    },
    {
      icon: Smartphone,
      title: "Diseño Responsivo",
      description: "Acceso desde cualquier dispositivo: PC, tablet o móvil",
    },
    {
      icon: Shield,
      title: "Seguridad y Privacidad",
      description: "Cumplimiento con normativas médicas y protección de datos",
    },
  ]

  const deliverables = [
    "Sistema web completo y funcional",
    "Panel de administración intuitivo",
    "Base de datos optimizada",
    "Documentación técnica",
    "Manual de usuario",
    "Capacitación del personal (2 sesiones)",
    "Soporte técnico por 30 días",
    "Hosting y dominio por 1 año incluido",
  ]

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-clinical-50 to-mint-soft-50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-900">Propuesta de Desarrollo</CardTitle>
          <CardDescription className="text-lg text-blue-700">{projectDetails.projectName}</CardDescription>
        </CardHeader>
      </Card>

      {/* Project Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Cronograma del Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium">Tiempo de desarrollo:</span>
              <Badge variant="outline" className="bg-blue-50">
                {projectDetails.deliveryTime}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Fecha de inicio:</span>
              <span>{projectDetails.startDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Fecha de entrega:</span>
              <span className="font-semibold text-green-600">{projectDetails.deliveryDate}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Inversión del Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Inversión total:</span>
              <span className="text-green-600">${projectDetails.totalAmount.toLocaleString()} USD</span>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Pago inicial (40%):</span>
                <span className="font-semibold">${projectDetails.initialPayment.toLocaleString()} USD</span>
              </div>
              <div className="flex justify-between">
                <span>Pago final (60%):</span>
                <span className="font-semibold">${projectDetails.finalPayment.toLocaleString()} USD</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Incluidas</CardTitle>
          <CardDescription>Sistema completo de gestión médica con todas las herramientas necesarias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg border bg-gray-50">
                <feature.icon className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle>Entregables del Proyecto</CardTitle>
          <CardDescription>Todo lo que recibirá al finalizar el desarrollo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {deliverables.map((deliverable, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{deliverable}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">Términos y Condiciones</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700 space-y-2">
          <p>• El pago inicial del 40% se requiere para comenzar el desarrollo</p>
          <p>• El 60% restante se paga contra entrega del sistema completo y funcional</p>
          <p>• Incluye revisiones y ajustes durante el desarrollo</p>
          <p>• Soporte técnico gratuito por 30 días después de la entrega</p>
          <p>• Capacitación incluida para hasta 5 usuarios del sistema</p>
          <p>• Código fuente y documentación incluidos</p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="text-center bg-gradient-to-r from-blue-clinical-600 to-mint-soft-600 text-white">
        <CardContent className="pt-6">
          <h3 className="text-xl font-bold mb-2">¿Listo para comenzar?</h3>
          <p className="mb-4">Transforme su práctica médica con tecnología de vanguardia</p>
          <div className="text-sm opacity-90">
            <p>Esta propuesta es válida por 30 días</p>
            <p>Contacto: desarrollo@medicosrd.com | +1 (809) 123-4567</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
