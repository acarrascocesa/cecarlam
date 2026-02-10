"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/app-context"
import { useAuth } from "@/context/auth-context"
import { useRealClinics } from "@/hooks/useRealClinics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  FileText, 
  Trash, 
  Plus,
  CheckCircle,
  AlertCircle,
  Phone,
  Printer,
  Download,
  CreditCard,
  Banknote,
  Building,
  Shield,
  Package,
  Save,
  Eye,
  Edit,
  History,
  Info
} from "lucide-react"
import Link from "next/link"
import { use } from "react"
import { getCurrentDateISO } from "@/lib/utils"

export default function InvoiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { invoices, updateInvoice, deleteInvoice } = useAppContext()
  const { user } = useAuth()
  const canDeleteInvoice = user?.role !== "cajera"
  const router = useRouter()
  const { toast } = useToast()
  const { clinics } = useRealClinics()

  // Desenvolver los params usando React.use()
  const { id } = use(params)

  // Estados principales
  const [invoice, setInvoice] = useState<any | null>(null)
  const [status, setStatus] = useState<"Pagada" | "Pendiente" | "Parcial" | "Rechazada">("Pendiente")
  const [notes, setNotes] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [totalServices, setTotalServices] = useState(0)
  const [insuranceCovers, setInsuranceCovers] = useState(0)
  const [patientPays, setPatientPays] = useState(0)
  const [items, setItems] = useState<any[]>([])
  const [paymentMethod, setPaymentMethod] = useState("")
  const [authorizationNumber, setAuthorizationNumber] = useState("")
  
  // Estados de UX
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalData, setOriginalData] = useState<any>(null)
  const [editingItems, setEditingItems] = useState<{[key: number]: boolean}>({})

  // Función para verificar si hay cambios
  const checkForChanges = () => {
    if (!originalData) return false
    
    return (
      status !== originalData.status ||
      notes !== (originalData.notes || "") ||
      invoiceDate !== originalData.invoice_date ||
      totalServices !== originalData.total_services ||
      insuranceCovers !== originalData.insurance_covers ||
      patientPays !== originalData.patient_pays ||
      paymentMethod !== (originalData.payment_method || "no-especificado") ||
      authorizationNumber !== (originalData.authorization_number || "") ||
      JSON.stringify(items) !== JSON.stringify(originalData.items)
    )
  }

  // Función para obtener iniciales del nombre y apellido
  const getInitials = (name: string) => {
    if (!name || name === 'Paciente') return 'P'
    const names = name.split(' ')
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  // Funciones para editar servicios
  const toggleEditItem = (index: number) => {
    setEditingItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Calcular patientPays automáticamente cuando cambia unit_price, amount o insurance_covers
    if (field === 'unit_price' || field === 'amount' || field === 'insurance_covers') {
      const unitPrice = Number(newItems[index].unit_price ?? newItems[index].amount) || 0
      const insuranceCovers = Number(newItems[index].insurance_covers) || 0
      newItems[index].patient_pays = Math.max(0, unitPrice - insuranceCovers)
    }
    
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const addItem = () => {
    const newItem = {
      description: "",
      unit_price: 0,
      amount: 0,
      insurance_covers: 0,
      patient_pays: 0,
      authorization_number: ""
    }
    setItems([...items, newItem])
  }

  useEffect(() => {
    const normalizeItem = (item: any) => ({
      ...item,
      unit_price: item.unit_price ?? item.amount ?? 0,
      amount: item.amount ?? item.unit_price ?? 0
    })
    const foundInvoice = invoices.find((inv) => inv.id === id)
    if (foundInvoice) {
      const rawItems = foundInvoice.items || []
      const normItems = rawItems.map(normalizeItem)
      setInvoice(foundInvoice)
      setStatus(foundInvoice.status || "Pendiente")
      setNotes(foundInvoice.notes || "")
      setInvoiceDate(foundInvoice.invoice_date ? new Date(foundInvoice.invoice_date).toISOString().split('T')[0] : "")
      setTotalServices(foundInvoice.total_services || 0)
      setInsuranceCovers(foundInvoice.insurance_covers || 0)
      setPatientPays(foundInvoice.patient_pays || 0)
      setItems(normItems)
      setPaymentMethod(foundInvoice.payment_method || "no-especificado")
      setAuthorizationNumber(foundInvoice.authorization_number || "")
      setOriginalData({
        status: foundInvoice.status || "Pendiente",
        notes: foundInvoice.notes || "",
        invoice_date: foundInvoice.invoice_date ? new Date(foundInvoice.invoice_date).toISOString().split('T')[0] : "",
        total_services: foundInvoice.total_services || 0,
        insurance_covers: foundInvoice.insurance_covers || 0,
        patient_pays: foundInvoice.patient_pays || 0,
        payment_method: foundInvoice.payment_method || "no-especificado",
        authorization_number: foundInvoice.authorization_number || "",
        items: normItems
      })
    }
  }, [invoices, id])

  // Verificar cambios cuando cambian los valores
  useEffect(() => {
    setHasChanges(checkForChanges())
  }, [status, notes, invoiceDate, totalServices, insuranceCovers, patientPays, paymentMethod, authorizationNumber, items, originalData])

  const handleUpdate = async () => {
    if (!invoice || !hasChanges) {
      toast({
        title: "Sin cambios",
        description: "No hay cambios para guardar",
        variant: "default"
      })
      return
    }

    setIsUpdating(true)

    try {
      const itemsPayload = items.map((item) => ({
        id: item.id,
        serviceId: item.service_id ?? item.serviceId,
        description: item.description,
        totalPrice: Number(item.unit_price ?? item.amount) || 0,
        amount: Number(item.unit_price ?? item.amount) || 0,
        insuranceCovers: Number(item.insurance_covers) || 0,
        patientPays: Number(item.patient_pays) || 0,
        authorizationNumber: item.authorization_number || null
      }))
      const updatedInvoiceData = {
        ...invoice,
        status,
        notes,
        invoice_date: invoiceDate + 'T12:00:00.000Z',
        total_services: totalServices,
        insurance_covers: insuranceCovers,
        patient_pays: patientPays,
        paymentMethod: paymentMethod === "no-especificado" ? "" : paymentMethod,
        authorization_number: authorizationNumber || null,
        items: itemsPayload,
        payment_date: status === "Pagada" ? getCurrentDateISO() + 'T12:00:00.000Z' : undefined
      }

      await updateInvoice(invoice.id, updatedInvoiceData)
      
      // Actualizar datos originales
      const newOriginalData = {
        status,
        notes,
        invoice_date: invoiceDate,
        total_services: totalServices,
        insurance_covers: insuranceCovers,
        patient_pays: patientPays,
        payment_method: paymentMethod,
        authorization_number: authorizationNumber,
        items: items
      }
      
      setOriginalData(newOriginalData)
      setHasChanges(false)
      
      toast({
        title: "✅ Factura actualizada exitosamente",
        description: `La factura ha sido actualizada. Fecha: ${invoiceDate}, Estado: ${status}`,
        variant: "default"
      })
    } catch (error) {
      console.error('Error actualizando factura:', error)
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar la factura. Intente nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!invoice || isDeleting) return
    
    setIsDeleting(true)
    try {
      await deleteInvoice(invoice.id)
      toast({
        title: "✅ Factura eliminada",
        description: "La factura ha sido eliminada correctamente",
        variant: "default"
      })
      router.push("/dashboard/facturacion")
    } catch (error) {
      console.error("Error eliminando factura:", error)
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar la factura. Intente nuevamente.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Función para obtener información del centro médico
  const getClinicInfo = () => {
    // Buscar la clínica asociada a la factura
    const clinic = clinics.find((c: any) => c.clinic_id === invoice.clinic_id)
    
    // Logo CECARLAM (url absoluta para que funcione en ventana de impresión)
    const cecarlamLogo = typeof window !== "undefined" ? `${window.location.origin}/logo.png` : "/logo.png"
    
    if (!clinic) {
      return {
        name: "CECARLAM",
        doctorName: "Dr. Médico",
        specialty: "Cardiología",
        address: "Dirección no especificada",
        phone: "Teléfono no especificado",
        email: "email@ejemplo.com",
        logo: cecarlamLogo,
        headerColor: "#dbeafe",
        textColor: "#1e3a8a"
      }
    }
    
    return {
      name: clinic.clinic_name || "CECARLAM",
      doctorName: clinic.doctor_name || "Dr. Médico",
      specialty: clinic.doctor_name?.toLowerCase().includes("linda") ? "Alergología" : "Cardiología",
      address: clinic.clinic_address || "Dirección no especificada",
      phone: clinic.clinic_phone || "Teléfono no especificado",
      email: clinic.clinic_email || "email@ejemplo.com",
      logo: cecarlamLogo,
      headerColor: "#dbeafe",
      textColor: "#1e3a8a"
    }
  }

  const handlePrint = () => {
    if (!invoice) return
    
    const clinicInfo = getClinicInfo()
    const printItems = items.length > 0 ? items : (invoice.items || [])
    
    // Crear el contenido HTML de la factura para imprimir
    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factura #${invoice.id} - ${clinicInfo.name}</title>
        <style>
          @media print {
            body { margin: 0; }
            .invoice-container { 
              width: 100%; 
              max-width: none; 
              margin: 0; 
              padding: 20px;
              box-shadow: none;
              border: 2px solid #ccc;
            }
            .no-print { display: none !important; }
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          
          .invoice-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border: 2px solid #ccc;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          
          .header {
            background: ${clinicInfo.headerColor};
            color: ${clinicInfo.textColor};
            padding: 30px 20px;
            text-align: center;
            border-bottom: 3px solid ${clinicInfo.textColor};
          }
          
          .clinic-logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 15px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .clinic-logo img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            border-radius: 8px;
          }
          
          .clinic-name {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .doctor-info {
            font-size: 16px;
            margin-bottom: 10px;
            opacity: 0.9;
          }
          
          .clinic-details {
            font-size: 14px;
            opacity: 0.8;
            margin-bottom: 15px;
          }
          
          .invoice-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .invoice-number {
            font-size: 16px;
            opacity: 0.9;
          }
          
          .content {
            padding: 30px;
          }
          
          .section {
            margin-bottom: 30px;
          }
          
          .section-title {
            font-size: 18px;
            font-weight: bold;
            color: ${clinicInfo.textColor};
            margin-bottom: 15px;
            border-bottom: 2px solid ${clinicInfo.textColor};
            padding-bottom: 5px;
          }
          
          .patient-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .info-item {
            margin-bottom: 10px;
          }
          
          .info-label {
            font-weight: bold;
            color: #374151;
          }
          
          .info-value {
            color: #6b7280;
          }
          
          .services-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          
          .services-table th,
          .services-table td {
            border: 1px solid #d1d5db;
            padding: 12px;
            text-align: left;
          }
          
          .services-table th {
            background: ${clinicInfo.headerColor};
            font-weight: bold;
            color: ${clinicInfo.textColor};
          }
          
          .summary {
            background: ${clinicInfo.headerColor};
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
            border: 2px solid ${clinicInfo.textColor};
          }
          
          .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            color: ${clinicInfo.textColor};
          }
          
          .summary-total {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            border-top: 2px solid ${clinicInfo.textColor};
            padding-top: 10px;
            margin-top: 10px;
          }
          
          .footer {
            background: ${clinicInfo.headerColor};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: ${clinicInfo.textColor};
            border-top: 1px solid ${clinicInfo.textColor};
          }
          
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${clinicInfo.textColor};
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .print-button:hover {
            opacity: 0.9;
          }
          
          @media print {
            .print-button { display: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-button no-print" onclick="window.print()">🖨️ Imprimir</button>
        
        <div class="invoice-container">
          <div class="header">
            <div class="clinic-logo">
              ${clinicInfo.logo ? `<img src="${clinicInfo.logo}" alt="${clinicInfo.doctorName} Logo" />` : `<div style="width: 100%; height: 100%; background: ${clinicInfo.textColor}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: bold;">${clinicInfo.doctorName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}</div>`}
            </div>
            <div class="clinic-name">${clinicInfo.name}</div>
            <div class="doctor-info">${clinicInfo.doctorName} - ${clinicInfo.specialty}</div>
            <div class="clinic-details">
              ${clinicInfo.address} | ${clinicInfo.phone} | ${clinicInfo.email}
            </div>
            <div class="invoice-title">FACTURA MÉDICA</div>
            <div class="invoice-number">#${invoice.id}</div>
          </div>
          
          <div class="content">
            <div class="section">
              <div class="section-title">Información del Paciente</div>
              <div class="patient-info">
                <div class="info-item">
                  <span class="info-label">Nombre:</span>
                  <span class="info-value">${invoice.patient_name || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">ID:</span>
                  <span class="info-value">${invoice.patient_id || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Fecha:</span>
                  <span class="info-value">${invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Estado:</span>
                  <span class="info-value">${invoice.status || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Método de Pago:</span>
                  <span class="info-value">${invoice.payment_method && invoice.payment_method !== 'no-especificado' ? invoice.payment_method : 'No especificado'}</span>
                </div>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">Servicios</div>
              <table class="services-table">
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Monto</th>
                    <th>Seguro Cubre</th>
                    <th>Paciente Paga</th>
                  </tr>
                </thead>
                <tbody>
                  ${printItems && printItems.length > 0 ? 
                    printItems.map((item: any) => `
                      <tr>
                        <td>${item.description || 'N/A'}</td>
                        <td>RD$ ${((item.unit_price ?? item.amount) || 0).toLocaleString()}</td>
                        <td>RD$ ${(item.insurance_covers || 0).toLocaleString()}</td>
                        <td>RD$ ${(item.patient_pays || 0).toLocaleString()}</td>
                      </tr>
                    `).join('') : 
                    '<tr><td colspan="4" style="text-align: center;">No hay servicios registrados</td></tr>'
                  }
                </tbody>
              </table>
            </div>
            
            <div class="summary">
              <div class="summary-row">
                <span>Total Servicios:</span>
                <span>RD$ ${(totalServices || invoice.total_services || 0).toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span>Seguro Cubre:</span>
                <span>RD$ ${((insuranceCovers ?? invoice.insurance_covers) || 0).toLocaleString()}</span>
              </div>
              <div class="summary-row summary-total">
                <span>Paciente Paga:</span>
                <span>RD$ ${((patientPays ?? invoice.patient_pays) || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>Esta factura fue generada automáticamente por el sistema HSALUD-PRO</p>
            <p><strong>${clinicInfo.name}</strong> - ${clinicInfo.doctorName}</p>
          </div>
        </div>
      </body>
      </html>
    `
    
    // Abrir nueva ventana con la factura
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (printWindow) {
      printWindow.document.write(invoiceHTML)
      printWindow.document.close()
    }
  }

  const handleDownloadPDF = () => {
    if (!invoice) return
    
    toast({
      title: "📄 Descarga PDF",
      description: "Función en desarrollo. Use la función de imprimir para guardar como PDF.",
      variant: "default"
    })
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="p-6 sm:p-8 bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200">
            <AlertCircle className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">Factura no encontrada</h2>
            <p className="text-slate-600 mb-6 text-sm sm:text-base">La factura que buscas no existe o ha sido eliminada.</p>
            <Button asChild className="text-sm sm:text-base">
              <Link href="/dashboard/facturacion">
                <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                Volver a Facturación
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pagada":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "Pendiente":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "Parcial":
        return <AlertCircle className="h-4 w-4 text-blue-500" />
      case "Rechazada":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pagada":
        return "default"
      case "Pendiente":
        return "outline"
      case "Parcial":
        return "secondary"
      case "Rechazada":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-8">
        {/* Header con diseño mejorado */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <Button variant="outline" size="icon" asChild className="rounded-full w-10 h-10 sm:w-auto sm:h-auto">
              <Link href="/dashboard/facturacion">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Factura #{invoice.id}</h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">Detalles y gestión de la factura</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Badge variant={getStatusBadgeVariant(invoice.status)} className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                {getStatusIcon(invoice.status)}
                <span className="ml-1">{invoice.status}</span>
              </Badge>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : 'Fecha no disponible'}
                </span>
                <span className="sm:hidden">
                  {invoice.invoice_date ? new Date(invoice.invoice_date).toLocaleDateString('es-ES', { 
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  }) : 'Fecha no disponible'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:gap-8 lg:grid-cols-3">
          {/* Panel Principal */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Información del Paciente */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                    <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-slate-900">Paciente</CardTitle>
                    <CardDescription className="text-sm">Información del paciente asociado</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
                    <AvatarFallback className="text-sm sm:text-xl font-medium bg-blue-100 text-blue-600">
                      {getInitials(invoice.patient_name || 'Paciente')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900">{invoice.patient_name || 'Paciente desconocido'}</h3>
                    <p className="text-slate-600 text-sm sm:text-base">ID: {invoice.patient_id || 'N/A'}</p>
                    {invoice.patient_phone && (
                      <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-slate-500">
                        <Phone className="h-3 w-3 sm:h-4 sm:w-4" />
                        {invoice.patient_phone}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Seguro */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-mint-soft-100 rounded-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-mint-soft-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-slate-900">Información del Seguro</CardTitle>
                    <CardDescription className="text-sm">Detalles de la cobertura médica</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(invoice.insurance_provider || invoice.policy_number || invoice.coverage_verified !== undefined) ? (
                  <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Proveedor</Label>
                      <p className="text-sm font-medium text-slate-900 mt-1">
                        {invoice.insurance_provider || "No especificado"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Número de Póliza</Label>
                      <p className="text-sm font-medium text-slate-900 mt-1">
                        {invoice.policy_number || "No especificado"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Estado de Verificación</Label>
                      <div className="flex items-center gap-2 mt-1">
                        {invoice.coverage_verified ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                        <span className="text-sm font-medium">
                          {invoice.coverage_verified ? "Verificada" : "Pendiente"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Verificada por</Label>
                      <p className="text-sm font-medium text-slate-900 mt-1">
                        {invoice.verified_by_name || "No especificado"}
                      </p>
                    </div>
                    {invoice.verification_notes && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-slate-700">Notas de Verificación</Label>
                        <p className="text-sm text-slate-600 mt-1 bg-slate-50 p-3 rounded-lg">
                          {invoice.verification_notes}
                        </p>
                      </div>
                    )}
                    

                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">No hay información de seguro registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Servicios - editables */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">Servicios</CardTitle>
                      <CardDescription>Editar servicios incluidos en la factura</CardDescription>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.length > 0 ? (
                    items.map((item: any, index: number) => (
                      <div key={item.id || index} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-slate-600">Servicio #{index + 1}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="sm:col-span-2">
                            <Label className="text-xs text-slate-600">Descripción</Label>
                            <Input
                              value={item.description || ""}
                              onChange={(e) => updateItem(index, 'description', e.target.value)}
                              placeholder="Descripción del servicio"
                              className="mt-1 h-9"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">Monto (RD$)</Label>
                            <Input
                              type="number"
                              value={item.unit_price ?? item.amount ?? 0}
                              onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value) || 0)}
                              className="mt-1 h-9"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">Seguro cubre (RD$)</Label>
                            <Input
                              type="number"
                              value={item.insurance_covers ?? 0}
                              onChange={(e) => updateItem(index, 'insurance_covers', Number(e.target.value) || 0)}
                              className="mt-1 h-9"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-slate-600">Paciente paga (RD$)</Label>
                            <Input
                              type="number"
                              value={item.patient_pays ?? 0}
                              onChange={(e) => updateItem(index, 'patient_pays', Number(e.target.value) || 0)}
                              className="mt-1 h-9"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <Label className="text-xs text-slate-600">Nº Autorización</Label>
                            <Input
                              value={item.authorization_number || ""}
                              onChange={(e) => updateItem(index, 'authorization_number', e.target.value)}
                              placeholder="Número de autorización del servicio"
                              className="mt-1 h-9"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                      <Package className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                      <p className="text-slate-500 mb-4">No hay servicios registrados</p>
                      <Button type="button" variant="outline" onClick={addItem}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar servicio
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-4 sm:space-y-6">
            {/* Resumen de Montos */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm sticky top-6">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-slate-900">Resumen</CardTitle>
                    <CardDescription className="text-sm">Totales de la factura</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 text-sm sm:text-base">Total Servicios</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-blue-700">
                    RD$ {(totalServices || 0).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 sm:p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900 text-sm sm:text-base">Seguro Cubre</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-green-700">
                    RD$ {(insuranceCovers || 0).toLocaleString()}
                  </p>
                </div>

                <div className="p-3 sm:p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-900 text-sm sm:text-base">Paciente Paga</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-orange-700">
                    RD$ {(patientPays || 0).toLocaleString()}
                  </p>
                </div>

                {/* Método de Pago */}
                <div className="p-3 sm:p-4 border border-mint-soft-200 rounded-lg bg-mint-soft-50">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="h-4 w-4 text-mint-soft-600" />
                  <span className="font-medium text-mint-soft-900 text-sm sm:text-base">Método de Pago</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-mint-soft-700">
                    {invoice.payment_method && invoice.payment_method !== "no-especificado" ? invoice.payment_method : "No especificado"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Estado y Pago */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-mint-soft-100 rounded-lg">
                  <Edit className="h-4 w-4 sm:h-5 sm:w-5 text-mint-soft-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-slate-900">Editar Factura</CardTitle>
                    <CardDescription className="text-sm">Modificar información de la factura</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="status" className="text-sm font-medium text-slate-700">Estado</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger className="mt-2 border-slate-200 focus:border-mint-soft-500 h-10 sm:h-12 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendiente">Pendiente</SelectItem>
                      <SelectItem value="Pagada">Pagada</SelectItem>
                      <SelectItem value="Parcial">Parcial</SelectItem>
                      <SelectItem value="Rechazada">Rechazada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="invoiceDate" className="text-sm font-medium text-slate-700">Fecha de Factura</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="mt-2 border-slate-200 focus:border-mint-soft-500 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="totalServices" className="text-sm font-medium text-slate-700">Total Servicios (RD$)</Label>
                  <Input
                    id="totalServices"
                    type="number"
                    value={totalServices}
                    onChange={(e) => setTotalServices(Number(e.target.value) || 0)}
                    className="mt-2 border-slate-200 focus:border-mint-soft-500 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="insuranceCovers" className="text-sm font-medium text-slate-700">Seguro Cubre (RD$)</Label>
                  <Input
                    id="insuranceCovers"
                    type="number"
                    value={insuranceCovers}
                    onChange={(e) => setInsuranceCovers(Number(e.target.value) || 0)}
                    className="mt-2 border-slate-200 focus:border-mint-soft-500 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="patientPays" className="text-sm font-medium text-slate-700">Paciente Paga (RD$)</Label>
                  <Input
                    id="patientPays"
                    type="number"
                    value={patientPays}
                    onChange={(e) => setPatientPays(Number(e.target.value) || 0)}
                    className="mt-2 border-slate-200 focus:border-mint-soft-500 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="authorizationNumber" className="text-sm font-medium text-slate-700">Nº Autorización (Factura)</Label>
                  <Input
                    id="authorizationNumber"
                    value={authorizationNumber}
                    onChange={(e) => setAuthorizationNumber(e.target.value)}
                    placeholder="Número de autorización general"
                    className="mt-2 border-slate-200 focus:border-mint-soft-500 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm font-medium text-slate-700">Notas</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales..."
                    rows={3}
                    className="mt-2 border-slate-200 focus:border-mint-soft-500 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="payment-method" className="text-sm font-medium text-slate-700">Método de Pago</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="mt-2 border-slate-200 focus:border-mint-soft-500 h-10 sm:h-12 text-sm sm:text-base">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        <SelectValue placeholder="Seleccionar método..." />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-especificado">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          No especificado
                        </div>
                      </SelectItem>
                      <SelectItem value="Efectivo">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          Efectivo
                        </div>
                      </SelectItem>
                      <SelectItem value="Transferencia">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Transferencia
                        </div>
                      </SelectItem>
                      <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasChanges && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm">
                      <strong>Cambios pendientes:</strong> Guarda los cambios para actualizar la factura.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  onClick={handleUpdate} 
                  disabled={!hasChanges || isUpdating}
                  className="w-full h-10 sm:h-12 bg-gradient-to-r from-mint-soft-600 to-mint-soft-700 hover:from-mint-soft-700 hover:to-mint-soft-800 text-white font-semibold text-sm sm:text-base"
                >
                  {isUpdating ? (
                    <>
                      <div className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span className="hidden sm:inline">Actualizando...</span>
                      <span className="sm:hidden">Actualizando</span>
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Actualizar Factura</span>
                      <span className="sm:hidden">Actualizar</span>
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Acciones */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-slate-100 rounded-lg">
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl text-slate-900">Acciones</CardTitle>
                    <CardDescription className="text-sm">Gestionar la factura</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full h-10 sm:h-12 text-sm sm:text-base" onClick={handlePrint}>
                  <Printer className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Imprimir Factura</span>
                  <span className="sm:hidden">Imprimir</span>
                </Button>
                
                <Button variant="outline" className="w-full h-10 sm:h-12 text-sm sm:text-base" onClick={handleDownloadPDF}>
                  <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Descargar PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
                
                {canDeleteInvoice && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full h-10 sm:h-12 text-sm sm:text-base">
                        <Trash className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        {isDeleting ? (
                          <span className="hidden sm:inline">Eliminando...</span>
                        ) : (
                          <span className="hidden sm:inline">Eliminar Factura</span>
                        )}
                        <span className="sm:hidden">
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Esto eliminará permanentemente la factura y todos sus datos asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive">
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
