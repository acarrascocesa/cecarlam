import type { Clinic } from "@/context/app-context"

// Clínicas reales de la base de datos
export const clinics: Clinic[] = [
  {
    id: "9933dca7-3839-43a5-a450-b84a0f7b698b",
    name: "Clínica Abreu",
    address: "Ed. Lugo, Calle Fabio Fiallo #55, 1er Piso",
    phone: "(809) 692-4656",
    doctorId: "2a4a85c4-0de8-4983-8188-837ab23ad2fe" // Dr. Luis
  },
  {
    id: "c5a2ba38-372d-4954-827d-ab0133e637b9",
    name: "Centro Médico Elohim",
    address: "Dirección de Elohim",
    phone: "(809) 555-1234",
    doctorId: "2a4a85c4-0de8-4983-8188-837ab23ad2fe" // Dr. Luis
  },
  {
    id: "9a0edec7-27a9-47e7-bff9-76938a733a48",
    name: "Centro Médico Haina",
    address: "Dirección de Haina",
    phone: "(809) 555-5678",
    doctorId: "2a4a85c4-0de8-4983-8188-837ab23ad2fe" // Dr. Luis
  },
  {
    id: "5daec728-c357-4271-93a7-ae6ff866ee0e",
    name: "Clínica Abreu",
    address: "Dirección por especificar",
    phone: "(809) 555-9012",
    doctorId: "3e3d72a6-f9b4-4c8a-9e7d-8b5a2f1c0e9d" // Dra. Linda (ID estimado)
  },
  {
    id: "95703429-d6ad-4b32-bcc8-d6aff84a0929",
    name: "IRMIE",
    address: "Dirección por especificar",
    phone: "(809) 555-3456",
    doctorId: "3e3d72a6-f9b4-4c8a-9e7d-8b5a2f1c0e9d" // Dra. Linda (ID estimado)
  }
]
