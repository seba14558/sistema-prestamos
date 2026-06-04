const pool = require('./config/db');

async function fixAdminRole() {
  try {
    const result = await pool.query("UPDATE usuarios SET rol = 'admin' WHERE usuario = 'admin' RETURNING *");
    console.log('Usuario admin actualizado:', result.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    pool.end();
  }
}

fixAdminRole();
