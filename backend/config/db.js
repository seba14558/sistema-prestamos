// Configuración de conexión a PostgreSQL usando node-postgres (pg)
const { Pool } = require('pg');
require('dotenv').config();

// Usar DATABASE_URL si está disponible (Railway), sino usar variables individuales
const connectionString = process.env.DATABASE_URL;

const pool = connectionString 
  ? new Pool({ connectionString })
  : new Pool({
      user: process.env.PGUSER || 'postgres',
      host: process.env.PGHOST || 'localhost',
      database: process.env.PGDATABASE || 'prestamos_db',
      password: process.env.PGPASSWORD || 'tu_contraseña',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
    });

module.exports = pool;