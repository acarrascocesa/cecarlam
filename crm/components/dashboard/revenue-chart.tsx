"use client"

import { useAppContext } from "@/context/app-context"

export function RevenueChart() {
  const { invoices } = useAppContext()

  // Función para obtener ingresos por mes usando datos reales
  const getRevenueByMonth = () => {
    const currentYear = new Date().getFullYear()
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      name: new Date(currentYear, i).toLocaleDateString('es-ES', { month: 'short' }),
      total: 0
    }))

    invoices.forEach((invoice: any) => {
      if (invoice.status === "Pagada") {
        const invoiceDate = new Date(invoice.invoice_date || invoice.invoiceDate)
        const month = invoiceDate.getMonth()
        const year = invoiceDate.getFullYear()
        
        if (year === currentYear) {
          monthlyData[month].total += invoice.total_services || invoice.totalServices || 0
        }
      }
    })

    return monthlyData
  }

  const data = getRevenueByMonth()
  const maxValue = Math.max(...data.map(d => d.total))
  const formatCurrency = (value: number) => `RD$ ${value.toLocaleString()}`

  return (
    <div className="w-full h-[350px] flex flex-col">
      <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 px-2 sm:px-4 pb-4">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.total / maxValue) * 100 : 0
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative w-full">
                <div
                  className="bg-gradient-to-t from-green-health-600/90 to-gold-institutional-500/90 rounded-t-sm transition-all duration-300 hover:from-green-health-700/95 hover:to-gold-institutional-600/95 cursor-pointer shadow-sm shadow-green-health-200/30 hover:shadow-md hover:shadow-green-health-300/40"
                  style={{ height: `${height}%` }}
                  title={`${item.name}: ${formatCurrency(item.total)}`}
                />
              </div>
              <span className="text-xs text-muted-foreground mt-2 font-medium">{item.name}</span>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground px-2 sm:px-4 font-medium">
        <span>RD$ 0</span>
        <span>{formatCurrency(maxValue)}</span>
      </div>
    </div>
  )
}
