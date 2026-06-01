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
