// Configuración de conexión a PostgreSQL usando node-postgres (pg)
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'prestamos_db',
  password: process.env.PGPASSWORD || 'tu_contraseña',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

module.exports = pool;