const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { usuario, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET || 'secreto', { expiresIn: '8h' });
    res.json({ token, usuario: user.usuario, rol: user.rol });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err });
  }
};
