// Script para crear la tabla de notificaciones
const pool = require('./config/db');

async function createNotificationsTable() {
  try {
    // Tabla de notificaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        tipo VARCHAR(50) NOT NULL,
        titulo VARCHAR(100) NOT NULL,
        mensaje TEXT NOT NULL,
        prestamo_id INTEGER REFERENCES prestamos(id),
        cliente_id INTEGER REFERENCES clientes(id),
        leida BOOLEAN DEFAULT FALSE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Tabla notificaciones creada exitosamente');

    // Índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario_id ON notificaciones(usuario_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha_creacion ON notificaciones(fecha_creacion)
    `);
    console.log('Índices creados exitosamente');
  } catch (err) {
    console.error('Error al crear tabla de notificaciones:', err);
  } finally {
    await pool.end();
  }
}

createNotificationsTable();
