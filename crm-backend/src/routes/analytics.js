// src/routes/analytics.js
const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getAnalytics,
  getAnalyticById,
  createAnalytic,
  updateAnalytic,
  deleteAnalytic,
  getAnalyticsByCategory,
  searchAnalytics
} = require('../controllers/analyticsController');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Buscar analíticas (debe ir antes que /:id)
router.get('/search', searchAnalytics);

// Obtener categorías de analíticas
router.get('/categories', getAnalyticsByCategory);

// Obtener todas las analíticas
router.get('/', requireRole(['doctor', 'secretary']), getAnalytics);

// Crear nueva analítica (solo doctores)
router.post('/', requireRole(['doctor']), createAnalytic);

// Obtener analítica por ID
router.get('/:id', requireRole(['doctor', 'secretary']), getAnalyticById);

// Actualizar analítica (solo el doctor que la creó)
router.put('/:id', requireRole(['doctor']), updateAnalytic);

// Eliminar analítica (solo el doctor que la creó)
router.delete('/:id', requireRole(['doctor']), deleteAnalytic);

module.exports = router;
