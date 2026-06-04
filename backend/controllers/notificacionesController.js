const pool = require('../config/db');

// Obtener notificaciones del usuario
const getNotificaciones = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT n.*, 
             c.nombre as cliente_nombre, 
             c.apellido as cliente_apellido,
             p.plan as prestamo_plan
      FROM notificaciones n
      LEFT JOIN clientes c ON n.cliente_id = c.id
      LEFT JOIN prestamos p ON n.prestamo_id = p.id
      WHERE n.usuario_id = $1
      ORDER BY n.fecha_creacion DESC
      LIMIT 50
    `, [userId]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener notificaciones:', err);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
};

// Obtener conteo de notificaciones no leídas
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await pool.query(`
      SELECT COUNT(*) as count
      FROM notificaciones
      WHERE usuario_id = $1 AND leida = FALSE
    `, [userId]);

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (err) {
    console.error('Error al obtener conteo de notificaciones:', err);
    res.status(500).json({ message: 'Error al obtener conteo de notificaciones' });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    await pool.query(`
      UPDATE notificaciones
      SET leida = TRUE
      WHERE id = $1 AND usuario_id = $2
    `, [id, userId]);

    res.json({ message: 'Notificación marcada como leída' });
  } catch (err) {
    console.error('Error al marcar notificación como leída:', err);
    res.status(500).json({ message: 'Error al marcar notificación como leída' });
  }
};

// Marcar todas las notificaciones como leídas
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await pool.query(`
      UPDATE notificaciones
      SET leida = TRUE
      WHERE usuario_id = $1 AND leida = FALSE
    `, [userId]);

    res.json({ message: 'Todas las notificaciones marcadas como leídas' });
  } catch (err) {
    console.error('Error al marcar todas las notificaciones como leídas:', err);
    res.status(500).json({ message: 'Error al marcar todas las notificaciones como leídas' });
  }
};

module.exports = {
  getNotificaciones,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
