"use client"

import React, { useState, useRef, useCallback } from 'react'
import { Camera, X, RotateCcw, Check, AlertCircle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Webcam from 'react-webcam'

interface DocumentScannerProps {
  onCapture: (files: File[]) => void
  onClose: () => void
  multiple?: boolean
  maxScans?: number
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onCapture,
  onClose,
  multiple = true,
  maxScans = 10
}) => {
  const [scans, setScans] = useState<string[]>([])
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment')
  
  const webcamRef = useRef<Webcam>(null)

  const capturePhoto = useCallback(() => {
    if (!webcamRef.current) {
      setError('Cámara no disponible')
      return
    }

    try {
      setIsCapturing(true)
      setError(null)

      const imageSrc = webcamRef.current.getScreenshot()
      
      if (!imageSrc) {
        throw new Error('No se pudo capturar la imagen')
      }

      if (multiple && scans.length < maxScans) {
        setScans(prev => [...prev, imageSrc])
      } else if (!multiple) {
        setScans([imageSrc])
      } else {
        setError(`Máximo ${maxScans} escaneos permitidos`)
      }

      setIsCapturing(false)
    } catch (err) {
      setIsCapturing(false)
      setError(err instanceof Error ? err.message : 'Error al capturar foto')
    }
  }, [scans.length, multiple, maxScans])

  const removeScan = (index: number) => {
    setScans(prev => prev.filter((_, i) => i !== index))
  }

  const retakeAll = () => {
    setScans([])
    setError(null)
  }

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
  }

  const saveScans = async () => {
    try {
      if (scans.length === 0) {
        setError('No hay escaneos para guardar')
        return
      }

      const files: File[] = scans.map((scanData, index) => {
        // Convertir base64 a Blob
        const byteString = atob(scanData.split(',')[1])
        const mimeString = scanData.split(',')[0].split(':')[1].split(';')[0]
        const ab = new ArrayBuffer(byteString.length)
        const ia = new Uint8Array(ab)
        
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i)
        }
        
        const blob = new Blob([ab], { type: mimeString })
        const fileName = `escaneo-${Date.now()}-${index + 1}.jpg`
        
        return new File([blob], fileName, { type: mimeString })
      })

      onCapture(files)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar escaneos')
    }
  }

  const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: facingMode
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Escanear Documento</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {/* Vista de Cámara */}
            <div className="relative bg-black rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="w-full h-auto max-h-[60vh] object-contain"
                style={{ transform: 'scaleX(-1)' }} // Espejo para mejor UX
              />
              
              {/* Marco guía */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="border-2 border-dashed border-white/50 rounded-lg w-[85%] h-[70%] flex items-center justify-center">
                  <div className="text-white/70 text-sm text-center px-4">
                    Alinea el documento dentro del marco
                  </div>
                </div>
              </div>
            </div>

            {/* Escaneos capturados */}
            {scans.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Escaneos capturados ({scans.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {scans.map((scan, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={scan}
                        alt={`Escaneo ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      {multiple && (
                        <button
                          onClick={() => removeScan(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1 rounded">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con controles */}
        <div className="border-t p-4 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="flex-1 min-w-[120px]"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isCapturing ? 'Capturando...' : 'Capturar'}
            </Button>

            <Button
              variant="outline"
              onClick={switchCamera}
              disabled={isCapturing}
              title="Cambiar cámara"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              Cambiar
            </Button>

            {scans.length > 0 && (
              <>
                {multiple && scans.length > 1 && (
                  <Button
                    variant="outline"
                    onClick={retakeAll}
                    disabled={isCapturing}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reiniciar
                  </Button>
                )}
                
                <Button
                  onClick={saveScans}
                  disabled={isCapturing}
                  className="flex-1 min-w-[120px] bg-green-health hover:bg-green-health/90"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Guardar ({scans.length})
                </Button>
              </>
            )}

            <Button
              variant="outline"
              onClick={onClose}
              disabled={isCapturing}
            >
              Cancelar
            </Button>
          </div>

          {multiple && scans.length < maxScans && (
            <p className="text-xs text-center text-gray-500">
              Puedes capturar hasta {maxScans} documentos
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
