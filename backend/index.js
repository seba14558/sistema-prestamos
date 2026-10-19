const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3004',
  'http://192.168.1.35:3000',
  'http://localhost:3002',
  'http://192.168.1.35:3002',
  'https://sistema-prestamos-nueva-opcion-ormd5co60-sistema-jobs.vercel.app',
  // URLs de producción (se agregarán después del despliegue)
  'https://sistema-prestamos-production-3b24.up.railway.app',
  'https://sistema-prestamos-iota.vercel.app',
];
app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origin (como mobile apps o Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'production') {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  const pool = require('./config/db');
  try {
    // Tabla de usuarios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        apellido VARCHAR(50) NOT NULL,
        usuario VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) NOT NULL
      )
    `);

    // Tabla de clientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL,
        apellido VARCHAR(50) NOT NULL,
        direccion VARCHAR(100) NOT NULL,
        telefono VARCHAR(20)
      )
    `);

    // Asegurar que la columna telefono existe si la tabla ya existía previamente
    await pool.query(`
      ALTER TABLE clientes ADD COLUMN IF NOT EXISTS telefono VARCHAR(20)
    `);

    // Tabla de prestamos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS prestamos (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER REFERENCES clientes(id),
        plan VARCHAR(50) NOT NULL,
        monto NUMERIC(12,2) NOT NULL,
        monto_total NUMERIC(12,2),
        fecha_inicio DATE NOT NULL,
        fecha_vencimiento DATE NOT NULL,
        estado VARCHAR(20) NOT NULL
      )
    `);

    // Asegurar que la columna monto_total existe si la tabla ya existía previamente
    await pool.query(`
      ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS monto_total NUMERIC(12,2);
      UPDATE prestamos SET monto_total = monto WHERE monto_total IS NULL;
    `);

    // Asegurar que la columna cobrador_id existe en prestamos
    await pool.query(`
      ALTER TABLE prestamos ADD COLUMN IF NOT EXISTS cobrador_id INTEGER REFERENCES usuarios(id)
    `);

    // Crear índice para cobrador_id si no existe
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_prestamos_cobrador_id ON prestamos(cobrador_id)
    `);

    // Tabla de pagos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pagos (
        id SERIAL PRIMARY KEY,
        prestamo_id INTEGER REFERENCES prestamos(id),
        fecha_pago DATE NOT NULL,
        monto NUMERIC(12,2) NOT NULL,
        cobrador_id INTEGER REFERENCES usuarios(id)
      )
    `);

    // Tabla de notificaciones
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        mensaje TEXT NOT NULL,
        leida BOOLEAN DEFAULT FALSE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de planes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS planes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(50) NOT NULL UNIQUE,
        dias INTEGER NOT NULL,
        porcentaje_interes NUMERIC(5,2) NOT NULL,
        activo BOOLEAN DEFAULT true
      )
    `);

    // Insertar planes iniciales si no existen
    const planesCount = await pool.query('SELECT COUNT(*) FROM planes');
    if (parseInt(planesCount.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO planes (nombre, dias, porcentaje_interes) VALUES
        ('30 dias', 30, 30.00),
        ('40 dias', 40, 35.00),
        ('50 dias', 50, 40.00),
        ('7 dias', 7, 15.00),
        ('14 dias', 14, 20.00)
      `);
    }

    console.log('✅ Tablas de base de datos verificadas/creadas exitosamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  }
};

// Rutas de ejemplo
app.get('/', (req, res) => {
  res.send('API de Préstamos funcionando');
});


const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const clientesRoutes = require('./routes/clientes');
app.use('/api/clientes', clientesRoutes);

const prestamosRoutes = require('./routes/prestamos');
app.use('/api/prestamos', prestamosRoutes);

const pagosRoutes = require('./routes/pagos');
app.use('/api/pagos', pagosRoutes);

const notificacionesRoutes = require('./routes/notificaciones');
app.use('/api/notificaciones', notificacionesRoutes);

const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);

const planesRoutes = require('./routes/planes');
app.use('/api/planes', planesRoutes);

// Iniciar cron job para verificar préstamos por vencer
require('./cron/checkDueLoans');
// Aquí se agregarán las rutas de usuarios, clientes, préstamos, pagos, etc.

// Inicializar base de datos y luego iniciar servidor
initializeDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor backend escuchando en http://0.0.0.0:${PORT}`);
    console.log(`Accesible desde la red local en http://192.168.1.35:${PORT}`);
  });
});
