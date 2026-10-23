const pool = require('../config/db');

exports.crearPrestamo = async (req, res) => {
  const { cliente_id, plan, monto, monto_total, fecha_inicio, fecha_vencimiento, estado, cobrador_id } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO prestamos (cliente_id, plan, monto, monto_total, fecha_inicio, fecha_vencimiento, estado, cobrador_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [cliente_id, plan, monto, monto_total || monto, fecha_inicio, fecha_vencimiento, estado || 'activo', cobrador_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear préstamo', error: err });
  }
};

exports.listarPrestamos = async (req, res) => {
  try {
    let result;
    if (req.user.rol === 'admin') {
      result = await pool.query(
        `SELECT p.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.direccion AS cliente_direccion,
                CONCAT(u.nombre, ' ', u.apellido) AS cobrador_nombre
         FROM prestamos p
         LEFT JOIN clientes c ON p.cliente_id = c.id
         LEFT JOIN usuarios u ON p.cobrador_id = u.id
         ORDER BY p.id DESC`
      );
    } else {
      result = await pool.query(
        `SELECT p.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.direccion AS cliente_direccion,
                CONCAT(u.nombre, ' ', u.apellido) AS cobrador_nombre
         FROM prestamos p
         LEFT JOIN clientes c ON p.cliente_id = c.id
         LEFT JOIN usuarios u ON p.cobrador_id = u.id
         WHERE p.cobrador_id = $1
         ORDER BY p.id DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar préstamos', error: err });
  }
};

exports.editarPrestamo = async (req, res) => {
  // Solo admin puede editar
  if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Solo el administrador puede editar préstamos' });
  const { id } = req.params;
  const { plan, monto, monto_total, fecha_inicio, fecha_vencimiento, estado, cobrador_id } = req.body;
  try {
    const result = await pool.query(
      'UPDATE prestamos SET plan=$1, monto=$2, monto_total=$3, fecha_inicio=$4, fecha_vencimiento=$5, estado=$6, cobrador_id=$7 WHERE id=$8 RETURNING *',
      [plan, monto, monto_total || monto, fecha_inicio, fecha_vencimiento, estado, cobrador_id || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Préstamo no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al editar préstamo', error: err });
  }
};


exports.prestamosVencidos = async (req, res) => {
  try {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().slice(0, 10);
    let result;
    if (req.user.rol === 'admin') {
      result = await pool.query(
        `SELECT p.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.direccion AS cliente_direccion,
                CONCAT(u.nombre, ' ', u.apellido) AS cobrador_nombre
         FROM prestamos p
         LEFT JOIN clientes c ON p.cliente_id = c.id
         LEFT JOIN usuarios u ON p.cobrador_id = u.id
         WHERE p.fecha_vencimiento <= $1 AND p.estado != 'pagado'
         ORDER BY p.fecha_vencimiento ASC`,
        [hoyStr]
      );
    } else {
      result = await pool.query(
        `SELECT p.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.direccion AS cliente_direccion,
                CONCAT(u.nombre, ' ', u.apellido) AS cobrador_nombre
         FROM prestamos p
         LEFT JOIN clientes c ON p.cliente_id = c.id
         LEFT JOIN usuarios u ON p.cobrador_id = u.id
         WHERE p.fecha_vencimiento <= $1 AND p.estado != 'pagado' AND p.cobrador_id = $2
         ORDER BY p.fecha_vencimiento ASC`,
        [hoyStr, req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar vencimientos', error: err });
  }
};

// Endpoint para préstamos próximos a vencer (por ejemplo, próximos 3 días)
exports.prestamosProximosAVencer = async (req, res) => {
  try {
    const hoy = new Date();
    const tresDias = new Date(hoy);
    tresDias.setDate(hoy.getDate() + 3);
    const hoyStr = hoy.toISOString().slice(0, 10);
    const tresDiasStr = tresDias.toISOString().slice(0, 10);
    let result;
    if (req.user.rol === 'admin') {
      result = await pool.query(
        `SELECT p.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.direccion AS cliente_direccion,
                CONCAT(u.nombre, ' ', u.apellido) AS cobrador_nombre
         FROM prestamos p
         LEFT JOIN clientes c ON p.cliente_id = c.id
         LEFT JOIN usuarios u ON p.cobrador_id = u.id
         WHERE p.fecha_vencimiento > $1 AND p.fecha_vencimiento <= $2 AND p.estado != 'pagado'
         ORDER BY p.fecha_vencimiento ASC`,
        [hoyStr, tresDiasStr]
      );
    } else {
      result = await pool.query(
        `SELECT p.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido, c.direccion AS cliente_direccion,
                CONCAT(u.nombre, ' ', u.apellido) AS cobrador_nombre
         FROM prestamos p
         LEFT JOIN clientes c ON p.cliente_id = c.id
         LEFT JOIN usuarios u ON p.cobrador_id = u.id
         WHERE p.fecha_vencimiento > $1 AND p.fecha_vencimiento <= $2 AND p.estado != 'pagado' AND p.cobrador_id = $3
         ORDER BY p.fecha_vencimiento ASC`,
        [hoyStr, tresDiasStr, req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar próximos a vencer', error: err });
  }
};

// Endpoint: saldo pendiente exacto de un préstamo (todo calculado en PostgreSQL NUMERIC)
exports.getSaldoPrestamo = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT p.id,
              COALESCE(p.monto_total, p.monto) AS monto_total,
              COALESCE(SUM(pg.monto), 0) AS total_pagado,
              GREATEST(COALESCE(p.monto_total, p.monto) - COALESCE(SUM(pg.monto), 0), 0) AS saldo_pendiente,
              p.estado
       FROM prestamos p
       LEFT JOIN pagos pg ON pg.prestamo_id = p.id
       WHERE p.id = $1
       GROUP BY p.id, p.monto_total, p.monto, p.estado`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar saldo del préstamo', error: err.message || err });
  }
};

exports.eliminarPrestamo = async (req, res) => {
  // Solo admin puede eliminar préstamos
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede eliminar préstamos' });
  }
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const prestamo = await client.query('SELECT id, estado FROM prestamos WHERE id = $1', [id]);
    if (prestamo.rows.length === 0) {
      return res.status(404).json({ message: 'Préstamo no encontrado' });
    }
    if (prestamo.rows[0].estado !== 'pagado') {
      return res.status(400).json({ message: 'Solo se pueden eliminar préstamos con estado pagado' });
    }
    await client.query('BEGIN');
    await client.query('DELETE FROM pagos WHERE prestamo_id = $1', [id]);
    const result = await client.query('DELETE FROM prestamos WHERE id = $1 RETURNING *', [id]);
    await client.query('COMMIT');
    res.json({ message: 'Préstamo eliminado', prestamo: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Error al eliminar préstamo', error: err.message || err });
  } finally {
    client.release();
  }
};
