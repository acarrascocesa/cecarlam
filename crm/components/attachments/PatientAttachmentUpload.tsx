"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, AlertCircle, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { DocumentScanner } from './DocumentScanner'

interface PatientAttachmentUploadProps {
  patientId: string
  onUploadSuccess?: (files: any[], category: string, description: string) => void
  onUploadError?: (error: string) => void
  uploading?: boolean
  uploadProgress?: { [key: string]: number }
  className?: string
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 5

const CATEGORIES = {
  identity: { label: 'Documentos de Identidad', icon: '🆔', description: 'Cédula, pasaporte, licencia' },
  medical: { label: 'Documentos Médicos', icon: '🩻', description: 'Radiografías, laboratorios, estudios' },
  administrative: { label: 'Documentos Administrativos', icon: '📋', description: 'Consentimientos, formularios' },
  insurance: { label: 'Seguros Médicos', icon: '🏥', description: 'Pólizas, tarjetas de seguro' },
  general: { label: 'General', icon: '📁', description: 'Otros documentos' }
}

export const PatientAttachmentUpload: React.FC<PatientAttachmentUploadProps> = ({
  patientId,
  onUploadSuccess,
  onUploadError,
  uploading = false,
  uploadProgress = {},
  className
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('general')
  const [description, setDescription] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFiles = useCallback((files: FileList | File[]): { valid: File[], errors: string[] } => {
    const fileArray = Array.from(files)
    const errors: string[] = []
    const valid: File[] = []

    // Verificar número máximo de archivos
    if (fileArray.length > MAX_FILES) {
      errors.push(`Máximo ${MAX_FILES} archivos permitidos`)
      return { valid: [], errors }
    }

    fileArray.forEach((file, index) => {
      // Verificar tipo de archivo
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Tipo de archivo no permitido`)
        return
      }

      // Verificar tamaño
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: Archivo muy grande (máx. 10MB)`)
        return
      }

      valid.push(file)
    })

    return { valid, errors }
  }, [])

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const { valid, errors } = validateFiles(files)
    setValidationErrors(errors)
    
    if (valid.length > 0) {
      setSelectedFiles(prev => [...prev, ...valid])
    }
  }, [validateFiles])

  const handleScannerCapture = useCallback((files: File[]) => {
    handleFileSelect(files)
    setShowScanner(false)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }, [handleFileSelect])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelect(e.target.files)
    }
  }, [handleFileSelect])

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || !onUploadSuccess) return

    try {
      await onUploadSuccess(selectedFiles, selectedCategory, description)
      setSelectedFiles([])
      setValidationErrors([])
      setDescription('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Error uploading files')
    }
  }, [selectedFiles, selectedCategory, description, onUploadSuccess, onUploadError])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setValidationErrors([])
  }, [])

  const resetForm = useCallback(() => {
    setSelectedFiles([])
    setValidationErrors([])
    setDescription('')
    setSelectedCategory('general')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('word')) return '📝'
    return '📎'
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Configuración de Upload */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Categoría */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoría del documento</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <div>
                      <div className="font-medium">{cat.label}</div>
                      <div className="text-xs text-muted-foreground">{cat.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Descripción */}
        <div className="space-y-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción del documento..."
            rows={3}
            className="resize-none"
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card 
          className={cn(
            "relative border-2 border-dashed transition-colors cursor-pointer",
            dragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400",
            uploading && "opacity-50 pointer-events-none"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Seleccionar Archivos
            </p>
            <p className="text-xs text-gray-500">
              JPG, PNG, PDF, DOC, DOCX, TXT
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </CardContent>
        </Card>

        <Card 
          className={cn(
            "relative border-2 border-dashed transition-colors cursor-pointer",
            "border-green-health hover:border-green-health/80 bg-green-health/5",
            uploading && "opacity-50 pointer-events-none"
          )}
          onClick={() => setShowScanner(true)}
        >
          <CardContent className="flex flex-col items-center justify-center py-6 px-4 text-center">
            <Camera className="h-8 w-8 text-green-health mb-2" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Escanear con Cámara
            </p>
            <p className="text-xs text-gray-500">
              Usa la cámara de tu dispositivo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="text-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Archivos seleccionados ({selectedFiles.length})</h4>
          
          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <Card key={index} className="relative">
                <CardContent className="flex items-center gap-3 py-3 px-4">
                  {/* File Icon */}
                  <div className="text-lg flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {file.type.split('/')[1].toUpperCase()}
                    </p>
                    
                    {/* Progress Bar */}
                    {uploadProgress[file.name] !== undefined && (
                      <div className="mt-2 space-y-1">
                        <Progress value={uploadProgress[file.name]} className="h-2" />
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Subiendo...</span>
                          <span>{uploadProgress[file.name]}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  {!uploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeFile(index)
                      }}
                      className="h-8 w-8 p-0 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload Button */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleUpload} 
              disabled={uploading || selectedFiles.length === 0}
              className="w-full sm:w-auto"
            >
              {uploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Subir {selectedFiles.length} archivo{selectedFiles.length > 1 ? 's' : ''}
                </>
              )}
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              onClick={resetForm}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Escáner */}
      {showScanner && (
        <DocumentScanner
          onCapture={handleScannerCapture}
          onClose={() => setShowScanner(false)}
          multiple={true}
          maxScans={MAX_FILES - selectedFiles.length}
        />
      )}
    </div>
  )
}
