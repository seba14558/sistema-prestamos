const pool = require('../config/db');

exports.registrarPago = async (req, res) => {
  const { prestamo_id, fecha_pago, monto } = req.body;
  const cobrador_id = req.user.id;

  // Validación básica del monto antes de hacer cualquier consulta
  const montoPago = parseFloat(monto);
  if (!prestamo_id || !fecha_pago || !monto || isNaN(montoPago) || montoPago <= 0) {
    return res.status(400).json({ message: 'Debes enviar un préstamo válido, fecha de pago y un monto positivo.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Traer datos del préstamo con el saldo ya calculado en SQL (NUMERIC exacto)
    const prestamoResult = await client.query(
      `SELECT p.id, p.monto_total, p.estado,
              COALESCE(SUM(pg.monto), 0) AS total_pagado,
              (COALESCE(p.monto_total, p.monto) - COALESCE(SUM(pg.monto), 0)) AS saldo_pendiente
       FROM prestamos p
       LEFT JOIN pagos pg ON pg.prestamo_id = p.id
       WHERE p.id = $1
       GROUP BY p.id, p.monto_total, p.monto, p.estado
       FOR UPDATE OF p`,
      [prestamo_id]
    );

    if (prestamoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Préstamo no encontrado.' });
    }

    const prestamo = prestamoResult.rows[0];
    const saldoPendiente = parseFloat(prestamo.saldo_pendiente);

    // Comparación con tolerancia de 1 centavo para evitar errores de redondeo
    if (montoPago > saldoPendiente + 0.01) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: `El monto supera el saldo pendiente del préstamo. Saldo disponible: ${saldoPendiente.toFixed(2)}`
      });
    }

    // Insertar el pago
    const result = await client.query(
      'INSERT INTO pagos (prestamo_id, fecha_pago, monto, cobrador_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [prestamo_id, fecha_pago, montoPago, cobrador_id]
    );

    // Actualizar estado a 'pagado' usando comparación en SQL para evitar problemas de punto flotante
    // Si el nuevo total pagado >= monto_total (con tolerancia de 1 centavo), marcar como pagado
    await client.query(
      `UPDATE prestamos
       SET estado = CASE
         WHEN (
           SELECT COALESCE(SUM(monto), 0) FROM pagos WHERE prestamo_id = $1
         ) >= COALESCE(monto_total, monto) - 0.01
         THEN 'pagado'
         ELSE estado
       END
       WHERE id = $1`,
      [prestamo_id]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al registrar pago:', err);
    res.status(500).json({ message: 'Error al registrar pago', error: err.message || err });
  } finally {
    client.release();
  }

};

exports.verRecaudacion = async (req, res) => {
  try {
    let result;
    if (req.user.rol === 'admin') {
      result = await pool.query(
        `SELECT p.*, 
                c.nombre AS cliente_nombre, c.apellido AS cliente_apellido,
                CONCAT(u.nombre, ' ', u.apellido) AS cobrador_usuario
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
                CONCAT(u.nombre, ' ', u.apellido) AS cobrador_usuario
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
