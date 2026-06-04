const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');
const authMiddleware = require('../middleware/authMiddleware');

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

router.post('/', clientesController.crearCliente); // Alta
router.get('/', clientesController.listarClientes); // Listado
router.put('/:id', clientesController.editarCliente); // Edición
router.delete('/:id', clientesController.eliminarCliente); // Eliminación (solo admin)

module.exports = router;
