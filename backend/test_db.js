// Prueba de conexión a PostgreSQL
const pool = require('./config/db');

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexión exitosa:', res.rows[0]);
  } catch (err) {
    console.error('Error de conexión:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
