"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shield, Users, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al login después de 5 segundos
    const timer = setTimeout(() => {
      router.push("/auth/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-mint-soft rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Acceso Controlado
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                El registro está restringido a administradores
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-800 font-medium">
                  HSALUD-PRO es un sistema profesional con acceso
                  controlado
                </p>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  Para obtener acceso al sistema, contacta a nuestro equipo de
                  ventas:
                </p>

                <div className="bg-gray-50 rounded-lg p-3 border">
                  <div className="flex items-center gap-2 justify-center">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <Link
                      href="mailto:ventas@medicos.com"
                      className="text-mint-soft hover:text-mint-soft/80 font-medium"
                    >
                      ventas@medicos.com
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push("/auth/login")}
                className="w-full h-11 bg-mint-soft hover:bg-mint-soft/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al Login
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Redirigiendo automáticamente en 5 segundos...
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                ¿Ya tienes credenciales demo? Usa el login
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
