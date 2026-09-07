const pool = require('../config/db');

exports.crearCliente = async (req, res) => {
  const { nombre, apellido, direccion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO clientes (nombre, apellido, direccion) VALUES ($1, $2, $3) RETURNING *',
      [nombre, apellido, direccion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear cliente', error: err });
  }
};

exports.listarClientes = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar clientes', error: err });
  }
};

exports.editarCliente = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, direccion } = req.body;
  try {
    const result = await pool.query(
      'UPDATE clientes SET nombre=$1, apellido=$2, direccion=$3 WHERE id=$4 RETURNING *',
      [nombre, apellido, direccion, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al editar cliente', error: err });
  }
};

exports.eliminarCliente = async (req, res) => {
  const { id } = req.params;
  
  console.log('Intentando eliminar cliente:', id);
  console.log('Usuario autenticado:', req.user);
  console.log('Rol del usuario:', req.user?.rol);
  
  // Validar que req.user existe y tiene rol
  if (!req.user || !req.user.rol) {
    console.log('Acceso denegado: usuario no autenticado correctamente');
    return res.status(401).json({ message: 'Usuario no autenticado correctamente' });
  }
  
  // Solo admin puede eliminar clientes
  if (req.user.rol !== 'admin') {
    console.log('Acceso denegado: rol no es admin');
    return res.status(403).json({ message: 'Solo el administrador puede eliminar clientes' });
  }
  
  try {
    // Verificar si el cliente tiene préstamos con saldo pendiente > 0
    const prestamosConSaldoResult = await pool.query(
      `SELECT p.id, 
              COALESCE(p.monto_total, p.monto) AS monto_total,
              COALESCE(SUM(pg.monto), 0) AS total_pagado,
              (COALESCE(p.monto_total, p.monto) - COALESCE(SUM(pg.monto), 0)) AS saldo_pendiente
       FROM prestamos p
       LEFT JOIN pagos pg ON pg.prestamo_id = p.id
       WHERE p.cliente_id = $1
       GROUP BY p.id, p.monto_total, p.monto
       HAVING (COALESCE(p.monto_total, p.monto) - COALESCE(SUM(pg.monto), 0)) > 0.01`,
      [id]
    );
    
    const prestamosConSaldo = prestamosConSaldoResult.rows;
    console.log('Préstamos con saldo pendiente del cliente:', prestamosConSaldo.length);
    console.log('Detalles de préstamos con saldo:', JSON.stringify(prestamosConSaldo, null, 2));
    
    // También verificar todos los préstamos del cliente para debug
    const todosPrestamosDebug = await pool.query(
      `SELECT p.id, p.estado,
              COALESCE(p.monto_total, p.monto) AS monto_total,
              COALESCE(SUM(pg.monto), 0) AS total_pagado,
              (COALESCE(p.monto_total, p.monto) - COALESCE(SUM(pg.monto), 0)) AS saldo_pendiente
       FROM prestamos p
       LEFT JOIN pagos pg ON pg.prestamo_id = p.id
       WHERE p.cliente_id = $1
       GROUP BY p.id, p.monto_total, p.monto, p.estado`,
      [id]
    );
    console.log('Todos los préstamos del cliente (debug):', JSON.stringify(todosPrestamosDebug.rows, null, 2));
    
    if (prestamosConSaldo.length > 0) {
      console.log('Cliente tiene préstamos con saldo pendiente:', prestamosConSaldo);
      return res.status(400).json({ 
        message: 'No se puede eliminar el cliente porque tiene préstamos con saldo pendiente',
        prestamos: prestamosConSaldo,
        debug: todosPrestamosDebug.rows
      });
    }
    
    // Obtener todos los préstamos del cliente (independientemente del estado)
    const todosPrestamosResult = await pool.query(
      'SELECT id FROM prestamos WHERE cliente_id = $1',
      [id]
    );
    const todosPrestamos = todosPrestamosResult.rows;
    console.log('Total préstamos del cliente:', todosPrestamos.length);
    
    // Eliminar todos los préstamos y sus pagos asociados (tienen saldo 0)
    for (const prestamo of todosPrestamos) {
      console.log('Eliminando pagos del préstamo:', prestamo.id);
      await pool.query('DELETE FROM pagos WHERE prestamo_id = $1', [prestamo.id]);
      console.log('Eliminando préstamo:', prestamo.id);
      await pool.query('DELETE FROM prestamos WHERE id = $1', [prestamo.id]);
    }
    
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    console.log('Resultado eliminación:', result.rows);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    console.log('Cliente eliminado exitosamente');
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ message: 'Error al eliminar cliente', error: err });
  }
};
