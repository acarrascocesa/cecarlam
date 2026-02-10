"use client"

import React, { useState } from 'react'
import { FileText, Download, Trash2, AlertCircle, Loader2, Filter, Edit, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { apiClient } from '@/lib/api/client'

interface PatientAttachment {
  id: string
  file_name: string
  file_type: string
  file_url: string
  file_size: number
  category: string
  description: string
  created_at: string
}

interface PatientAttachmentListProps {
  attachments: PatientAttachment[]
  loading?: boolean
  onDownload?: (filename: string) => Promise<void>
  onDelete?: (attachmentId: string) => Promise<void>
  onCategoryChange?: (category: string) => void
  selectedCategory?: string
  className?: string
}

const CATEGORIES = {
  all: { label: 'Todos los documentos', icon: '📁', color: 'bg-gray-100 text-gray-800' },
  identity: { label: 'Documentos de Identidad', icon: '🆔', color: 'bg-blue-100 text-blue-800' },
  medical: { label: 'Documentos Médicos', icon: '🩻', color: 'bg-green-100 text-green-800' },
  administrative: { label: 'Administrativos', icon: '📋', color: 'bg-orange-100 text-orange-800' },
  insurance: { label: 'Seguros Médicos', icon: '🏥', color: 'bg-mint-soft-100 text-mint-soft-800' },
  general: { label: 'General', icon: '📄', color: 'bg-gray-100 text-gray-800' }
}

export const PatientAttachmentList: React.FC<PatientAttachmentListProps> = ({
  attachments,
  loading = false,
  onDownload,
  onDelete,
  onCategoryChange,
  selectedCategory = 'all',
  className
}) => {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set())
  const [viewingAttachment, setViewingAttachment] = useState<PatientAttachment | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({})
  const [loadingPreview, setLoadingPreview] = useState<Set<string>>(new Set())
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string>('')
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Fecha inválida'
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    if (type.includes('word')) return '📝'
    if (type === 'text/plain') return '📋'
    return '📎'
  }

  const getCategoryInfo = (category: string) => {
    return CATEGORIES[category as keyof typeof CATEGORIES] || CATEGORIES.general
  }

  const openViewModal = async (attachment: PatientAttachment) => {
    setViewingAttachment(attachment)
    setIsViewModalOpen(true)
    setIsPreviewLoading(true)
    
    // Precargar la vista previa si es un archivo que se puede previsualizar
    if (canPreviewFile(attachment.file_type)) {
      try {
        const previewUrl = await getAuthenticatedPreviewUrl(attachment)
        setCurrentPreviewUrl(previewUrl)
      } catch (error) {
        console.error('Error loading preview:', error)
      } finally {
        setIsPreviewLoading(false)
      }
    } else {
      setIsPreviewLoading(false)
    }
  }

  const closeViewModal = () => {
    setIsViewModalOpen(false)
    setViewingAttachment(null)
    setCurrentPreviewUrl('')
    setIsPreviewLoading(false)
  }

  const canPreviewFile = (fileType: string): boolean => {
    return fileType.startsWith('image/') || fileType === 'application/pdf' || fileType === 'text/plain'
  }

  // Función para crear URL autenticada para visualización
  const getAuthenticatedPreviewUrl = async (attachment: PatientAttachment): Promise<string> => {
    // Si ya tenemos la URL, la retornamos
    if (previewUrls[attachment.id]) {
      return previewUrls[attachment.id]
    }

    // Si ya estamos cargando, esperamos
    if (loadingPreview.has(attachment.id)) {
      return ''
    }

    try {
      setLoadingPreview(prev => new Set(prev).add(attachment.id))
      
      // Extraer el nombre del archivo de la URL, igual que en handleDownload
      const filename = attachment.file_url.split('/').pop()
      if (!filename) {
        throw new Error('No se pudo extraer el nombre del archivo')
      }
      
      // Usar la función de descarga del apiClient para obtener el blob
      const { blob } = await apiClient.downloadPatientAttachment(filename)
      
      // Crear URL del blob
      const url = URL.createObjectURL(blob)
      
      // Guardar la URL en el estado
      setPreviewUrls(prev => ({ ...prev, [attachment.id]: url }))
      
      return url
    } catch (error) {
      console.error('Error creating preview URL:', error)
      return ''
    } finally {
      setLoadingPreview(prev => {
        const next = new Set(prev)
        next.delete(attachment.id)
        return next
      })
    }
  }

  const renderFilePreview = (attachment: PatientAttachment) => {
    if (isPreviewLoading) {
      return (
        <div className="text-center py-8">
          <Loader2 className="h-16 w-16 animate-spin text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Cargando vista previa...</p>
        </div>
      )
    }

    if (attachment.file_type.startsWith('image/')) {
      if (!currentPreviewUrl) {
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-500">No se pudo cargar la imagen</p>
            <p className="text-sm text-gray-400 mt-2">Intenta descargar el archivo</p>
          </div>
        )
      }

      return (
        <div className="flex justify-center">
          <Image
            src={currentPreviewUrl}
            alt={attachment.file_name}
            width={600}
            height={400}
            className="max-w-full h-auto rounded-lg shadow-lg"
            style={{ objectFit: 'contain' }}
            onError={(e) => {
              // Si falla la carga, mostrar mensaje de error
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const errorDiv = document.createElement('div')
              errorDiv.className = 'text-center py-8'
              errorDiv.innerHTML = `
                <div class="text-red-500 mb-2">
                  <svg class="h-16 w-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <p class="text-gray-500">No se pudo cargar la imagen</p>
                <p class="text-sm text-gray-400 mt-2">Error al procesar el archivo</p>
              `
              target.parentNode?.appendChild(errorDiv)
            }}
          />
        </div>
      )
    }

    if (attachment.file_type === 'application/pdf') {
      if (!currentPreviewUrl) {
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <p className="text-gray-500">No se pudo cargar el PDF</p>
            <p className="text-sm text-gray-400 mt-2">Intenta descargar el archivo</p>
          </div>
        )
      }

      return (
        <div className="w-full h-[600px]">
          <iframe
            src={currentPreviewUrl}
            className="w-full h-full border rounded-lg"
            title={attachment.file_name}
            onError={() => {
              console.error('Error loading PDF')
            }}
          />
        </div>
      )
    }

    if (attachment.file_type === 'text/plain') {
      return (
        <div className="bg-gray-50 p-4 rounded-lg max-h-[600px] overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {/* Aquí se cargaría el contenido del archivo de texto */}
            Contenido del archivo de texto...
          </pre>
        </div>
      )
    }

    return (
      <div className="text-center py-8">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Este tipo de archivo no se puede previsualizar</p>
        <p className="text-sm text-gray-400 mt-2">Descarga el archivo para verlo</p>
      </div>
    )
  }

  const handleDownload = async (attachment: PatientAttachment) => {
    if (!onDownload) return
    
    const filename = attachment.file_url.split('/').pop()
    if (!filename) return

    setDownloadingFiles(prev => new Set(prev).add(attachment.id))
    
    try {
      await onDownload(filename)
    } finally {
      setDownloadingFiles(prev => {
        const next = new Set(prev)
        next.delete(attachment.id)
        return next
      })
    }
  }

  const handleDelete = async (attachmentId: string) => {
    if (!onDelete) return

    setDeletingFiles(prev => new Set(prev).add(attachmentId))
    
    try {
      await onDelete(attachmentId)
    } finally {
      setDeletingFiles(prev => {
        const next = new Set(prev)
        next.delete(attachmentId)
        return next
      })
    }
  }

  // Agrupar attachments por categoría para mostrar estadísticas
  const categoryStats = attachments.reduce((acc, attachment) => {
    const category = attachment.category || 'general'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Cargando documentos del paciente...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header con filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-semibold">
            Documentos del Paciente
          </h4>
          <Badge variant="outline">
            {attachments.length} documento{attachments.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Filtro por categoría */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                    {key !== 'all' && categoryStats[key] && (
                      <Badge variant="secondary" className="ml-auto">
                        {categoryStats[key]}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {attachments.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-4xl">
                {CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.icon || '📁'}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  {selectedCategory === 'all' 
                    ? 'No hay documentos'
                    : `No hay ${CATEGORIES[selectedCategory as keyof typeof CATEGORIES]?.label.toLowerCase()}`
                  }
                </p>
                <p className="text-xs text-gray-500">
                  Los documentos que subas aparecerán aquí
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop/Tablet Layout */}
          <div className="hidden md:block">
            <div className="space-y-2">
              {attachments.map((attachment) => {
                const categoryInfo = getCategoryInfo(attachment.category)
                return (
                  <Card key={attachment.id} className="hover:bg-gray-50/50 transition-colors">
                    <CardContent className="flex items-center gap-4 py-4">
                      {/* File Icon & Category */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-2xl">
                          {getFileIcon(attachment.file_type)}
                        </div>
                        <div className="text-lg">
                          {categoryInfo.icon}
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" title={attachment.file_name}>
                          {attachment.file_name}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-1">
                          <Badge 
                            variant="secondary" 
                            className={cn("text-xs", categoryInfo.color)}
                          >
                            {categoryInfo.label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {attachment.file_type.split('/')[1].toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(attachment.file_size)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(attachment.created_at)}
                          </span>
                        </div>

                        {attachment.description && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                            {attachment.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {canPreviewFile(attachment.file_type) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(attachment)}
                            title="Visualizar archivo"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(attachment)}
                          disabled={downloadingFiles.has(attachment.id)}
                          title="Descargar archivo"
                        >
                          {downloadingFiles.has(attachment.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(attachment.id)}
                          disabled={deletingFiles.has(attachment.id)}
                          title="Eliminar archivo"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingFiles.has(attachment.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="grid gap-3">
              {attachments.map((attachment) => {
                const categoryInfo = getCategoryInfo(attachment.category)
                return (
                  <Card key={attachment.id} className="hover:bg-gray-50/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* File Icon */}
                        <div className="text-xl flex-shrink-0 mt-1">
                          {getFileIcon(attachment.file_type)}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{categoryInfo.icon}</span>
                            <Badge 
                              variant="secondary" 
                              className={cn("text-xs", categoryInfo.color)}
                            >
                              {categoryInfo.label}
                            </Badge>
                          </div>

                          <p className="font-medium text-sm truncate mb-1" title={attachment.file_name}>
                            {attachment.file_name}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">
                              {attachment.file_type.split('/')[1].toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatFileSize(attachment.file_size)}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mb-3">
                            {formatDate(attachment.created_at)}
                          </p>

                          {attachment.description && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                              {attachment.description}
                            </p>
                          )}

                          {/* Mobile Actions */}
                          <div className="flex gap-2">
                            {canPreviewFile(attachment.file_type) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openViewModal(attachment)}
                                className="flex-1"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </Button>
                            )}
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownload(attachment)}
                              disabled={downloadingFiles.has(attachment.id)}
                              className="flex-1"
                            >
                              {downloadingFiles.has(attachment.id) ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  Descargando...
                                </>
                              ) : (
                                <>
                                  <Download className="h-4 w-4 mr-2" />
                                  Descargar
                                </>
                              )}
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(attachment.id)}
                              disabled={deletingFiles.has(attachment.id)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              {deletingFiles.has(attachment.id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* Modal de Visualización */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <span>{viewingAttachment?.file_name}</span>
                <Badge variant="outline">
                  {viewingAttachment?.file_type.split('/')[1].toUpperCase()}
                </Badge>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeViewModal}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {viewingAttachment?.description && (
              <p className="text-sm text-muted-foreground mt-2">
                {viewingAttachment.description}
              </p>
            )}
          </DialogHeader>
          
          <div className="flex-1 overflow-auto">
            {viewingAttachment && renderFilePreview(viewingAttachment)}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Tamaño:</span> {viewingAttachment && formatFileSize(viewingAttachment.file_size)} | 
              <span className="font-medium ml-2">Subido:</span> {viewingAttachment && formatDate(viewingAttachment.created_at)}
            </div>
            
            <div className="flex gap-2">
              {viewingAttachment && onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const filename = viewingAttachment.file_url.split('/').pop()
                    if (filename) onDownload(filename)
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
