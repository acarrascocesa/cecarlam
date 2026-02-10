# HSALUD-PRO Backend

Backend completo para el sistema de gestión médica HSALUD-PRO, desarrollado con Node.js, Express.js y PostgreSQL.

## 🚀 Características

- **Autenticación JWT** - Sistema seguro de autenticación
- **Multi-tenancy** - Soporte para múltiples clínicas
- **Roles y permisos** - Doctores, secretarias y administradores
- **API RESTful** - Endpoints bien estructurados
- **Validación de datos** - Validación robusta de entradas
- **Manejo de errores** - Sistema completo de manejo de errores
- **Seguridad** - Helmet, CORS, rate limiting

## 📋 Requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd hsalud-pro-backend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env` en la raíz del proyecto:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/hsalud_pro_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

4. **Configurar base de datos**
```bash
# Crear base de datos
createdb hsalud_pro_db

# Ejecutar migraciones (si las tienes)
# npm run migrate
```

5. **Ejecutar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/verify` - Verificar token

### Usuarios
- `GET /api/users` - Obtener usuarios
- `GET /api/users/:id` - Obtener usuario por ID
- `PUT /api/users/:id` - Actualizar usuario

### Clínicas
- `GET /api/clinics` - Obtener clínicas
- `GET /api/clinics/:id` - Obtener clínica por ID
- `POST /api/clinics` - Crear clínica
- `PUT /api/clinics/:id` - Actualizar clínica

### Pacientes
- `GET /api/patients` - Obtener pacientes
- `GET /api/patients/:id` - Obtener paciente por ID
- `POST /api/patients` - Crear paciente
- `PUT /api/patients/:id` - Actualizar paciente
- `DELETE /api/patients/:id` - Eliminar paciente

### Servicios Médicos
- `GET /api/services` - Obtener servicios
- `GET /api/services/:id` - Obtener servicio por ID
- `POST /api/services` - Crear servicio
- `PUT /api/services/:id` - Actualizar servicio

### Facturas
- `GET /api/invoices` - Obtener facturas
- `GET /api/invoices/:id` - Obtener factura por ID
- `POST /api/invoices` - Crear factura
- `PUT /api/invoices/:id` - Actualizar factura
- `DELETE /api/invoices/:id` - Eliminar factura

### Prescripciones
- `GET /api/prescriptions` - Obtener prescripciones
- `GET /api/prescriptions/:id` - Obtener prescripción por ID
- `POST /api/prescriptions` - Crear prescripción
- `PUT /api/prescriptions/:id` - Actualizar prescripción
- `DELETE /api/prescriptions/:id` - Eliminar prescripción
- `GET /api/prescriptions/patient/:patientId` - Prescripciones por paciente

### Historiales Médicos
- `GET /api/medical-records` - Obtener historiales
- `GET /api/medical-records/:id` - Obtener historial por ID
- `POST /api/medical-records` - Crear historial
- `PUT /api/medical-records/:id` - Actualizar historial
- `DELETE /api/medical-records/:id` - Eliminar historial
- `GET /api/medical-records/patient/:patientId` - Historiales por paciente
- `GET /api/medical-records/patient/:patientId/history` - Historial completo

### Citas
- `GET /api/appointments` - Obtener citas
- `GET /api/appointments/:id` - Obtener cita por ID
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Eliminar cita
- `GET /api/appointments/date/:date` - Citas por fecha
- `GET /api/appointments/doctor/:doctorId/schedule` - Agenda del doctor
- `PATCH /api/appointments/:id/status` - Actualizar estado

## 🔐 Autenticación

Todas las rutas (excepto login) requieren autenticación JWT. Incluir el token en el header:

```
Authorization: Bearer <token>
```

## 👥 Roles y Permisos

### Doctor
- Acceso completo a pacientes, prescripciones, historiales
- Crear y gestionar citas
- Ver y crear facturas
- Acceso limitado a su clínica

### Secretary
- Gestionar citas
- Ver pacientes y facturas
- Crear y actualizar pacientes
- Acceso limitado a su clínica

### Admin
- Acceso completo a todo el sistema
- Gestionar usuarios y clínicas
- Configuración del sistema

## 🏗️ Estructura del Proyecto

```
hsalud-pro-backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Configuración de base de datos
│   │   └── auth.js          # Configuración de autenticación
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── clinicController.js
│   │   ├── patientController.js
│   │   ├── serviceController.js
│   │   ├── invoiceController.js
│   │   ├── prescriptionController.js
│   │   ├── medicalRecordController.js
│   │   └── appointmentController.js
│   ├── middleware/
│   │   ├── auth.js          # Middleware de autenticación
│   │   ├── clinicAcces.js   # Control de acceso a clínicas
│   │   └── roleCheck.js     # Verificación de roles
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── clinics.js
│   │   ├── patients.js
│   │   ├── services.js
│   │   ├── invoices.js
│   │   ├── prescriptions.js
│   │   ├── medicalRecords.js
│   │   └── appointments.js
│   └── utils/
│       ├── helpers.js       # Funciones de utilidad
│       ├── database.js      # Utilidades de base de datos
│       └── password.js      # Utilidades de contraseñas
├── server.js                # Servidor principal
├── package.json
└── README.md
```

## 🔧 Scripts Disponibles

```bash
npm run dev          # Ejecutar en modo desarrollo
npm start           # Ejecutar en modo producción
npm test            # Ejecutar pruebas
npm run lint        # Linting del código
```

## 🛡️ Seguridad

- **Helmet** - Headers de seguridad
- **CORS** - Control de acceso entre dominios
- **Rate Limiting** - Límite de requests por IP
- **JWT** - Autenticación stateless
- **bcrypt** - Encriptación de contraseñas
- **Validación** - Sanitización de inputs

## 📊 Base de Datos

El sistema utiliza PostgreSQL con las siguientes tablas principales:

- `users` - Usuarios del sistema
- `clinics` - Clínicas médicas
- `patients` - Pacientes
- `medical_services` - Servicios médicos
- `invoices` - Facturas
- `prescriptions` - Prescripciones
- `medical_records` - Historiales médicos
- `appointments` - Citas
- `user_clinics` - Relación usuarios-clínicas

## 🚀 Despliegue

### Variables de entorno para producción:
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=very-long-secure-secret
FRONTEND_URL=https://yourdomain.com
```

### Comandos de despliegue:
```bash
npm install --production
npm start
```

## 📝 Notas

- El sistema está diseñado para funcionar con el frontend React de HSALUD-PRO
- Todas las respuestas están en formato JSON
- Los errores siguen un formato consistente
- El sistema incluye logging para debugging

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.