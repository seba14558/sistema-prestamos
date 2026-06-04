const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', pagosController.registrarPago); // Registrar pago
router.get('/recaudacion', pagosController.verRecaudacion); // Ver recaudación (por cobrador o admin)
router.put('/:id', pagosController.editarPago); // Editar pago (solo admin)
router.delete('/:id', pagosController.eliminarPago); // Eliminar pago (solo admin)

module.exports = router;
