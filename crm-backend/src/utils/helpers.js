// src/utils/helpers.js

// Función para formatear fechas
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

// Función para formatear fechas con hora
const formatDateTime = (date) => {
  if (!date) return null;
  return new Date(date).toISOString();
};

// Función para validar email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Función para validar teléfono dominicano
const isValidPhone = (phone) => {
  const phoneRegex = /^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
};

// Función para validar cédula dominicana
const isValidCedula = (cedula) => {
  if (!cedula || cedula.length !== 11) return false;
  
  // Validar que solo contenga números
  if (!/^\d+$/.test(cedula)) return false;
  
  // Validar que no sea una cédula con todos los dígitos iguales
  if (/^(\d)\1{10}$/.test(cedula)) return false;
  
  return true;
};

// Función para generar número de factura
const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `INV-${timestamp}-${random}`;
};

// Función para calcular edad
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Función para formatear moneda dominicana
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(amount);
};

// Función para limpiar y validar datos de entrada
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remover caracteres potencialmente peligrosos
    .replace(/\s+/g, ' '); // Normalizar espacios
};

// Función para generar slug
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Función para validar contraseña
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra minúscula' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos una letra mayúscula' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'La contraseña debe contener al menos un número' };
  }
  
  return { isValid: true, message: 'Contraseña válida' };
};

// Función para manejar errores de base de datos
const handleDatabaseError = (error) => {
  console.error('Database Error:', error);
  
  if (error.code === '23505') { // Unique violation
    return { error: 'El registro ya existe', code: 409 };
  }
  
  if (error.code === '23503') { // Foreign key violation
    return { error: 'Referencia inválida', code: 400 };
  }
  
  if (error.code === '23502') { // Not null violation
    return { error: 'Campo requerido faltante', code: 400 };
  }
  
  return { error: 'Error interno del servidor', code: 500 };
};

module.exports = {
  formatDate,
  formatDateTime,
  isValidEmail,
  isValidPhone,
  isValidCedula,
  generateInvoiceNumber,
  calculateAge,
  formatCurrency,
  sanitizeInput,
  generateSlug,
  validatePassword,
  handleDatabaseError
};
