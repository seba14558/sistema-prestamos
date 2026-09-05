const express = require('express');
const router = express.Router();
const prestamosController = require('../controllers/prestamosController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/', prestamosController.crearPrestamo); // Alta
router.get('/', prestamosController.listarPrestamos); // Listado
router.get('/vencimientos', prestamosController.prestamosVencidos); // Vencidos/morosos
router.get('/proximos-vencer', prestamosController.prestamosProximosAVencer); // Próximos a vencer
router.get('/:id/saldo', prestamosController.getSaldoPrestamo); // Saldo pendiente de un préstamo
router.put('/:id', prestamosController.editarPrestamo); // Edición (solo admin)

module.exports = router;
