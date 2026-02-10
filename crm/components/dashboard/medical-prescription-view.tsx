"use client";
import { Badge } from "@/components/ui/badge";
import type { Patient } from "@/types/patient";

interface MedicalPrescriptionViewProps {
  patient: Patient | null;
  prescription: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorLicense: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicWebsite: string;
  doctorId?: string; // Para identificar qué logo usar
}

export function MedicalPrescriptionView({
  patient,
  prescription,
  doctorName,
  doctorSpecialty,
  doctorLicense,
  clinicAddress,
  clinicPhone,
  clinicEmail,
  clinicWebsite,
  doctorId,
}: MedicalPrescriptionViewProps) {
  const currentDate = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const calculateAge = (birthDate: string | Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Determinar qué logo usar según el doctor
  const getDoctorLogo = () => {
    if (doctorId === "2" || doctorName.toLowerCase().includes("linda")) {
      return "/logo-linda.jpeg";
    }
    return "/doctor-luis-logo.png";
  };

  // Determinar si es Linda para usar colores púrpura
  const isLinda = doctorId === "2" || doctorName.toLowerCase().includes("linda");

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border-2 border-gray-300 shadow-lg print:shadow-none print:border-gray-400 overflow-hidden">
      {/* Header */}
      <div className={`${isLinda ? 'bg-gradient-to-r from-mint-soft-50 to-mint-soft-100 text-mint-soft-900 print:bg-mint-soft-100' : 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 print:bg-blue-100'} p-2 sm:p-3 md:p-4 lg:p-6`}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-3 md:gap-4 lg:gap-6">
          <div className="flex-1 order-2 sm:order-1">
            <div className="text-xs sm:text-sm md:text-sm mt-1 sm:mt-2 opacity-90">NOMBRE</div>
            <div className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold tracking-wide break-words">
              {patient?.name?.toUpperCase() || "SELECCIONAR PACIENTE"}
            </div>
          </div>

          {/* Doctor Logo */}
          <div className="text-center order-1 sm:order-2 w-full sm:w-auto">
            <div className="bg-white rounded-lg p-1 mb-1 shadow-sm w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 mx-auto">
              <div className="w-full h-full flex items-center justify-center">
                <img
                  src={getDoctorLogo()}
                  alt={`Logo ${doctorName}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="text-xs sm:text-sm md:text-sm font-medium mb-1 opacity-90">
              FECHA: {currentDate}
            </div>
          </div>
        </div>
      </div>

      {/* Patient Info */}
      {patient && (
        <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 bg-gray-50 border-b text-xs sm:text-sm md:text-sm">
          <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 lg:gap-8">
            <span className="text-xs sm:text-sm">
              <strong>Edad:</strong>{" "}
              {patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : "N/A"}{" "}
              años
            </span>
          </div>
        </div>
      )}

      {/* Prescription Content - Solo lectura */}
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8">
        <div className="min-h-[200px] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] xl:min-h-[400px]">
          <div
            className="w-full min-h-[180px] sm:min-h-[230px] md:min-h-[280px] lg:min-h-[330px] xl:min-h-[380px] text-xs sm:text-sm md:text-base leading-relaxed font-mono p-2 sm:p-3 md:p-4 border border-gray-200 rounded-lg bg-white resize-none print:border-0 print:bg-transparent print:shadow-none whitespace-pre-wrap"
            style={{
              fontSize: "16px",
              lineHeight: "1.8",
              fontFamily: "monospace",
            }}
          >
            {prescription || "Sin contenido"}
          </div>
        </div>
      </div>

      {/* Doctor Signature Section */}
      <div className="p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 border-t border-gray-200">
        <div className="flex justify-center">
          <div className="text-center">
            {/* Doctor Stamp */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-36 xl:h-36 mx-auto mb-2 sm:mb-3 md:mb-4 border-2 sm:border-3 md:border-4 ${isLinda ? 'border-mint-soft-600 bg-gradient-to-br from-mint-soft-50 to-mint-soft-100' : 'border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100'} rounded-full flex items-center justify-center shadow-lg`}>
              <div className="text-center">
                <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-1 sm:mb-1 md:mb-2">⚕️</div>
                <div className={`text-xs font-bold ${isLinda ? 'text-mint-soft-800' : 'text-blue-800'} leading-tight`}>
                  {doctorName}
                </div>
                <div className={`text-xs ${isLinda ? 'text-mint-soft-600' : 'text-blue-600'} leading-tight`}>
                  {doctorSpecialty}
                </div>
                <div className={`text-xs ${isLinda ? 'text-mint-soft-600' : 'text-blue-600'} font-mono`}>
                  Lic: {doctorLicense}
                </div>
                </div>
            </div>

            {/* Signature Line */}
            <div className="w-32 sm:w-40 md:w-48 lg:w-56 xl:w-64 h-0.5 bg-gray-400 mx-auto mb-2"></div>
            <div className="text-xs sm:text-sm md:text-sm font-semibold text-gray-700" style={isLinda ? {fontFamily: "'Dancing Script', 'Great Vibes', 'Allura', 'Lucida Calligraphy', cursive"} : {}}>
              {doctorName}
            </div>
            <div className="text-xs text-gray-500">
              {doctorSpecialty} • {doctorLicense}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 text-center text-xs sm:text-sm md:text-sm text-gray-600 border-t">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div>
            <div className="font-semibold text-gray-800 mb-1 text-xs sm:text-sm">Dirección</div>
            <div className="text-xs sm:text-sm break-words">{clinicAddress}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-800 mb-1 text-xs sm:text-sm">Contacto</div>
            <div className="text-xs sm:text-sm break-words">{clinicPhone}</div>
            {clinicEmail && <div className="text-xs sm:text-sm break-words">{clinicEmail}</div>}
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <div className="font-semibold text-gray-800 mb-1 text-xs sm:text-sm">Sitio Web</div>
            <div className="text-xs sm:text-sm break-words">{clinicWebsite}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
