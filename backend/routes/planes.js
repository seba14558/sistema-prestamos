const express = require('express');
const router = express.Router();
const planesController = require('../controllers/planesController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', planesController.listarPlanes); // Listado
router.post('/', planesController.crearPlan); // Crear (solo admin)
router.put('/:id', planesController.editarPlan); // Editar (solo admin)
router.delete('/:id', planesController.eliminarPlan); // Eliminar (solo admin)

module.exports = router;
