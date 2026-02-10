"use client"

import React from 'react'
import { FileText, Download, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface Attachment {
  id: string
  file_name: string
  file_type: string
  file_url: string
  file_size: number
  created_at: string
}

interface AttachmentListProps {
  attachments: Attachment[]
  loading?: boolean
  onDownload?: (filename: string) => Promise<void>
  onDelete?: (attachmentId: string) => Promise<void>
  className?: string
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  loading = false,
  onDownload,
  onDelete,
  className
}) => {
  const [downloadingFiles, setDownloadingFiles] = React.useState<Set<string>>(new Set())
  const [deletingFiles, setDeletingFiles] = React.useState<Set<string>>(new Set())

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

  const getFileTypeColor = (type: string): string => {
    if (type.startsWith('image/')) return 'bg-blue-100 text-blue-800'
    if (type === 'application/pdf') return 'bg-red-100 text-red-800'
    if (type.includes('word')) return 'bg-blue-100 text-blue-800'
    if (type === 'text/plain') return 'bg-gray-100 text-gray-800'
    return 'bg-gray-100 text-gray-800'
  }

  const handleDownload = async (attachment: Attachment) => {
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

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Cargando archivos adjuntos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (attachments.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <FileText className="h-12 w-12 text-gray-300" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">No hay archivos adjuntos</p>
              <p className="text-xs text-gray-500">
                Los archivos que subas aparecerán aquí
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          Archivos adjuntos ({attachments.length})
        </h4>
      </div>

      {/* Desktop/Tablet Layout */}
      <div className="hidden md:block">
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="hover:bg-gray-50/50 transition-colors">
              <CardContent className="flex items-center gap-4 py-4">
                {/* File Icon */}
                <div className="text-2xl flex-shrink-0">
                  {getFileIcon(attachment.file_type)}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" title={attachment.file_name}>
                    {attachment.file_name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getFileTypeColor(attachment.file_type))}
                    >
                      {attachment.file_type.split('/')[1].toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(attachment.file_size)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(attachment.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
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
          ))}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="grid gap-3">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="hover:bg-gray-50/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* File Icon */}
                  <div className="text-xl flex-shrink-0 mt-1">
                    {getFileIcon(attachment.file_type)}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" title={attachment.file_name}>
                      {attachment.file_name}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-1 mb-3">
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getFileTypeColor(attachment.file_type))}
                      >
                        {attachment.file_type.split('/')[1].toUpperCase()}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {formatFileSize(attachment.file_size)}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      {formatDate(attachment.created_at)}
                    </p>

                    {/* Mobile Actions */}
                    <div className="flex gap-2">
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
          ))}
        </div>
      </div>
    </div>
  )
}
