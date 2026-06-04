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
  
  // Solo admin puede eliminar clientes
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede eliminar clientes' });
  }
  
  try {
    // Verificar si el cliente tiene préstamos activos
    const prestamosResult = await pool.query(
      'SELECT COUNT(*) as count FROM prestamos WHERE cliente_id = $1 AND estado != $2',
      [id, 'pagado']
    );
    const prestamosCount = parseInt(prestamosResult.rows[0].count);
    
    if (prestamosCount > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el cliente porque tiene préstamos activos' 
      });
    }
    
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar cliente', error: err });
  }
};
