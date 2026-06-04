const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3004'];
app.use(cors({
  origin: function (origin, callback) {
    // permitir peticiones sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'El origen CORS no es permitido para esta petición.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
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

// Iniciar cron job para verificar préstamos por vencer
require('./cron/checkDueLoans');
// Aquí se agregarán las rutas de usuarios, clientes, préstamos, pagos, etc.

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});
