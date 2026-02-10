"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppointmentsOverview } from "@/components/dashboard/appointments-overview"
import { RecentPatients } from "@/components/dashboard/recent-patients"
import { RevenueByClinicChart } from "@/components/dashboard/revenue-by-clinic-chart"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { DollarSign, Users, Calendar, Activity, Stethoscope, CheckCircle, Filter, CreditCard, Banknote } from "lucide-react"
import { useState } from "react"

// Funciones de cálculo para datos reales
const calculatePatientPaymentsByMethod = (invoices: any[], paymentMethodFilter?: string, dateFrom?: string, dateTo?: string) => {
  const filteredInvoices = invoices.filter((invoice: any) => {
    // SOLO facturas con estado "Pagada"
    if (invoice.status !== "Pagada") return false;

    // Obtener la fecha de la factura para filtros de fecha
    const invoiceDate = invoice.invoice_date || invoice.invoiceDate;

    if (dateFrom || dateTo) {
      let parsedDate;

      if (!invoiceDate) return false;

      // Parsear fecha
      if (invoiceDate instanceof Date) {
        parsedDate = invoiceDate;
      } else if (typeof invoiceDate === 'string') {
        if (invoiceDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = invoiceDate.split('-').map(Number);
          parsedDate = new Date(year, month - 1, day, 12, 0, 0, 0);
        } else if (invoiceDate.includes('T')) {
          const dateOnly = invoiceDate.split('T')[0];
          const [year, month, day] = dateOnly.split('-').map(Number);
          parsedDate = new Date(year, month - 1, day, 12, 0, 0, 0);
        } else {
          parsedDate = new Date(invoiceDate);
        }
      } else {
        parsedDate = new Date(invoiceDate);
      }

      // Aplicar filtros de fecha
      if (dateFrom && dateTo) {
        const fromDate = new Date(dateFrom + 'T00:00:00')
        const toDate = new Date(dateTo + 'T23:59:59')
        if (parsedDate < fromDate || parsedDate > toDate) return false
      } else if (dateFrom) {
        const fromDate = new Date(dateFrom + 'T00:00:00')
        if (parsedDate < fromDate) return false
      } else if (dateTo) {
        const toDate = new Date(dateTo + 'T23:59:59')
        if (parsedDate > toDate) return false
      }
    }

    return true
  })

  // Calcular SOLO lo que pagaron los pacientes (patient_pays)
  const efectivo = filteredInvoices
    .filter(inv => inv.payment_method === "Efectivo")
    .reduce((sum, inv) => {
      const patientPays = Number(inv.patient_pays || 0);
      return sum + patientPays;
    }, 0)

  const transferencia = filteredInvoices
    .filter(inv => inv.payment_method === "Transferencia")
    .reduce((sum, inv) => {
      const patientPays = Number(inv.patient_pays || 0);
      return sum + patientPays;
    }, 0)

  const total = efectivo + transferencia

  return {
    efectivo: {
      amount: efectivo,
      percentage: total > 0 ? Math.round((efectivo / total) * 100) : 0
    },
    transferencia: {
      amount: transferencia,
      percentage: total > 0 ? Math.round((transferencia / total) * 100) : 0
    },
    total
  }
}

const calculateTotalRevenue = (invoices: any[], paymentMethodFilter?: string, dateFrom?: string, dateTo?: string) => {
  return invoices
    .filter((invoice: any) => {
      // Obtener la fecha de la factura - múltiples formatos posibles
      const invoiceDate = invoice.invoice_date || invoice.invoiceDate;
      let parsedDate;

      if (!invoiceDate) return false;

      // Si ya es un objeto Date
      if (invoiceDate instanceof Date) {
        parsedDate = invoiceDate;
      } else if (typeof invoiceDate === 'string') {
        // Si es string, convertir a Date
        if (invoiceDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          const [year, month, day] = invoiceDate.split('-').map(Number);
          parsedDate = new Date(year, month - 1, day, 12, 0, 0, 0);
        } else if (invoiceDate.includes('T')) {
          const dateOnly = invoiceDate.split('T')[0];
          const [year, month, day] = dateOnly.split('-').map(Number);
          parsedDate = new Date(year, month - 1, day, 12, 0, 0, 0);
        } else {
          parsedDate = new Date(invoiceDate);
        }
      } else {
        parsedDate = new Date(invoiceDate);
      }

      // Filtro básico: solo facturas pagadas
      if (invoice.status !== "Pagada") return false;

      // Filtro por método de pago
      if (paymentMethodFilter && paymentMethodFilter !== "todos") {
        const invoicePaymentMethod = invoice.payment_method || ""
        if (invoicePaymentMethod !== paymentMethodFilter) return false;
      }

      // Filtro por rango de fechas
      if (dateFrom || dateTo) {
        if (dateFrom && dateTo) {
          // Rango de fechas
          const fromDate = new Date(dateFrom + 'T00:00:00')
          const toDate = new Date(dateTo + 'T23:59:59')

          if (parsedDate < fromDate || parsedDate > toDate) return false
        } else if (dateFrom) {
          // Solo fecha "desde"
          const fromDate = new Date(dateFrom + 'T00:00:00')
          if (parsedDate < fromDate) return false
        } else if (dateTo) {
          // Solo fecha "hasta"
          const toDate = new Date(dateTo + 'T23:59:59')
          if (parsedDate > toDate) return false
        }
      }

      return true
    })
    .reduce((sum: number, invoice: any) => sum + Number(invoice.total_services || invoice.totalServices || 0), 0)
}

const calculatePreviousMonthRevenue = (invoices: any[]) => {
  const previousMonth = new Date().getMonth() - 1
  const currentYear = new Date().getFullYear()

  return invoices
    .filter((invoice: any) => {
      const invoiceDate = new Date(invoice.invoice_date || invoice.invoiceDate)
      return invoice.status === "Pagada" &&
        invoiceDate.getMonth() === previousMonth &&
        invoiceDate.getFullYear() === currentYear
    })
    .reduce((sum: number, invoice: any) => sum + Number(invoice.total_services || invoice.totalServices || 0), 0)
}

const calculateActivePatients = (patients: any[]) => {
  return patients.filter((p: any) => p.status === "Activo").length
}

const calculatePendingAppointments = (appointments: any[]) => {
  return appointments.filter((a: any) => a.status === "Pendiente").length
}

const calculateAttendanceRate = (appointments: any[]) => {
  const completed = appointments.filter((a: any) => a.status === "Completada").length
  const total = appointments.filter((a: any) =>
    a.status === "Completada" || a.status === "Cancelada"
  ).length

  return total > 0 ? Math.round((completed / total) * 100) : 0
}

const calculatePreviousMonthAttendanceRate = (appointments: any[]) => {
  const previousMonth = new Date().getMonth() - 1
  const currentYear = new Date().getFullYear()

  const previousMonthAppointments = appointments.filter((a: any) => {
    const appointmentDate = new Date(a.appointment_date || a.date)
    return appointmentDate.getMonth() === previousMonth &&
      appointmentDate.getFullYear() === currentYear
  })

  const completed = previousMonthAppointments.filter((a: any) => a.status === "Completada").length
  const total = previousMonthAppointments.filter((a: any) =>
    a.status === "Completada" || a.status === "Cancelada"
  ).length

  return total > 0 ? Math.round((completed / total) * 100) : 0
}

export default function DashboardPage() {
  const { patients, appointments, invoices } = useAppContext()
  const { user: authUser } = useAuth()
  const router = useRouter()

  // La cajera debe ir directo a Caja, no al dashboard general
  useEffect(() => {
    if (authUser?.role === "cajera") {
      router.replace("/dashboard/caja")
    }
  }, [authUser?.role, router])

  // Estados para filtros
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("todos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  // Calcular métricas reales
  const totalRevenue = calculateTotalRevenue(invoices, paymentMethodFilter, dateFrom, dateTo)
  const patientPayments = calculatePatientPaymentsByMethod(invoices, paymentMethodFilter, dateFrom, dateTo)
  const previousMonthRevenue = calculatePreviousMonthRevenue(invoices)
  const revenueChange = previousMonthRevenue > 0
    ? ((totalRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
    : 0

  const activePatients = calculateActivePatients(patients)
  const pendingAppointments = calculatePendingAppointments(appointments)
  const attendanceRate = calculateAttendanceRate(appointments)
  const previousAttendanceRate = calculatePreviousMonthAttendanceRate(appointments)
  const attendanceChange = previousAttendanceRate > 0
    ? attendanceRate - previousAttendanceRate
    : 0

  if (authUser?.role === "cajera") {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Redirigiendo a Caja...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 overflow-hidden max-w-9xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Vista general de su clínica médica</p>
        </div>

        {/* Filtros de Ingresos - Responsivos */}
        <div className="flex flex-col gap-3 sm:gap-2">
          {/* Título de filtros */}
          <div className="flex items-center gap-2 sm:hidden">
            <Filter className="h-4 w-4 text-green-health-600" />
            <Label className="text-sm font-medium text-green-health-700">Filtros de Ingresos</Label>
          </div>

          {/* Título en desktop, oculto en móvil */}
          <div className="hidden sm:flex items-center gap-2">
            <Filter className="h-4 w-4 text-green-health-600" />
            <Label className="text-sm font-medium text-green-health-700 whitespace-nowrap">Filtros de Ingresos:</Label>
          </div>

          {/* Contenedor de filtros */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            {/* Filtro Método de Pago */}
            <div className="flex items-center gap-2">
              <Label className="text-xs text-gray-600 whitespace-nowrap w-12 sm:w-auto">Método:</Label>
              <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                <SelectTrigger className="h-8 flex-1 sm:w-32 text-xs border-gray-200 focus:border-gold-institutional-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-xs">Todos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Efectivo">
                    <div className="flex items-center gap-1">
                      <Banknote className="h-3 w-3" />
                      <span className="text-xs">Efectivo</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Transferencia">
                    <div className="flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      <span className="text-xs">Transferencia</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtros de Fecha en una fila en móvil */}
            <div className="flex gap-2 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <Label className="text-xs text-gray-600 whitespace-nowrap w-12 sm:w-auto">Desde:</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-8 flex-1 sm:w-36 text-xs border-gray-200 focus:border-gold-institutional-400 px-2 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:ml-0"
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <Label className="text-xs text-gray-600 whitespace-nowrap w-10 sm:w-auto">Hasta:</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-8 flex-1 sm:w-36 text-xs border-gray-200 focus:border-gold-institutional-400 px-2 [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:ml-0"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-gold-institutional-50 to-gold-institutional-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gold-institutional-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium text-gold-institutional-800">Ingresos Totales</CardTitle>
            <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5 text-gold-institutional-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-lg sm:text-2xl font-bold text-gold-institutional-900">RD$ {totalRevenue.toLocaleString()}</div>
            <p className={`text-xs ${revenueChange >= 0 ? 'text-green-health-600' : 'text-red-600'}`}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-health-50 to-green-health-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-health-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-health-800">Pagos de Pacientes</CardTitle>
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-green-health-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-green-health-900">RD$ {patientPayments.total.toLocaleString()}</div>
            <div className="flex items-center justify-between text-xs mt-1">
              <div className="flex items-center gap-1">
                <span className="text-green-health-700 font-medium">Efectivo:</span>
                <span className="text-green-health-700">RD$ {patientPayments.efectivo.amount.toLocaleString()}</span>
                <span className="text-green-health-600">({patientPayments.efectivo.percentage}%)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <span className="text-gold-institutional-700 font-medium">Transferencia:</span>
                <span className="text-gold-institutional-700">RD$ {patientPayments.transferencia.amount.toLocaleString()}</span>
                <span className="text-gold-institutional-600">({patientPayments.transferencia.percentage}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-green-light-50 to-green-light-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-light-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-health-800">Pacientes Activos</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-health-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-lg sm:text-2xl font-bold text-green-health-900">{activePatients}</div>
            <p className="text-xs text-green-health-600">Pacientes en tratamiento</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-gold-institutional-50 to-gold-institutional-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gold-institutional-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium text-gold-institutional-800">Citas Pendientes</CardTitle>
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gold-institutional-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-lg sm:text-2xl font-bold text-gold-institutional-900">{pendingAppointments}</div>
            <p className="text-xs text-gold-institutional-600">Por confirmar</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-cream-warm-50 to-cream-warm-100 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-cream-warm-200 rounded-full -translate-y-10 translate-x-10 opacity-20"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-professional-800">Tasa de Asistencia</CardTitle>
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-health-600" />
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-lg sm:text-2xl font-bold text-gray-professional-900">{attendanceRate}%</div>
            <p className={`text-xs ${attendanceChange >= 0 ? 'text-green-health-600' : 'text-red-600'}`}>
              {attendanceChange >= 0 ? '+' : ''}{attendanceChange}% vs mes anterior
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2 relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-cream-warm-50/80 to-green-health-50/80 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-health-200/30 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-base sm:text-lg text-green-health-800">
              {authUser?.multiClinicView ? 'Ingresos por Clínicas' : 'Ingresos de la Clínica'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2 relative z-10">
            <RevenueByClinicChart
              paymentMethodFilter={paymentMethodFilter}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-cream-warm-50/80 to-green-health-50/80 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-health-200/30 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-base sm:text-lg text-green-health-800">Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <UpcomingAppointments />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
        <Card className="lg:col-span-2 xl:col-span-2 relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-cream-warm-50/80 to-green-health-50/80 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-health-200/30 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-base sm:text-lg text-green-health-800">Pacientes Recientes</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <RecentPatients />
          </CardContent>
        </Card>
        <Card className="lg:col-span-1 xl:col-span-2 relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-cream-warm-50/80 to-green-health-50/80 hover:shadow-xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-health-200/30 rounded-full -translate-y-16 translate-x-16 opacity-10"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-base sm:text-lg text-green-health-800">Resumen de Consultas</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <AppointmentsOverview />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
