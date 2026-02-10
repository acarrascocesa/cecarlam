// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Servicios de automatización
const automatedEmailService = require('./src/services/automatedEmailService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware

app.set('trust proxy', true);
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:3010",
    "http://162.245.191.108:3010",
    "http://162.245.191.108",
    "https://cecarlam.com",
    "http://cecarlam.com",
    "https://www.cecarlam.com",
    "http://www.cecarlam.com"
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: true, // No contar requests exitosos
  skipFailedRequests: false, // Contar requests fallidos
  trustProxy: false // Deshabilitar trust proxy para evitar el error
});
app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware para debug
app.use((req, res, next) => {
  if (req.path.includes('patient-attachments/download')) {
    console.log('🔍 REQUEST RECIBIDO:', req.method, req.path, req.originalUrl);
  }
  next();
});

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/clinics', require('./src/routes/clinics'));
app.use('/api/patients', require('./src/routes/patients'));
app.use('/api/services', require('./src/routes/services'));
app.use('/api/invoices', require('./src/routes/invoices'));
app.use('/api/prescriptions', require('./src/routes/prescriptions'));
app.use('/api/user-clinics', require('./src/routes/userClinics'));
app.use('/api/medications', require('./src/routes/medications'));
app.use('/api/analytics', require('./src/routes/analytics'));
app.use('/api/medical-records', require('./src/routes/medicalRecords'));
app.use('/api/appointments', require('./src/routes/appointments'));
app.use('/api/attachments', require('./src/routes/attachments'));
app.use('/api/emails', require('./src/routes/emails'));
app.use('/api/email-templates', require('./src/routes/emailTemplates'));
app.use("/api/patient-attachments", require("./src/routes/patientAttachments"));
app.use('/api/patient-links', require('./src/routes/patientLinks'));
app.use('/api/config', require('./src/routes/config'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/automation', require('./src/routes/automation'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  
  // Iniciar automatización de recordatorios
  try {
    await automatedEmailService.startAutomation();
  } catch (error) {
    console.error('❌ Error iniciando automatización:', error);
  }
});
