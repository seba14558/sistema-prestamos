const pool = require('../config/db');

exports.registrarPago = async (req, res) => {
  const { prestamo_id, fecha_pago, monto } = req.body;
  const cobrador_id = req.user.id;
  try {
    const result = await pool.query(
      'INSERT INTO pagos (prestamo_id, fecha_pago, monto, cobrador_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [prestamo_id, fecha_pago, monto, cobrador_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al registrar pago', error: err });
  }
};

exports.verRecaudacion = async (req, res) => {
  try {
    let result;
    if (req.user.rol === 'admin') {
      result = await pool.query(
        `SELECT p.*, 
                c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
                u.usuario AS cobrador_usuario
         FROM pagos p
         LEFT JOIN prestamos pr ON p.prestamo_id = pr.id
         LEFT JOIN clientes c ON pr.cliente_id = c.id
         LEFT JOIN usuarios u ON p.cobrador_id = u.id
         ORDER BY p.fecha_pago DESC, p.id DESC`
      );
    } else {
      result = await pool.query(
        `SELECT p.*, 
                c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
                u.usuario AS cobrador_usuario
         FROM pagos p
         LEFT JOIN prestamos pr ON p.prestamo_id = pr.id
         LEFT JOIN clientes c ON pr.cliente_id = c.id
         LEFT JOIN usuarios u ON p.cobrador_id = u.id
         WHERE p.cobrador_id = $1 
         ORDER BY p.fecha_pago DESC, p.id DESC`,
        [req.user.id]
      );
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al consultar recaudación', error: err });
  }
};

exports.editarPago = async (req, res) => {
  const { id } = req.params;
  const { fecha_pago, monto } = req.body;
  
  // Solo admin puede editar pagos
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede editar pagos' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE pagos SET fecha_pago = $1, monto = $2 WHERE id = $3 RETURNING *',
      [fecha_pago, monto, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al editar pago', error: err });
  }
};

exports.eliminarPago = async (req, res) => {
  const { id } = req.params;
  
  // Solo admin puede eliminar pagos
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede eliminar pagos' });
  }
  
  try {
    const result = await pool.query('DELETE FROM pagos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }
    res.json({ message: 'Pago eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar pago', error: err });
  }
};
