import type { User } from "@/context/app-context"

// Usuarios reales del backend
export const users: User[] = [
  // MÉDICOS
  {
    id: "2a4a85c4-0de8-4983-8188-837ab23ad2fe",
    name: "Dr. Luis Arturo Castillo Roa",
    email: "siul-012@hotmail.com",
    password: "", // La autenticación se maneja por API
    role: "doctor",
    avatar: "/doctor-avatar.png",
    license: "EXQ. 456-789",
    clinicIds: [
      "9933dca7-3839-43a5-a450-b84a0f7b698b", // Clínica Abreu
      "c5a2ba38-372d-4954-827d-ab0133e637b9", // Centro Médico Elohim
      "9a0edec7-27a9-47e7-bff9-76938a733a48"  // Centro Médico Haina
    ],
  },
  {
    id: "3e3d72a6-f9b4-4c8a-9e7d-8b5a2f1c0e9d",
    name: "Dra. Linda Flor Medina Lantigua",
    email: "lindaflormedinal@gmail.com",
    password: "", // La autenticación se maneja por API
    role: "doctor",
    avatar: "/serene-woman.png",
    license: "EXQ. 123-456",
    clinicIds: [
      "5daec728-c357-4271-93a7-ae6ff866ee0e", // Clínica Abreu (otra)
      "95703429-d6ad-4b32-bcc8-d6aff84a0929"  // IRMIE
    ],
  },
  
  // SECRETARIAS
  {
    id: "5d2c1b8e-3f4e-4a9b-8c7d-6e5f4a3b2c1d",
    name: "Loreleiby Peguero",
    email: "lorenpeguero12@gmail.com",
    password: "", // La autenticación se maneja por API
    role: "secretary",
    avatar: "/woman-face-2.png",
    license: null,
    clinicIds: ["9933dca7-3839-43a5-a450-b84a0f7b698b"], // Clínica Abreu
  },
  {
    id: "6e3d4c5f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
    name: "Santa Nivar",
    email: "santanivar1@gmail.com",
    password: "", // La autenticación se maneja por API
    role: "secretary",
    avatar: "/woman-face-3.png",
    license: null,
    clinicIds: ["c5a2ba38-372d-4954-827d-ab0133e637b9"], // Centro Médico Elohim
  },
  {
    id: "7f4e5d6c-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
    name: "Cristi Ramos",
    email: "ramosyulianny02@gmail.com",
    password: "", // La autenticación se maneja por API
    role: "secretary",
    avatar: "/woman-face-4.png",
    license: null,
    clinicIds: ["9a0edec7-27a9-47e7-bff9-76938a733a48"], // Centro Médico Haina
  },
  {
    id: "8a5b6c7d-3c4d-5e6f-7a8b-9c0d1e2f3a4b",
    name: "Karla Leed",
    email: "karlatlied38@gmail.com",
    password: "", // La autenticación se maneja por API
    role: "secretary",
    avatar: "/woman-face.png",
    license: null,
    clinicIds: ["95703429-d6ad-4b32-bcc8-d6aff84a0929"], // IRMIE
  },
]
