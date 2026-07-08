const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3004', 'http://192.168.1.35:3000', 'http://localhost:3002', 'http://192.168.1.35:3002', 'https://sistema-prestamos-nueva-opcion-ormd5co60-sistema-jobs.vercel.app', 'https://sistema-prestamos-iota.vercel.app'];
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

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

// Iniciar cron job para verificar préstamos por vencer
require('./cron/checkDueLoans');
// Aquí se agregarán las rutas de usuarios, clientes, préstamos, pagos, etc.

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor backend escuchando en http://0.0.0.0:${PORT}`);
  console.log(`Accesible desde la red local en http://192.168.1.35:${PORT}`);
});
