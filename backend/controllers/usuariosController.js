const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.obtenerUsuarios = async (req, res) => {
  // Solo admin puede ver todos los usuarios
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede ver usuarios' });
  }
  
  try {
    const result = await pool.query(
      'SELECT id, nombre, apellido, usuario, rol FROM usuarios ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err });
  }
};

exports.editarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, usuario, password, rol } = req.body;
  
  // Solo admin puede editar usuarios
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede editar usuarios' });
  }
  
  try {
    let query, params;
    
    if (password) {
      // Si se proporciona contraseña, cifrarla
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE usuarios SET nombre = $1, apellido = $2, usuario = $3, password = $4, rol = $5 WHERE id = $6 RETURNING id, nombre, apellido, usuario, rol';
      params = [nombre, apellido, usuario, hashedPassword, rol, id];
    } else {
      // Si no se proporciona contraseña, mantener la existente
      query = 'UPDATE usuarios SET nombre = $1, apellido = $2, usuario = $3, rol = $4 WHERE id = $5 RETURNING id, nombre, apellido, usuario, rol';
      params = [nombre, apellido, usuario, rol, id];
    }
    
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error al editar usuario', error: err });
  }
};

exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  
  // Solo admin puede eliminar usuarios
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede eliminar usuarios' });
  }
  
  // No permitir eliminar el propio usuario
  if (parseInt(id) === req.user.id) {
    return res.status(400).json({ message: 'No puedes eliminar tu propio usuario' });
  }
  
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: err });
  }
};

exports.crearUsuario = async (req, res) => {
  const { nombre, apellido, usuario, password, rol } = req.body;
  
  // Solo admin puede crear usuarios
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Solo el administrador puede crear usuarios' });
  }
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, apellido, usuario, password, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, apellido, usuario, rol',
      [nombre, apellido, usuario, hashedPassword, rol]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }
    res.status(500).json({ message: 'Error al crear usuario', error: err });
  }
};
