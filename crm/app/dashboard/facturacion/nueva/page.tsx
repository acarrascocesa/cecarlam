"use client"
import { useAuth } from "@/context/auth-context"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "@/context/app-context"
import { useRealClinics } from "@/hooks/useRealClinics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Plus, 
  Trash, 
  Calculator, 
  Phone, 
  CheckCircle,
  AlertCircle,
  DollarSign,
  User,
  FileText,
  Package,
  Building,
  Search,
  Shield,
  CreditCard,
  Info,
  Save,
  Eye,
  ChevronRight,
  Calendar,
  Clock
} from "lucide-react"
import Link from "next/link"
import { getCurrentDateISO } from "@/lib/utils"
import { getClinicDisplayName } from "@/lib/clinicDisplayNames"

interface InvoiceItem {
  serviceId?: string
  description: string
  amount: number
  insuranceCovers: number
  patientPays: number
  authorizationNumber?: string
}

export default function NewInvoicePage() {
  const router = useRouter()
  const { patients, addInvoice, selectedClinicId, services } = useAppContext()
  const { user } = useAuth()
  const hasMultiClinicView = user?.multiClinicView && (user?.role === "doctor" || user?.role === "secretary")
  const { clinics } = useRealClinics()
  
  // Estados principales
  const [selectedPatient, setSelectedPatient] = useState("")
  const [selectedFormClinicId, setSelectedFormClinicId] = useState<string>("")
  const [items, setItems] = useState<InvoiceItem[]>([])
  
  // Estados de seguro mejorados
  const [paymentOption, setPaymentOption] = useState<'patient_insurance' | 'no_insurance' | 'other_insurance'>('no_insurance')
  const [patientHasInsurance, setPatientHasInsurance] = useState(false)
  const [hasInsurance, setHasInsurance] = useState(false)
  const [insuranceProvider, setInsuranceProvider] = useState("SIN SEGURO")
  const [policyNumber, setPolicyNumber] = useState("")
  const [coverageVerified, setCoverageVerified] = useState(false)
  const [verificationNotes, setVerificationNotes] = useState("")
  const [suggestedInsurance, setSuggestedInsurance] = useState<{
    provider: string
    policyNumber: string
    usePatientInsurance: boolean
  } | null>(null)
  
  // Estados de UX
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("manual")
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Estado para método de pago y estado inicial
  const [paymentMethod, setPaymentMethod] = useState("")
  const [invoiceStatus, setInvoiceStatus] = useState<"Pendiente" | "Pagada">("Pendiente")
  
  // Obtener patientId de la URL si existe
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const patientIdFromUrl = urlParams.get('patientId')
    if (patientIdFromUrl) {
      setSelectedPatient(patientIdFromUrl)
    }
  }, [])

  const selectedPatientData = patients.find(p => p.id === selectedPatient)

  // Auto-detectar seguro del paciente cuando se selecciona
  useEffect(() => {
    if (selectedPatientData) {
      const patientInsurance = selectedPatientData.insuranceProvider
      const hasPatientInsurance = patientInsurance && patientInsurance !== "SIN SEGURO"
      
      setPatientHasInsurance(hasPatientInsurance)
      
      if (hasPatientInsurance) {
        setSuggestedInsurance({
          provider: patientInsurance,
          policyNumber: selectedPatientData.insuranceNumber || "",
          usePatientInsurance: true
        })
        // Auto-sugerir usar el seguro del paciente
        setPaymentOption('patient_insurance')
        setHasInsurance(true)
        setInsuranceProvider(patientInsurance)
        setPolicyNumber(selectedPatientData.insuranceNumber || "")
      } else {
        setSuggestedInsurance(null)
        setPaymentOption('no_insurance')
        setHasInsurance(false)
        setInsuranceProvider('SIN SEGURO')
        setPolicyNumber('')
      }
    }
  }, [selectedPatientData])

  // Configurar seguro según la opción de pago elegida
  useEffect(() => {
    switch (paymentOption) {
      case 'patient_insurance':
        if (suggestedInsurance) {
          setHasInsurance(true)
          setInsuranceProvider(suggestedInsurance.provider)
          setPolicyNumber(suggestedInsurance.policyNumber)
        }
        break
        
      case 'no_insurance':
        setHasInsurance(false)
        setInsuranceProvider('SIN SEGURO')
        setPolicyNumber('')
        break
        
      case 'other_insurance':
        setHasInsurance(true)
        setInsuranceProvider('SIN SEGURO')
        setPolicyNumber('')
        break
    }
  }, [paymentOption, suggestedInsurance])

  // Cálculos
  const totalServices = items.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalInsuranceCovers = items.reduce((sum, item) => sum + Number(item.insuranceCovers || 0), 0)
  const totalPatientPays = items.reduce((sum, item) => sum + Number(item.patientPays || 0), 0)

  // Filtrar pacientes por búsqueda
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone?.includes(searchTerm)
  )

  const addItem = () => {
    setItems([...items, { 
      serviceId: undefined, 
      description: "", 
      amount: 0, 
      insuranceCovers: hasInsurance ? 0 : 0, 
      patientPays: 0, 
      authorizationNumber: "" 
    }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items]
    
    // Convertir valores numéricos
    if (field === 'amount' || field === 'insuranceCovers' || field === 'patientPays') {
      newItems[index] = { ...newItems[index], [field]: Number(value) || 0 }
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    
    // Calcular amount automáticamente como suma de insuranceCovers + patientPays
    if (field === 'insuranceCovers' || field === 'patientPays') {
      const insuranceCovers = Number(newItems[index].insuranceCovers) || 0
      const patientPays = Number(newItems[index].patientPays) || 0
      newItems[index].amount = insuranceCovers + patientPays
    }
    
    setItems(newItems)
  }

  const addServiceFromCatalog = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (service) {
      const basePrice = Number(service.basePrice) || 0
      const insurancePercentage = Number(service.insuranceCoveragePercentage) || 0
      
      // Calcular montos iniciales basados en el catálogo
      const initialInsuranceCovers = hasInsurance && insurancePercentage > 0 ? (basePrice * insurancePercentage / 100) : 0
      const initialPatientPays = hasInsurance && insurancePercentage > 0 ? (basePrice * (100 - insurancePercentage) / 100) : basePrice
      
      const newItem = {
        serviceId: service.id,
        description: service.name,
        amount: initialInsuranceCovers + initialPatientPays, // Calculado como suma
        insuranceCovers: initialInsuranceCovers,
        patientPays: initialPatientPays,
        authorizationNumber: ""
      }
      setItems([...items, newItem])
    }
  }

  const handleSave = async () => {
    if (!selectedPatient || !user) return

    // Validar clínica para usuarios con vista unificada
    if (hasMultiClinicView && !selectedFormClinicId) {
      alert("Debe seleccionar un centro médico para la factura")
      return
    }

    // Método de pago obligatorio solo si la factura va como Pagada
    if (invoiceStatus === "Pagada" && !paymentMethod) {
      alert("Debe seleccionar un método de pago cuando la factura va como Pagada")
      return
    }

    const patient = patients.find(p => p.id === selectedPatient)
    if (!patient) return

    setIsGenerating(true)

    try {
      const newInvoice = {
        clinicId: hasMultiClinicView ? selectedFormClinicId : selectedClinicId!,
        patientId: selectedPatient,
        doctorId: user.id,
        invoiceDate: getCurrentDateISO() + 'T12:00:00.000Z',
        totalServices,
        insuranceCovers: totalInsuranceCovers,
        patientPays: totalPatientPays,
        status: invoiceStatus,
        paymentMethod: invoiceStatus === "Pagada" ? paymentMethod : "",
        notes: "",
        authorizationNumber: null,
        insurance: hasInsurance ? {
          provider: insuranceProvider,
          policyNumber: policyNumber,
          coverageVerified: coverageVerified,
          verifiedBy: user.name,
          verifiedDate: coverageVerified ? getCurrentDateISO() + 'T12:00:00.000Z' : "",
          notes: verificationNotes
        } : null,
        items: items.filter(item => item.description && item.amount > 0).map(item => ({
          serviceId: item.serviceId || null,
          description: item.description,
          quantity: 1,
          unitPrice: item.amount,
          totalPrice: item.amount,
          insuranceCovers: item.insuranceCovers,
          patientPays: item.patientPays,
          authorizationNumber: item.authorizationNumber || null
        }))
      }
      
      await addInvoice(newInvoice)
      
      // Navegación de retorno según parámetro
      const urlParams = new URLSearchParams(window.location.search)
      const returnTo = urlParams.get('returnTo')
      if (returnTo === 'paciente') {
        const patientId = urlParams.get('patientId')
        router.push(`/dashboard/pacientes/${patientId}`)
      } else {
        router.push("/dashboard/facturacion")
      }
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Error al crear la factura. Por favor, intente nuevamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 overflow-hidden max-w-9xl mx-auto w-full">
      {/* Header optimizado para móviles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full h-8 w-8 sm:h-10 sm:w-10"
            onClick={() => {
              const urlParams = new URLSearchParams(window.location.search)
              const returnTo = urlParams.get('returnTo')
              if (returnTo === 'paciente') {
                const patientId = urlParams.get('patientId')
                router.push(`/dashboard/pacientes/${patientId}`)
              } else {
                router.push("/dashboard/facturacion")
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nueva Factura</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Crea una factura profesional paso a paso</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="hidden sm:inline">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
          <span className="sm:hidden">
            {new Date().toLocaleDateString('es-ES', { 
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        {/* Panel Principal */}
        <div className="col-span-1 lg:col-span-2 space-y-4">
          {/* Selección de Paciente */}
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Paciente</CardTitle>
                  <CardDescription className="text-sm">Selecciona el paciente para la factura</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-blue-500"
                />
              </div>

              <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-lg">
                {filteredPatients.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                  </div>
                ) : (
                  filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 sm:p-4 border-b border-slate-100 cursor-pointer transition-all duration-200 ${
                        selectedPatient === patient.id 
                          ? 'bg-blue-50 border-blue-200 shadow-sm' 
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => setSelectedPatient(patient.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900 truncate">{patient.name}</h4>
                            {patient.insuranceProvider && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs w-fit">
                                <Shield className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">{patient.insuranceProvider}</span>
                                <span className="sm:hidden">Seguro</span>
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-slate-600">
                            {patient.email && (
                              <span className="flex items-center gap-1 truncate">
                                <span>📧</span>
                                <span className="truncate">{patient.email}</span>
                              </span>
                            )}
                            {patient.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {patient.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedPatient === patient.id && (
                          <div className="p-2 bg-blue-500 rounded-full flex-shrink-0">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                </div>

              {selectedPatientData && (
                <Alert className="border-blue-200 bg-blue-50">
                  <User className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Paciente seleccionado:</strong> {selectedPatientData.name}
                    {selectedPatientData.insuranceProvider && (
                      <span className="ml-2 text-blue-600">
                        • Seguro: {selectedPatientData.insuranceProvider}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

                      {/* Selección de Clínica (solo para vista multiclínicas) */}
          {hasMultiClinicView && (
            <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">Centro Médico</CardTitle>
                    <CardDescription className="text-sm">Elige el centro médico para la factura</CardDescription>
                  </div>
                </div>
              </CardHeader>
                              <CardContent>
                <Select value={selectedFormClinicId} onValueChange={setSelectedFormClinicId}>
                  <SelectTrigger className="border-slate-200 focus:border-green-500">
                    <SelectValue placeholder="Seleccionar centro médico..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((clinic) => (
                      <SelectItem key={clinic.clinic_id} value={clinic.clinic_id}>
                        {getClinicDisplayName(user?.email || '', clinic)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {!selectedFormClinicId && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Debe seleccionar un centro médico para continuar
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

                      {/* Configuración de Seguro */}
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-mint-soft-100 rounded-lg">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-mint-soft-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Opciones de Pago</CardTitle>
                  <CardDescription className="text-sm">Elige cómo se pagará esta factura</CardDescription>
                </div>
              </div>
            </CardHeader>
              <CardContent className="space-y-4">
                {/* Opciones de pago disponibles */}
                {selectedPatientData && (
                  <div className="space-y-3">
                                          {patientHasInsurance && (
                        <div className="p-3 sm:p-4 border border-green-200 rounded-lg bg-green-50">
                        <h4 className="font-medium text-green-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                          Paciente tiene seguro disponible
                        </h4>
                        
                        <div className="space-y-2">
                          <Button 
                            variant={paymentOption === 'patient_insurance' ? 'default' : 'outline'}
                            onClick={() => setPaymentOption('patient_insurance')}
                            className="w-full justify-start bg-green-600 hover:bg-green-700 h-9 sm:h-10 text-xs sm:text-sm"
                          >
                            <Shield className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Usar seguro del paciente ({selectedPatientData.insuranceProvider})</span>
                          </Button>
                          
                          <Button 
                            variant={paymentOption === 'no_insurance' ? 'default' : 'outline'}
                            onClick={() => setPaymentOption('no_insurance')}
                            className="w-full justify-start h-9 sm:h-10 text-xs sm:text-sm"
                          >
                            <DollarSign className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="truncate">Pagar sin seguro (paciente paga todo)</span>
                          </Button>
                        </div>
                      </div>
                    )}

                                          {!patientHasInsurance && (
                        <div className="p-3 sm:p-4 border border-blue-200 rounded-lg bg-blue-50">
                        <h4 className="font-medium text-blue-900 mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                          Paciente sin seguro
                        </h4>
                        
                        <Button 
                          variant={paymentOption === 'no_insurance' ? 'default' : 'outline'}
                          onClick={() => setPaymentOption('no_insurance')}
                          className="w-full justify-start h-9 sm:h-10 text-xs sm:text-sm"
                        >
                          <DollarSign className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="truncate">Pagar sin seguro (paciente paga todo)</span>
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {!selectedPatientData && (
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mb-2" />
                    <p className="text-yellow-800 text-sm">
                      Selecciona un paciente para ver las opciones de pago disponibles
                    </p>
                  </div>
                )}

                {hasInsurance && (
                  <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 border border-mint-soft-200 rounded-xl bg-mint-soft-50/50">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-mint-soft-600" />
                  <h4 className="font-medium text-mint-soft-900">Configuración del Seguro</h4>
                    </div>
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                      <div>
                        <Label htmlFor="insuranceProvider" className="text-sm font-medium text-slate-700">
                          Proveedor de Seguro *
                        </Label>
                        <Select value={insuranceProvider} onValueChange={setInsuranceProvider}>
                          <SelectTrigger className="mt-2 border-slate-200 focus:border-mint-soft-500 h-10 sm:h-12 text-sm sm:text-base">
                            <SelectValue placeholder="Seleccionar ARS" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SIN SEGURO">Sin seguro</SelectItem>
                            <SelectItem value="SENASA_PENSIONADO">SENASA Pensionado</SelectItem>
                            <SelectItem value="SENASA_CONTRIBUTIVO">SENASA Contributivo</SelectItem>
                            <SelectItem value="MAPFRE">MAPFRE</SelectItem>
                            <SelectItem value="HUMANO">ARS Humano</SelectItem>
                            <SelectItem value="ARS_PRIMERA">ARS Primera</SelectItem>
                            <SelectItem value="ARS_UNIVERSAL">ARS Universal</SelectItem>
                            <SelectItem value="ARS_FUTURO">ARS Futuro</SelectItem>
                            <SelectItem value="ARS_GMA">ARS GMA</SelectItem>
                            <SelectItem value="ARS_MONUMENTAL">ARS Monumental</SelectItem>
                            <SelectItem value="ARS_RENACER">ARS Renacer</SelectItem>
                            <SelectItem value="ARS_BANCO_CENTRAL">ARS Banco Central</SelectItem>
                            <SelectItem value="ARS_METASALUD">ARS Metasalud</SelectItem>
                            <SelectItem value="ARS_SIGMA">ARS Sigma</SelectItem>
                            <SelectItem value="APS">APS (Asmar Planes de Salud)</SelectItem>
                            <SelectItem value="ARS_CMD">ARS CMD (Colegio Médico)</SelectItem>
                            <SelectItem value="ARS_PLAN_SALUD_BC">ARS Plan Salud BC</SelectItem>
                            <SelectItem value="ARS_RESERVAS">ARS Reservas</SelectItem>
                            <SelectItem value="SEMMA">SEMMA</SelectItem>
                            <SelectItem value="YUNEN">YUNEN</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="policyNumber" className="text-sm font-medium text-slate-700">
                          Número de Póliza
                        </Label>
                        <Input
                          id="policyNumber"
                          value={policyNumber}
                          onChange={(e) => setPolicyNumber(e.target.value)}
                          placeholder="Ej: HUM-2024-001234"
                          className="mt-2 border-slate-200 focus:border-mint-soft-500 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>



                    <div className="flex items-center space-x-3 p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <Switch
                        id="coverageVerified"
                        checked={coverageVerified}
                        onCheckedChange={setCoverageVerified}
                      />
                      <Label htmlFor="coverageVerified" className="font-medium text-blue-900">
                        Cobertura verificada con ARS
                      </Label>
                    </div>

                    {coverageVerified && (
                      <div>
                        <Label htmlFor="verificationNotes" className="text-sm font-medium text-slate-700">
                          Notas de la verificación
                        </Label>
                        <Textarea
                          id="verificationNotes"
                          value={verificationNotes}
                          onChange={(e) => setVerificationNotes(e.target.value)}
                          placeholder="Ej: ARS cubre 80% de consulta, 60% de laboratorio..."
                          rows={3}
                          className="mt-2 border-slate-200 focus:border-mint-soft-500"
                        />
                      </div>
                    )}

                    {!coverageVerified && hasInsurance && (
                      <Alert className="border-yellow-200 bg-yellow-50">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          <strong>Importante:</strong> Recuerda llamar a la ARS para verificar la cobertura antes de generar la factura.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

                      {/* Servicios */}
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Servicios</CardTitle>
                  <CardDescription className="text-sm">
                    Agrega los servicios y sus montos. Puedes agregar manualmente o desde el catálogo.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
                          <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
                  <TabsTrigger value="manual" className="rounded-md text-sm">Servicios Manuales</TabsTrigger>
                  <TabsTrigger value="catalog" className="rounded-md text-sm">Catálogo ({services.length})</TabsTrigger>
                </TabsList>

                  <TabsContent value="manual" className="space-y-3 sm:space-y-4">
                    {items.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 mb-2">No hay servicios agregados</h3>
                        <p className="text-slate-600 mb-4">Agrega servicios manualmente o desde el catálogo</p>
                        <div className="flex gap-2 justify-center">
                          <Button onClick={addItem} className="bg-orange-600 hover:bg-orange-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Servicio Manual
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('catalog')}
                            className="border-orange-200 text-orange-700 hover:bg-orange-50"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Ver Catálogo
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {items.map((item, index) => (
                      <div key={index} className="p-4 sm:p-6 border border-slate-200 rounded-xl bg-slate-50/50">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                          <h4 className="font-semibold text-base sm:text-lg text-slate-900">Servicio {index + 1}</h4>
                          {items.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 h-8 w-8 sm:h-10 sm:w-10 p-0"
                            >
                              <Trash className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor={`description-${index}`} className="text-sm font-medium text-slate-700">
                              Descripción del Servicio *
                            </Label>
                            <Input
                              id={`description-${index}`}
                              value={item.description}
                              onChange={(e) => updateItem(index, "description", e.target.value)}
                              placeholder="Ej: Consulta General, Laboratorio, etc."
                              className="mt-2 border-slate-200 focus:border-orange-500 h-10 sm:h-12 text-sm sm:text-base"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`amount-${index}`} className="text-sm font-medium text-slate-700">
                              Monto Total (RD$) *
                            </Label>
                            <Input
                              id={`amount-${index}`}
                              type="number"
                              value={item.amount}
                              disabled
                              className="mt-2 bg-slate-100 border-slate-200 h-10 sm:h-12 text-sm sm:text-base"
                            />
                            <p className="text-xs text-slate-500 mt-1">
                              Calculado automáticamente (Seguro + Paciente)
                            </p>
                          </div>

                          {hasInsurance ? (
                            <>
                              <div>
                                <Label htmlFor={`insuranceCovers-${index}`} className="text-sm font-medium text-slate-700">
                                  Seguro Cubre (RD$) *
                                </Label>
                                <Input
                                  id={`insuranceCovers-${index}`}
                                  type="number"
                                  value={item.insuranceCovers}
                                  onChange={(e) => updateItem(index, "insuranceCovers", parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  className="mt-2 border-slate-200 focus:border-orange-500 h-10 sm:h-12 text-sm sm:text-base"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                  Monto que cubre el seguro
                                </p>
                              </div>

                              <div>
                                <Label htmlFor={`patientPays-${index}`} className="text-sm font-medium text-slate-700">
                                  Paciente Paga (RD$) *
                                </Label>
                                <Input
                                  id={`patientPays-${index}`}
                                  type="number"
                                  value={item.patientPays}
                                  onChange={(e) => updateItem(index, "patientPays", parseFloat(e.target.value) || 0)}
                                  placeholder="0.00"
                                  className="mt-2 border-slate-200 focus:border-orange-500 h-10 sm:h-12 text-sm sm:text-base"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                  Monto que paga el paciente
                                </p>
                              </div>
                            </>
                          ) : (
                            <div>
                              <Label htmlFor={`patientPays-${index}`} className="text-sm font-medium text-slate-700">
                                Paciente Paga (RD$) *
                              </Label>
                              <Input
                                id={`patientPays-${index}`}
                                type="number"
                                value={item.patientPays}
                                onChange={(e) => updateItem(index, "patientPays", parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="mt-2 border-slate-200 focus:border-orange-500 h-10 sm:h-12 text-sm sm:text-base"
                              />
                              <p className="text-xs text-slate-500 mt-1">
                                Monto que paga el paciente (sin seguro)
                              </p>
                            </div>
                          )}

                          <div className="md:col-span-2">
                            <Label htmlFor={`authorization-${index}`} className="text-sm font-medium text-slate-700">
                              Número de Autorización
                            </Label>
                            <Input
                              id={`authorization-${index}`}
                              value={item.authorizationNumber || ""}
                              onChange={(e) => updateItem(index, "authorizationNumber", e.target.value)}
                              placeholder="Ej: SEN-2024-001234"
                              className="mt-2 border-slate-200 focus:border-orange-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" onClick={addItem} className="w-full h-12 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50">
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Otro Servicio
                    </Button>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="catalog" className="space-y-4">
                    {services.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                        <p className="text-slate-500 mb-4">No hay servicios configurados para esta clínica</p>
                        <Button asChild>
                          <Link href="/dashboard/servicios">Configurar Servicios</Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium text-slate-700">Servicios disponibles</Label>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab('manual')}
                            className="text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Agregar Manual
                          </Button>
                        </div>
                        
                        <div className="grid gap-3 max-h-96 overflow-y-auto">
                          {services.map((service) => (
                            <div 
                              key={service.id} 
                              className="p-4 border border-slate-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-colors"
                              onClick={() => addServiceFromCatalog(service.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-slate-900">{service.name}</h4>
                                  <p className="text-sm text-slate-600">{service.description || 'Sin descripción'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-slate-900">RD$ {service.basePrice.toLocaleString()}</p>
                                  {service.insuranceCoveragePercentage > 0 && (
                                    <p className="text-xs text-green-600">
                                      {service.insuranceCoveragePercentage}% cobertura
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
                          💡 <strong>Tip:</strong> Haz clic en cualquier servicio para agregarlo automáticamente con su precio y cobertura configurada.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

                  {/* Panel Lateral */}
        <div className="col-span-1 space-y-4">
          {/* Resumen de Facturación */}
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all duration-300 sticky top-6">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Resumen</CardTitle>
                  <CardDescription className="text-sm">Totales de la factura</CardDescription>
                </div>
              </div>
            </CardHeader>
                          <CardContent className="space-y-4">
              {/* Totales */}
              <div className="space-y-3">
                <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 text-xs sm:text-sm">Total Servicios</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-blue-700">
                    RD$ {totalServices.toLocaleString()}
                  </p>
                </div>

                {hasInsurance && (
                  <div className="p-3 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900 text-xs sm:text-sm">Seguro Cubre</span>
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-green-700">
                      RD$ {totalInsuranceCovers.toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-orange-600" />
                    <span className="font-medium text-orange-900 text-xs sm:text-sm">Paciente Paga</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-bold text-orange-700">
                    RD$ {totalPatientPays.toLocaleString()}
                  </p>
                </div>
                            </div>

              <Separator />

              {/* Estado inicial de la factura */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Estado al crear</Label>
                <Select value={invoiceStatus} onValueChange={(v: "Pendiente" | "Pagada") => setInvoiceStatus(v)}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-500 h-10 sm:h-12 text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        Pendiente — La cajera cobrará después
                      </span>
                    </SelectItem>
                    <SelectItem value="Pagada">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Pagada — Cobro registrado ahora
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  {invoiceStatus === "Pendiente" ? "La secretaria crea la factura; la cajera la marcará como cobrada después." : "Registra el cobro inmediatamente (requiere método de pago)."}
                </p>
              </div>

              {/* Método de Pago (solo si Pagada) */}
              <div className="space-y-2">
                <Label htmlFor="payment-method" className="text-sm font-medium text-slate-700">
                  Método de Pago {invoiceStatus === "Pagada" ? "*" : "(solo si Pagada)"}
                </Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="border-slate-200 focus:border-blue-500 h-10 sm:h-12 text-sm sm:text-base">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <SelectValue placeholder="Seleccionar método..." />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Efectivo">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Efectivo
                      </div>
                    </SelectItem>
                    <SelectItem value="Transferencia">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Transferencia
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {invoiceStatus === "Pagada" && !paymentMethod && (
                  <p className="text-xs text-red-600">
                    El método de pago es obligatorio cuando la factura va como Pagada
                  </p>
                )}
              </div>

              <Separator />

              {/* Alertas */}
              <div className="space-y-3">
                {hasInsurance && !coverageVerified && (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 text-xs">
                      <strong>Verificación Pendiente:</strong> La cobertura del seguro no ha sido verificada.
                    </AlertDescription>
                  </Alert>
                )}

                {totalServices === 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Debes agregar al menos un servicio para crear la factura.
                    </AlertDescription>
                  </Alert>
                )}

                {invoiceStatus === "Pagada" && !paymentMethod && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Debes seleccionar un método de pago cuando la factura va como Pagada.
                    </AlertDescription>
                  </Alert>
                )}

                {selectedPatient && totalServices > 0 && (invoiceStatus === "Pendiente" || paymentMethod) && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 text-xs">
                      <strong>¡Listo para crear!</strong> Todos los campos requeridos están completados.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={!selectedPatient || totalServices === 0 || (invoiceStatus === "Pagada" && !paymentMethod) || isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Creando Factura...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Crear Factura
                    </>
                  )}
                </Button>
                
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/facturacion">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cancelar
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
