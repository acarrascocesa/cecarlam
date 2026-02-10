"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-warm-50 to-green-health-50">
      <div className="text-center">
        <div className="mb-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold-institutional-600" />
        </div>
        <h2 className="text-xl font-semibold text-green-health-800 mb-2">CECARLAM</h2>
        <p className="text-gray-professional-600">Cargando sistema médico...</p>
      </div>
    </div>
  );
}
