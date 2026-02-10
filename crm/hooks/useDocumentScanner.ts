"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

interface UseDocumentScannerReturn {
  hasCamera: boolean
  isMobile: boolean
  permissionGranted: boolean
  stream: MediaStream | null
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
  capturePhoto: () => Promise<string | null>
  checkCameraSupport: () => Promise<boolean>
}

export const useDocumentScanner = (): UseDocumentScannerReturn => {
  const [hasCamera, setHasCamera] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Detectar si es móvil/tablet
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Verificar soporte de cámara
  const checkCameraSupport = useCallback(async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Tu navegador no soporta acceso a la cámara')
        setHasCamera(false)
        return false
      }

      const devices = await navigator.mediaDevices.enumerateDevices()
      const hasVideoInput = devices.some(device => device.kind === 'videoinput')
      
      setHasCamera(hasVideoInput)
      return hasVideoInput
    } catch (err) {
      setError('Error al verificar disponibilidad de cámara')
      setHasCamera(false)
      return false
    }
  }, [])

  // Iniciar cámara
  const startCamera = useCallback(async () => {
    try {
      setError(null)
      
      // Verificar soporte
      const supported = await checkCameraSupport()
      if (!supported) {
        throw new Error('Cámara no disponible')
      }

      // Detener stream anterior si existe
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }

      // Solicitar acceso a cámara
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Cámara trasera en móviles
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      setStream(mediaStream)
      setPermissionGranted(true)

      // Conectar stream al video element
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }
    } catch (err: any) {
      setError(err.message || 'Error al acceder a la cámara')
      setPermissionGranted(false)
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Permiso de cámara denegado. Por favor, permite el acceso en la configuración del navegador.')
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No se encontró ninguna cámara disponible')
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('La cámara está siendo usada por otra aplicación')
      }
    }
  }, [stream, checkCameraSupport])

  // Detener cámara
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setPermissionGranted(false)
  }, [stream])

  // Capturar foto
  const capturePhoto = useCallback(async (): Promise<string | null> => {
    try {
      if (!videoRef.current || !stream) {
        throw new Error('Cámara no iniciada')
      }

      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Error al crear contexto de canvas')
      }

      // Dibujar frame actual del video en el canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convertir a base64
      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      return imageData
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al capturar foto')
      return null
    }
  }, [stream])

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    hasCamera,
    isMobile,
    permissionGranted,
    stream,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    checkCameraSupport
  }
}

