"use client"

import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAppContext, type Notification } from "@/context/app-context"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export function Notifications() {
  const { notifications, markNotificationAsRead, deleteNotification } = useAppContext()
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  // Calcular el número de notificaciones no leídas
  useEffect(() => {
    setUnreadCount(notifications.filter((notification) => !notification.read).length)
  }, [notifications])

  // Formatear la fecha relativa
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000)

    if (diffInSeconds < 60) return "Ahora mismo"
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`

    return new Date(date).toLocaleDateString()
  }

  // Marcar todas las notificaciones como leídas
  const markAllAsRead = () => {
    notifications.forEach((notification) => {
      if (!notification.read) {
        markNotificationAsRead(notification.id)
      }
    })
  }

  // Obtener el icono según el tipo de notificación
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <div className="h-2 w-2 rounded-full bg-green-tranquil" />
      case "error":
        return <div className="h-2 w-2 rounded-full bg-red-500" />
      case "warning":
        return <div className="h-2 w-2 rounded-full bg-orange-soft" />
      case "info":
      default:
        return <div className="h-2 w-2 rounded-full bg-mint-soft" />
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No hay notificaciones</div>
          ) : (
            notifications.slice(0, 10).map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 border-b last:border-0 flex gap-3 hover:bg-muted/50 transition-colors",
                  !notification.read && "bg-muted/20",
                )}
                onClick={() => {
                  if (!notification.read) {
                    markNotificationAsRead(notification.id)
                  }
                }}
              >
                <div className="flex items-center justify-center mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <button
                      className="text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                    >
                      <span className="sr-only">Eliminar</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-x"
                      >
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(notification.date))}
                    </span>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        className="text-xs text-mint-soft hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        Ver detalles
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {notifications.length > 10 && (
          <div className="p-2 text-center border-t">
            <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
