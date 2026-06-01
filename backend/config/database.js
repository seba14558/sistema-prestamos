// Configuración de conexión a PostgreSQL para desarrollo local
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres', // Cambia si tu usuario es diferente
  host: 'localhost',
  database: 'prestamos_db',
  password: 'tu_contraseña', // Cambia por tu contraseña real
  port: 5432,
});

module.exports = pool;