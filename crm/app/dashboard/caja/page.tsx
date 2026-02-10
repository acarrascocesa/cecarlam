"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Search, Banknote, CheckCircle, AlertCircle, User, DollarSign, CreditCard, Banknote as BanknoteIcon } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useAppContext } from "@/context/app-context"

export default function CajaPage() {
  const { invoices, updateInvoice } = useAppContext()
  const [searchTerm, setSearchTerm] = useState("")

  const pendientes = invoices.filter((inv) => inv?.status === "Pendiente")
  const filtered = searchTerm
    ? pendientes.filter(
        (inv) =>
          inv.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          inv.insurance_provider?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : pendientes

  const getInitials = (name: string) => {
    const names = (name || "").split(" ")
    if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    return (name || "P")[0].toUpperCase()
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Banknote className="h-8 w-8 text-green-600" />
          Caja
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Facturas pendientes de cobro. Haga clic en una factura para registrar el pago.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Facturas pendientes</CardTitle>
          <CardDescription>
            {pendientes.length} factura{pendientes.length !== 1 ? "s" : ""} por cobrar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por paciente o ARS..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <p className="font-medium">
                {pendientes.length === 0
                  ? "No hay facturas pendientes de cobro"
                  : "No se encontraron facturas con ese criterio"}
              </p>
              {pendientes.length === 0 && (
                <p className="text-sm mt-1">
                  Las facturas creadas con estado &quot;Pendiente&quot; aparecerán aquí.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((inv) => (
                <Link key={inv.id} href={`/dashboard/facturacion/${inv.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold">
                        {getInitials(inv.patient_name)}
                      </div>
                      <div>
                        <p className="font-medium">{inv.patient_name || "Paciente"}</p>
                        <p className="text-sm text-muted-foreground">
                          {inv.invoice_date
                            ? format(new Date(inv.invoice_date), "dd MMM yyyy", { locale: es })
                            : ""}
                          {inv.insurance_provider && ` · ${inv.insurance_provider}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        RD$ {(Number(inv.patient_pays) || 0).toLocaleString()}
                      </p>
                      <Badge variant="outline" className="mt-1">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Pendiente
                      </Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Al hacer clic en una factura, podrá cambiar el estado a &quot;Pagada&quot; y registrar el método de pago.
      </p>
    </div>
  )
}
