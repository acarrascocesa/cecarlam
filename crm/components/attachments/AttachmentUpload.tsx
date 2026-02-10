"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface AttachmentUploadProps {
  medicalRecordId: string
  onUploadSuccess?: (files: any[]) => void
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

export const AttachmentUpload: React.FC<AttachmentUploadProps> = ({
  medicalRecordId,
  onUploadSuccess,
  onUploadError,
  uploading = false,
  uploadProgress = {},
  className
}) => {
  const [dragOver, setDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])
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
      setSelectedFiles(valid)
    }
  }, [validateFiles])

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
      await onUploadSuccess(selectedFiles)
      setSelectedFiles([])
      setValidationErrors([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Error uploading files')
    }
  }, [selectedFiles, onUploadSuccess, onUploadError])

  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setValidationErrors([])
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
    <div className={cn("space-y-4", className)}>
      {/* Drag & Drop Zone */}
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
        <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Upload className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mb-4" />
          
          <div className="space-y-2">
            <p className="text-sm sm:text-base font-medium text-gray-900">
              {dragOver ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              JPG, PNG, PDF, DOC, DOCX, TXT (máx. 10MB cada uno)
            </p>
            <p className="text-xs text-gray-400">
              Máximo {MAX_FILES} archivos
            </p>
          </div>

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
              onClick={() => {
                setSelectedFiles([])
                setValidationErrors([])
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                }
              }}
              disabled={uploading}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
