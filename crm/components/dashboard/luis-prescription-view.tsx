"use client";
import type { Patient } from "@/types/patient";

interface LuisPrescriptionViewProps {
  patient: Patient | null;
  prescription: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorLicense: string;
  clinicAddress: string;
  clinicPhone: string;
  clinicEmail: string;
  clinicWebsite: string;
  doctorId?: string;
  allClinics?: Array<{
    clinic_id: string;
    clinic_name: string;
    clinic_address?: string;
    clinic_phone?: string;
  }>;
  doctorEmail?: string;
  doctorPhone?: string;
  doctorCell?: string;
}

export function LuisPrescriptionView({
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
  allClinics = [],
  doctorEmail = "",
  doctorPhone = "",
  doctorCell = "",
}: LuisPrescriptionViewProps) {
  const currentDate = new Date().toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "long",
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 print:p-0">
      <div className="max-w-3xl mx-auto bg-white border rounded-lg relative print:shadow-none" style={{ borderColor: '#3F6E9F' }}>
        {/* Header Section */}
        <div className="border-b p-4 print:p-3" style={{ borderColor: '#3F6E9F' }}>
          {/* Doctor Name and Specialty */}
          <div className="text-center mb-3">
            <h1 className="text-3xl font-serif italic mb-1" style={{ fontFamily: "'Dancing Script', 'Great Vibes', cursive", color: '#3F6E9F' }}>
              {doctorName}
            </h1>
            <p className="text-base font-medium" style={{ color: '#3F6E9F' }}>{doctorSpecialty}</p>
          </div>

          {/* Educational Background */}
          <div className="text-center text-sm mb-2 space-y-0.5" style={{ color: '#3F6E9F' }}>
            <div>Grado: Escuela Latinoamericana de Medicina, La Habana, Cuba.</div>
            <div>Posgrado: Cardiocentro Che Guevara, Villa Clara, Cuba.</div>
          </div>

          {/* Contact Information */}
          <div className="text-center text-sm mb-3" style={{ color: '#3F6E9F' }}>
            <span>E-Mail: {doctorEmail || "dr.jorgemayobanex@yahoo.es"}</span>
            {doctorPhone && <span className="ml-3">Tel.: {doctorPhone}</span>}
            {doctorCell && <span className="ml-3">Cel.: {doctorCell}</span>}
          </div>

          {/* Clinic Logos */}
          <div className="flex justify-center items-center gap-6 mt-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src="/mc-logo.png"
                alt="Assistance Servicios de Salud Integral SRL"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src="/magnolia.png"
                alt="Clínica Magnolia"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Central Section - Prescription Content */}
        <div className="relative p-6 print:p-4" style={{ minHeight: "500px" }}>
          {/* Rx Symbol - Top Left */}
          <div className="text-5xl font-serif mb-4 italic" style={{ fontFamily: "serif", color: '#3F6E9F' }}>
            Rx
          </div>

          {/* Anatomical Heart Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 mt-12">
            <img
              src="/watermark-heart.png"
              alt="Marca de agua corazón"
              className="w-80 h-80 opacity-15 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Prescription Text */}
          <div className="relative z-10">
            <div
              className="w-full min-h-[350px] text-base leading-relaxed font-serif p-4 border-0 bg-transparent"
              style={{
                fontSize: "16px",
                lineHeight: "1.8",
                fontFamily: "Georgia, serif",
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
                color: '#3F6E9F',
              }}
            >
              {prescription || "Sin contenido de prescripción"}
            </div>
          </div>

          {/* Signature Section */}
          <div className="flex justify-center mt-4 mb-4">
            <div className="text-center">
              <div className="w-80 h-32 mb-2 relative">
                <img
                  src="/sello-luis.png"
                  alt="Firma Doctor"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-sm font-semibold" style={{ fontFamily: "'Dancing Script', 'Great Vibes', cursive", color: '#3F6E9F' }}>
                {doctorName}
              </div>
              <div className="text-xs" style={{ color: '#3F6E9F' }}>
                {doctorSpecialty}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section - Patient Information */}
        <div className="border-t p-4 bg-white print:bg-white mt-2" style={{ borderColor: '#3F6E9F' }}>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-bold" style={{ color: '#3F6E9F' }}>NOMBRE: </span>
              <span className="text-sm border-b inline-block min-w-[300px]" style={{ color: '#000000', borderColor: '#3F6E9F' }}>
                {patient?.name?.toUpperCase() || ""}
              </span>
            </div>
            <div className="flex gap-8">
              <div>
                <span className="text-sm font-bold" style={{ color: '#3F6E9F' }}>EDAD: </span>
                <span className="text-sm border-b inline-block min-w-[100px]" style={{ color: '#000000', borderColor: '#3F6E9F' }}>
                  {patient?.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} años` : ""}
                </span>
              </div>
              <div>
                <span className="text-sm font-bold" style={{ color: '#3F6E9F' }}>FECHA: </span>
                <span className="text-sm border-b inline-block min-w-[150px]" style={{ color: '#000000', borderColor: '#3F6E9F' }}>
                  {currentDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
