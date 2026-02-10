"use client";
import type { Patient } from "@/types/patient";

interface LindaPrescriptionViewProps {
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
  signatureType?: 'pediatra' | 'alergolo';
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

export function LindaPrescriptionView({
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
  signatureType = 'pediatra',
  allClinics = [],
  doctorEmail = "",
  doctorPhone = "",
  doctorCell = "",
}: LindaPrescriptionViewProps) {
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
      <div className="max-w-3xl mx-auto bg-white border rounded-lg relative print:shadow-none" style={{ borderColor: '#2F6939' }}>
        {/* Header Section */}
        <div className="border-b p-4 print:p-3" style={{ borderColor: '#2F6939' }}>
          {/* Doctor Name and Specialty */}
          <div className="text-center mb-3">
            <h1 className="text-3xl font-serif italic mb-1" style={{ fontFamily: "'Dancing Script', 'Great Vibes', cursive", color: '#2F6939' }}>
              {doctorName}
            </h1>
            <p className="text-base font-medium" style={{ color: '#2F6939' }}>{doctorSpecialty}</p>
          </div>

          {/* Educational Background */}
          <div className="text-center text-sm mb-2 space-y-0.5" style={{ color: '#2F6939' }}>
            <div>Grado: Escuela Latinoamericana de Medicina, La Habana, Cuba.</div>
            <div>Posgrado: Hospital Universitario Arnaldo Milán Castro, Villa Clara, Cuba.</div>
          </div>

          {/* Contact Information */}
          <div className="text-center text-sm mb-3" style={{ color: '#2F6939' }}>
            <span>E-Mail: {doctorEmail || "dramilypenac@yahoo.es"}</span>
            {doctorPhone && <span className="ml-3">Tel.: {doctorPhone}</span>}
            {doctorCell && <span className="ml-3">Cel.: {doctorCell || "849-201-0850"}</span>}
          </div>

          {/* Clinic Logos */}
          <div className="flex justify-center items-center gap-6 mt-4">
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src="/dra-mc-logo.png"
                alt="Assistance Servicios de Salud Integral SRL"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src="/dra-magnolia.png"
                alt="Clínica Magnolia"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Central Section - Prescription Content */}
        <div className="relative p-6 print:p-4" style={{ minHeight: "500px" }}>
          {/* Rx Symbol - Top Left */}
          <div className="text-5xl font-serif mb-4 italic" style={{ fontFamily: "serif", color: '#2F6939' }}>
            Rx
          </div>

          {/* Anatomical Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 mt-12">
            <img
              src="/dra-watermark.png"
              alt="Marca de agua"
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
                color: '#2F6939',
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
                  src={`/sello-linda-${signatureType}.png`}
                  alt="Firma Doctor"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-sm font-semibold" style={{ fontFamily: "'Dancing Script', 'Great Vibes', cursive", color: '#2F6939' }}>
                {doctorName}
              </div>
              <div className="text-xs" style={{ color: '#2F6939' }}>
                {doctorSpecialty}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section - Patient Information */}
        <div className="border-t p-4 bg-white print:bg-white mt-2" style={{ borderColor: '#2F6939' }}>
          <div className="space-y-2">
            <div>
              <span className="text-sm font-bold" style={{ color: '#2F6939' }}>NOMBRE: </span>
              <span className="text-sm border-b inline-block min-w-[300px]" style={{ color: '#000000', borderColor: '#2F6939' }}>
                {patient?.name?.toUpperCase() || ""}
              </span>
            </div>
            <div className="flex gap-8">
              <div>
                <span className="text-sm font-bold" style={{ color: '#2F6939' }}>EDAD: </span>
                <span className="text-sm border-b inline-block min-w-[100px]" style={{ color: '#000000', borderColor: '#2F6939' }}>
                  {patient?.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} años` : ""}
                </span>
              </div>
              <div>
                <span className="text-sm font-bold" style={{ color: '#2F6939' }}>FECHA: </span>
                <span className="text-sm border-b inline-block min-w-[150px]" style={{ color: '#000000', borderColor: '#2F6939' }}>
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
