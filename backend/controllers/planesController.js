const pool = require('../config/db');

exports.listarPlanes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM planes ORDER BY dias ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al listar planes', error: err });
  }
};

exports.crearPlan = async (req, res) => {
  // Solo admin puede crear planes
  if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Solo el administrador puede crear planes' });
  
  const { nombre, dias, porcentaje_interes, activo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO planes (nombre, dias, porcentaje_interes, activo) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, dias, porcentaje_interes, activo !== undefined ? activo : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear plan', error: err });
  }
};

exports.editarPlan = async (req, res) => {
  // Solo admin puede editar planes
  if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Solo el administrador puede editar planes' });
  
  const { id } = req.params;
  const { nombre, dias, porcentaje_interes, activo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE planes SET nombre=$1, dias=$2, porcentaje_interes=$3, activo=$4 WHERE id=$5 RETURNING *',
      [nombre, dias, porcentaje_interes, activo, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Plan no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al editar plan', error: err });
  }
};

exports.eliminarPlan = async (req, res) => {
  // Solo admin puede eliminar planes
  if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Solo el administrador puede eliminar planes' });
  
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM planes WHERE id=$1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Plan no encontrado' });
    res.json({ message: 'Plan eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar plan', error: err });
  }
};
