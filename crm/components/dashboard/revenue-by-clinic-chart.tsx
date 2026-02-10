"use client"

import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"

interface RevenueByClinicChartProps {
  paymentMethodFilter?: string
  dateFrom?: string
  dateTo?: string
}

export function RevenueByClinicChart({ 
  paymentMethodFilter = "todos", 
  dateFrom, 
  dateTo 
}: RevenueByClinicChartProps) {
  const { invoices, clinics } = useAppContext()
  const { user: authUser } = useAuth()

  // Función para filtrar facturas según los criterios
  const filterInvoices = (invoices: any[]) => {
    return invoices.filter((invoice: any) => {
      // Filtro básico: solo facturas pagadas
      if (invoice.status !== "Pagada") return false
      
      // Filtro por método de pago
      if (paymentMethodFilter && paymentMethodFilter !== "todos") {
        const invoicePaymentMethod = invoice.payment_method || ""
        if (invoicePaymentMethod !== paymentMethodFilter) return false
      }
      
      // Filtro por rango de fechas
      if (dateFrom || dateTo) {
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
  }

  // Función para obtener ingresos por clínica con filtros aplicados
  const getRevenueByClinic = () => {
    const filteredInvoices = filterInvoices(invoices)
    const clinicRevenue: { [key: string]: number } = {}
    const clinicNames: { [key: string]: string } = {}
    let otherClinicsRevenue = 0

    // Obtener nombres de clínicas
    clinics.forEach((clinic: any) => {
      clinicNames[clinic.clinic_id] = clinic.clinic_name || 'Clínica sin nombre'
      // Inicializar todas las clínicas con 0 ingresos
      clinicRevenue[clinic.clinic_id] = 0
    })

    // Calcular ingresos por clínica usando facturas filtradas
    filteredInvoices.forEach((invoice: any) => {
      const clinicId = invoice.clinic_id || invoice.clinicId
      const amount = Number(invoice.total_services || invoice.totalServices || 0)
      
      // Buscar la clínica por clinic_id o por id
      let foundClinic = null
      if (clinicId) {
        foundClinic = clinics.find(clinic => 
          clinic.clinic_id === clinicId || clinic.id === clinicId
        )
      }
      
      if (foundClinic) {
        // Usar clinic_id de la clínica encontrada
        const targetClinicId = foundClinic.clinic_id
        if (clinicRevenue.hasOwnProperty(targetClinicId)) {
          clinicRevenue[targetClinicId] += amount
        } else {
          // Si no está inicializada, agregarla
          clinicRevenue[targetClinicId] = amount
          clinicNames[targetClinicId] = foundClinic.clinic_name
        }
      } else if (clinicId) {
        // Clínica no encontrada pero tiene ID, agregar a "Otras Clínicas"
        otherClinicsRevenue += amount
      } else {
        // Sin clinic_id, agregar a "Otras Clínicas"
        otherClinicsRevenue += amount
      }
    })

    // Convertir a array y ordenar por ingresos
    let sortedData = Object.entries(clinicRevenue)
      .map(([clinicId, total]) => ({
        clinicId,
        name: clinicNames[clinicId] || 'Clínica desconocida',
        total
      }))
      .sort((a, b) => b.total - a.total)

    // Agregar "Otras Clínicas" si hay ingresos
    if (otherClinicsRevenue > 0) {
      sortedData.push({
        clinicId: 'other',
        name: 'Otras Clínicas',
        total: otherClinicsRevenue
      })
      // Reordenar para mantener el orden por ingresos
      sortedData.sort((a, b) => b.total - a.total)
    }

    return sortedData
  }

  const data = getRevenueByClinic()
  const maxValue = Math.max(...data.map(d => d.total), 1) // Mínimo 1 para evitar división por cero
  const formatCurrency = (value: number) => `RD$ ${value.toLocaleString()}`

  // Colores para las clínicas - Paleta CECARLAM
  const getClinicColor = (index: number) => {
    const colors = [
      'from-gold-institutional-600 to-gold-institutional-500',
      'from-green-health-600 to-green-health-500', 
      'from-green-light-600 to-green-light-500',
      'from-gold-institutional-500 to-gold-institutional-400',
      'from-green-health-500 to-green-health-400',
      'from-green-light-500 to-green-light-400',
      'from-gold-institutional-700 to-gold-institutional-600',
      'from-green-health-700 to-green-health-600'
    ]
    return colors[index % colors.length]
  }

  // Si no hay datos, mostrar estado vacío
  if (data.length === 0) {
    return (
      <div className="w-full h-[350px] flex flex-col items-center justify-center">
        <div className="w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-gray-800 text-center">No hay ingresos registrados</p>
        <p className="text-xs text-gray-600 text-center mt-2">Los datos aparecerán cuando se registren facturas pagadas</p>
      </div>
    )
  }

  return (
    <div className="w-full h-[350px] flex flex-col">
      <div className="flex-1 flex flex-col gap-3 px-2 sm:px-4 pb-4 overflow-y-auto">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.total / maxValue) * 100 : 0
          const barWidth = Math.max(percentage, 5) // Mínimo 5% para visibilidad
          
          return (
            <div key={item.clinicId} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="font-medium text-gray-800 truncate pr-2">
                  {item.name}
                </span>
                <span className="font-semibold text-gray-900 whitespace-nowrap">
                  {formatCurrency(item.total)}
                </span>
              </div>
              <div className="relative w-full h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${getClinicColor(index)} rounded-full transition-all duration-500 ease-out shadow-sm hover:shadow-md`}
                  style={{ width: `${barWidth}%` }}
                  title={`${item.name}: ${formatCurrency(item.total)} (${percentage.toFixed(1)}%)`}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Información adicional */}
      <div className="border-t pt-3 px-2 sm:px-4">
        <div className="flex justify-between items-center text-xs text-gray-600">
          <span className="font-medium">
            {authUser?.multiClinicView ? 'Total Multiclínicas' : 'Total Clínica'}
          </span>
          <span className="font-semibold text-gray-800">
            {formatCurrency(data.reduce((sum, item) => sum + item.total, 0))}
          </span>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {data.length} {data.length === 1 ? 'clínica' : 'clínicas'} con ingresos
        </div>
      </div>
    </div>
  )
}
