// Script para crear un usuario administrador personalizado y uno cobrador en la base de datos
const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function crearUsuarios() {
  // Cifrar contraseñas con bcrypt (requerido por el backend)
  const adminPass = await bcrypt.hash('1234', 10); // Contraseña para Sebastian: '1234'
  const cobradorPass = await bcrypt.hash('cobrador123', 10); // Contraseña para cobrador: 'cobrador123'
  
  try {
    // Primero, limpiar si existiera el usuario 'admin' para evitar conflictos con claves sin cifrar
    await pool.query("DELETE FROM usuarios WHERE usuario = 'admin'");
    await pool.query("DELETE FROM usuarios WHERE usuario = 'cobrador'");

    // Insertar usuarios con contraseñas cifradas
    await pool.query(
      `INSERT INTO usuarios (nombre, apellido, usuario, password, rol) VALUES
      ('Sebastian', 'Noguera', 'admin', $1, 'admin'),
      ('Cobrador', 'Uno', 'cobrador', $2, 'cobrador')`,
      [adminPass, cobradorPass]
    );
    console.log('Usuarios creados exitosamente con contraseñas cifradas');
  } catch (err) {
    console.error('Error al crear usuarios:', err);
  } finally {
    await pool.end();
  }
}

crearUsuarios();
