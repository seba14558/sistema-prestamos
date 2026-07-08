// Configuración de conexión a PostgreSQL usando node-postgres (pg)
const { Pool } = require('pg');
require('dotenv').config();

// Usar DATABASE_URL si está disponible (Render), sino usar variables individuales
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'prestamos',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

module.exports = pool;