const express = require('express');
const router = express.Router();
const { getNotificaciones, getUnreadCount, markAsRead, markAllAsRead } = require('../controllers/notificacionesController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener notificaciones del usuario
router.get('/', authMiddleware, getNotificaciones);

// Obtener conteo de notificaciones no leídas
router.get('/unread-count', authMiddleware, getUnreadCount);

// Marcar notificación como leída
router.put('/:id/read', authMiddleware, markAsRead);

// Marcar todas las notificaciones como leídas
router.put('/mark-all-read', authMiddleware, markAllAsRead);

module.exports = router;
