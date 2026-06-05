// Script para actualizar la contraseña del usuario admin sin eliminarlo
const pool = require('./config/db');
const bcrypt = require('bcrypt');

async function updateAdminPassword() {
  try {
    // Cifrar la nueva contraseña
    const adminPass = await bcrypt.hash('1234', 10);
    
    // Actualizar el usuario admin existente
    const result = await pool.query(
      "UPDATE usuarios SET password = $1 WHERE usuario = 'admin'",
      [adminPass]
    );
    
    if (result.rowCount > 0) {
      console.log('Contraseña del usuario admin actualizada exitosamente');
    } else {
      console.log('No se encontró el usuario admin, creándolo...');
      await pool.query(
        `INSERT INTO usuarios (nombre, apellido, usuario, password, rol) VALUES
        ('Sebastian', 'Noguera', 'admin', $1, 'admin')`,
        [adminPass]
      );
      console.log('Usuario admin creado exitosamente');
    }
  } catch (err) {
    console.error('Error al actualizar/crear usuario admin:', err);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();
