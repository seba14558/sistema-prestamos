const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', pagosController.registrarPago); // Registrar pago
router.get('/recaudacion', pagosController.verRecaudacion); // Ver recaudación (por cobrador o admin)

module.exports = router;
