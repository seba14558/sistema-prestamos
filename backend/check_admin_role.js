const pool = require('./config/db');

async function checkAdminRole() {
  try {
    const result = await pool.query("SELECT id, usuario, rol FROM usuarios WHERE usuario = 'admin'");
    console.log('Usuario admin:', result.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

checkAdminRole();
