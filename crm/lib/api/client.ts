// lib/api/client.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Inicializar token desde localStorage si existe
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken')
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token)
      } else {
        localStorage.removeItem('authToken')
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Asegurar que el token esté sincronizado con localStorage antes de cada request
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('authToken')
      if (storedToken !== this.token) {
        this.token = storedToken
      }
    }

    const url = `${this.baseURL}${endpoint}`
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw error
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.request<{
      token: string
      user: {
        id: string
        name: string
        email: string
        role: string
        avatarUrl?: string
        licenseNumber?: string
        multiClinicView?: boolean
      }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })

    this.setToken(response.token)
    return response
  }

  async verifyToken() {
    return this.request<{
      user: {
        id: string
        name: string
        email: string
        role: string
        avatarUrl?: string
        licenseNumber?: string
        multiClinicView?: boolean
      }
    }>('/auth/verify')
  }

  logout() {
    this.setToken(null)
  }

  // User-Clinics endpoints
  async getUserClinics() {
    return this.request<Array<{
      id: string
      user_id: string
      clinic_id: string
      role: string
      created_at: string
      clinic_name: string
      clinic_address: string
      clinic_phone: string
      clinic_email: string
      clinic_is_active: boolean
      doctor_name?: string
    }>>('/user-clinics/my-clinics')
  }

  // Users endpoints
  async getUsers(clinicId?: string) {
    const params = clinicId ? `?clinicId=${clinicId}` : ""
    return this.request<any[]>(`/users${params}`)
  }

  async getUserById(id: string) {
    return this.request<any>(`/users/${id}`)
  }

  // Patients endpoints
  async getPatients(clinicId?: string) {
    const params = clinicId ? `?clinicId=${clinicId}` : ''
    return this.request<any[]>(`/patients${params}`)
  }

  async getPatientById(id: string) {
    return this.request<any>(`/patients/${id}`)
  }

  async createPatient(patient: any) {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    })
  }

  async updatePatient(id: string, patient: any) {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    })
  }

  async deletePatient(id: string) {
    return this.request(`/patients/${id}`, {
      method: "DELETE",
    })
  }

  // Appointments endpoints
  async getAppointments(clinicId?: string, date?: string) {
    const params = new URLSearchParams()
    if (clinicId) params.append('clinicId', clinicId)
    if (date) params.append('date', date)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    
    return this.request<any[]>(`/appointments${queryString}`)
  }

  async getAppointmentById(id: string) {
    return this.request<any>(`/appointments/${id}`)
  }

  async createAppointment(appointment: any) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    })
  }

  async updateAppointment(id: string, appointment: any) {
    return this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointment),
    })
  }

  async deleteAppointment(id: string) {
    return this.request(`/appointments/${id}`, {
      method: 'DELETE',
    })
  }

  // Medical Records endpoints
  async getMedicalRecords(patientId?: string, clinicId?: string) {
    const params = new URLSearchParams()
    if (patientId) params.append('patientId', patientId)
    if (clinicId) params.append('clinicId', clinicId)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    
    return this.request<any[]>(`/medical-records${queryString}`)
  }

  async getMedicalRecordById(id: string) {
    return this.request<any>(`/medical-records/${id}`)
  }

  async createMedicalRecord(record: any) {
    return this.request('/medical-records', {
      method: 'POST',
      body: JSON.stringify(record),
    })
  }

  async updateMedicalRecord(id: string, record: any) {
    return this.request(`/medical-records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(record),
    })
  }

  async deleteMedicalRecord(id: string) {
    return this.request(`/medical-records/${id}`, {
      method: 'DELETE',
    })
  }

  // Services endpoints
  async getServices(clinicId?: string) {
    const params = clinicId ? `?clinicId=${clinicId}` : ''
    return this.request<any[]>(`/services${params}`)
  }

  async getServicesBySpecialty(clinicId?: string, insuranceType?: string) {
    const params = new URLSearchParams()
    if (clinicId) params.append('clinicId', clinicId)
    if (insuranceType) params.append('insuranceType', insuranceType)
    const queryString = params.toString() ? `?${params.toString()}` : ''
    
    return this.request<any[]>(`/services/by-specialty${queryString}`)
  }

  async createService(service: any) {
    return this.request('/services', {
      method: 'POST',
      body: JSON.stringify(service),
    })
  }

  async updateService(id: string, service: any) {
    return this.request(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(service),
    })
  }

  async deleteService(id: string) {
    return this.request(`/services/${id}`, {
      method: 'DELETE',
    })
  }

  // Medications endpoints
  async getMedications(doctorId?: string) {
    const params = doctorId ? `?doctorId=${doctorId}` : ''
    return this.request<any[]>(`/medications${params}`)
  }

  async createMedication(medication: any) {
    return this.request('/medications', {
      method: 'POST',
      body: JSON.stringify(medication),
    })
  }

  async updateMedication(id: string, medication: any) {
    return this.request(`/medications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medication),
    })
  }

  async deleteMedication(id: string) {
    return this.request(`/medications/${id}`, {
      method: 'DELETE',
    })
  }

  // Analytics endpoints
  async getAnalytics(doctorId?: string) {
    const params = doctorId ? `?doctorId=${doctorId}` : ''
    return this.request<any[]>(`/analytics${params}`)
  }

  async createAnalytic(analytic: any) {
    return this.request('/analytics', {
      method: 'POST',
      body: JSON.stringify(analytic),
    })
  }

  async updateAnalytic(id: string, analytic: any) {
    return this.request(`/analytics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(analytic),
    })
  }

  async deleteAnalytic(id: string) {
    return this.request(`/analytics/${id}`, {
      method: 'DELETE',
    })
  }

  // Prescriptions endpoints
  async getPrescriptions(clinicId?: string, patientId?: string, doctorId?: string) {
    const params = new URLSearchParams()
    if (clinicId) params.append('clinicId', clinicId)
    if (patientId) params.append('patientId', patientId)
    if (doctorId) params.append('doctorId', doctorId)
    const queryString = params.toString()
    return this.request<any[]>(`/prescriptions${queryString ? `?${queryString}` : ''}`)
  }

  async getPrescriptionById(id: string) {
    return this.request<any>(`/prescriptions/${id}`)
  }

  async getPrescriptionsByPatient(patientId: string) {
    return this.request<any[]>(`/prescriptions/patient/${patientId}`)
  }

  async createPrescription(prescription: any) {
    return this.request('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescription),
    })
  }

  async updatePrescription(id: string, prescription: any) {
    return this.request(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(prescription),
    })
  }

  async deletePrescription(id: string) {
    return this.request(`/prescriptions/${id}`, {
      method: 'DELETE',
    })
  }

  // Invoices endpoints
  async getInvoices(clinicId?: string) {
    const params = clinicId ? `?clinicId=${clinicId}` : ""
    return this.request<any[]>(`/invoices${params}`)
  }

  async getInvoiceById(id: string) {
    return this.request<any>(`/invoices/${id}`)
  }

  async createInvoice(invoice: any) {
    return this.request("/invoices", {
      method: "POST",
      body: JSON.stringify(invoice),
    })
  }

  async updateInvoice(id: string, invoice: any) {
    return this.request(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(invoice),
    })
  }

  async deleteInvoice(id: string) {
    return this.request(`/invoices/${id}`, {
      method: "DELETE",
    })
  }

  // ============= ATTACHMENTS METHODS =============
  
  async uploadAttachments(medicalRecordId: string, files: FileList | File[]) {
    const formData = new FormData()
    formData.append('medical_record_id', medicalRecordId)
    
    // Convertir FileList a Array si es necesario
    const fileArray = Array.from(files)
    fileArray.forEach(file => {
      formData.append('files', file)
    })

    const token = localStorage.getItem('authToken')
    const response = await fetch(`${this.baseURL}/attachments/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO agregamos Content-Type para FormData, el browser lo maneja
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getAttachments(medicalRecordId: string) {
    return this.request(`/attachments/record/${medicalRecordId}`)
  }

  async downloadAttachment(filename: string) {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${this.baseURL}/attachments/download/${filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error downloading file: ${response.status}`)
    }

    // Retornar el blob para descarga
    const blob = await response.blob()
    const contentDisposition = response.headers.get('content-disposition')
    let filename_from_header = filename
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename_from_header = filenameMatch[1]
      }
    }

    return { blob, filename: filename_from_header }
  }

  async deleteAttachment(attachmentId: string) {
    return this.request(`/attachments/${attachmentId}`, {
      method: 'DELETE',
    })
  }

  // ============= PATIENT ATTACHMENTS METHODS =============
  
  async uploadPatientAttachments(patientId: string, files: FileList | File[], category: string = 'general', description: string = '') {
    const formData = new FormData()
    formData.append('patient_id', patientId)
    formData.append('category', category)
    formData.append('description', description)
    
    // Convertir FileList a Array si es necesario
    const fileArray = Array.from(files)
    fileArray.forEach(file => {
      formData.append('files', file)
    })

    const token = localStorage.getItem('authToken')
    const response = await fetch(`${this.baseURL}/patient-attachments/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // NO agregamos Content-Type para FormData, el browser lo maneja
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async getPatientAttachments(patientId: string, category?: string) {
    const params = new URLSearchParams()
    if (category && category !== 'all') {
      params.append('category', category)
    }
    
    const queryString = params.toString()
    const url = `/patient-attachments/patient/${patientId}${queryString ? `?${queryString}` : ''}`
    
    return this.request(url)
  }

  async downloadPatientAttachment(filename: string) {
    const token = localStorage.getItem('authToken')
    const response = await fetch(`${this.baseURL}/patient-attachments/download/${filename}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Error downloading file: ${response.status}`)
    }

    // Retornar el blob para descarga
    const blob = await response.blob()
    const contentDisposition = response.headers.get('content-disposition')
    let filename_from_header = filename
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename_from_header = filenameMatch[1]
      }
    }

    return { blob, filename: filename_from_header }
  }

  async updatePatientAttachment(attachmentId: string, category: string, description: string) {
    return this.request(`/patient-attachments/${attachmentId}`, {
      method: 'PUT',
      body: JSON.stringify({ category, description }),
    })
  }

  async deletePatientAttachment(attachmentId: string) {
    return this.request(`/patient-attachments/${attachmentId}`, {
      method: 'DELETE',
    })
  }

  // ============= EMAIL COMMUNICATION METHODS =============
  
  async sendAppointmentReminder(appointmentId: string) {
    return this.request(`/emails/send-appointment-reminder/${appointmentId}`, {
      method: 'POST',
    })
  }

  async sendPrescriptionEmail(prescriptionId: string) {
    return this.request(`/emails/send-prescription/${prescriptionId}`, {
      method: 'POST',
    })
  }

  async sendMedicalResults(recordId: string) {
    return this.request(`/emails/send-results/${recordId}`, {
      method: 'POST',
    })
  }

  async sendInvoiceEmail(invoiceId: string) {
    return this.request(`/emails/send-invoice/${invoiceId}`, {
      method: 'POST',
    })
  }

  async getEmailHistory(patientId?: string, clinicId?: string) {
    const params = new URLSearchParams()
    if (clinicId) params.append('clinicId', clinicId)
    
    const queryString = params.toString()
    const endpoint = patientId ? `/emails/history/${patientId}` : '/emails/history'
    
    return this.request(`${endpoint}${queryString ? `?${queryString}` : ''}`)
  }

  async getEmailTemplates(templateType?: string) {
    const params = templateType ? `?type=${templateType}` : ''
    return this.request(`/email-templates${params}`)
  }

  // ============= AUTOMATION METHODS =============
  
  async getAutomationConfig() {
    return this.request('/automation/config');
  }

  async updateAutomationConfig(config: any) {
    return this.request('/automation/config', {
      method: 'PUT',
      body: JSON.stringify({ config }),
    });
  }

  async getAutomationStats() {
    return this.request('/automation/stats');
  }

  async runManualReminders() {
    return this.request('/automation/run-manual', {
      method: 'POST',
    });
  }

  async startAutomation() {
    return this.request('/automation/start', {
      method: 'POST',
    });
  }

  async stopAutomation() {
    return this.request('/automation/stop', {
      method: 'POST',
    });
  }

  async createEmailTemplate(template: any) {
    return this.request('/email-templates', {
      method: 'POST',
      body: JSON.stringify(template),
    })
  }

  async updateEmailTemplate(id: string, template: any) {
    return this.request(`/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    })
  }

  // ============= REPORTS METHODS =============
  
  async getReports(filters?: any) {
    const params = new URLSearchParams()
    if (filters?.clinicId) params.append('clinicId', filters.clinicId)
    if (filters?.type) params.append('type', filters.type)
    if (filters?.status) params.append('status', filters.status)
    
    const queryString = params.toString()
    return this.request(`/reports${queryString ? `?${queryString}` : ''}`)
  }

  async generateReport(reportData: any) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    })
  }

  async getReportById(id: string) {
    return this.request(`/reports/${id}`)
  }

  async deleteReport(id: string) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE',
    })
  }

  async downloadReport(id: string) {
    const response = await fetch(`${this.baseURL}/reports/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return response.blob();
  }

  async getReportTemplates(filters?: any) {
    const params = new URLSearchParams()
    if (filters?.type) params.append('type', filters.type)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    
    const queryString = params.toString()
    return this.request(`/reports/templates${queryString ? `?${queryString}` : ''}`)
  }

  async createReportTemplate(templateData: any) {
    return this.request('/reports/templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    })
  }

  // ============= USER CLINIC METHODS =============
  
  async getClinicUsers(clinicId: string) {
    return this.request(`/user-clinics/clinic/${clinicId}`)
  }

}

export const apiClient = new ApiClient(API_BASE_URL)
