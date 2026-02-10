// src/controllers/automationController.js
const automatedEmailService = require('../services/automatedEmailService');

// Obtener configuración de automatización
const getAutomationConfig = async (req, res) => {
  try {
    const config = automatedEmailService.automationConfig();
    const isActive = automatedEmailService.isActive();
    
    res.json({
      success: true,
      config,
      isActive
    });
  } catch (error) {
    console.error('Error obteniendo configuración de automatización:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

// Actualizar configuración de automatización
const updateAutomationConfig = async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config || !config.appointmentReminders) {
      return res.status(400).json({
        success: false,
        error: 'Configuración inválida'
      });
    }
    
    await automatedEmailService.saveAutomationConfig(config);
    
    // Reiniciar automatización con nueva configuración
    automatedEmailService.stopAutomation();
    await automatedEmailService.startAutomation();
    
    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      config: automatedEmailService.automationConfig(),
      isActive: automatedEmailService.isActive()
    });
  } catch (error) {
    console.error('Error actualizando configuración de automatización:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

// Obtener estadísticas de automatización
const getAutomationStats = async (req, res) => {
  try {
    const stats = await automatedEmailService.getAutomationStats();
    
    res.json({
      success: true,
      ...stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de automatización:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

// Ejecutar recordatorios manualmente
const runManualReminders = async (req, res) => {
  try {
    await automatedEmailService.runManualReminders();
    
    res.json({
      success: true,
      message: 'Recordatorios ejecutados manualmente'
    });
  } catch (error) {
    console.error('Error ejecutando recordatorios manualmente:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

// Iniciar automatización
const startAutomation = async (req, res) => {
  try {
    await automatedEmailService.startAutomation();
    
    res.json({
      success: true,
      message: 'Automatización iniciada',
      isActive: automatedEmailService.isActive()
    });
  } catch (error) {
    console.error('Error iniciando automatización:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

// Detener automatización
const stopAutomation = async (req, res) => {
  try {
    automatedEmailService.stopAutomation();
    
    res.json({
      success: true,
      message: 'Automatización detenida',
      isActive: automatedEmailService.isActive()
    });
  } catch (error) {
    console.error('Error deteniendo automatización:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error interno del servidor' 
    });
  }
};

module.exports = {
  getAutomationConfig,
  updateAutomationConfig,
  getAutomationStats,
  runManualReminders,
  startAutomation,
  stopAutomation
};
