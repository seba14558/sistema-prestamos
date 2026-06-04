const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', usuariosController.obtenerUsuarios); // Obtener todos los usuarios (solo admin)
router.post('/', usuariosController.crearUsuario); // Crear usuario (solo admin)
router.put('/:id', usuariosController.editarUsuario); // Editar usuario (solo admin)
router.delete('/:id', usuariosController.eliminarUsuario); // Eliminar usuario (solo admin)

module.exports = router;
