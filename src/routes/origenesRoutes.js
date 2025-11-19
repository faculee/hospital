const express = require('express');
const router = express.Router();
const origenesController = require('../controllers/origenesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,2]), origenesController.listar);
router.get('/:id', estaAutenticado, tieneRol([1,2]), origenesController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), origenesController.crear);
router.put('/:id', estaAutenticado, tieneRol([1]), origenesController.actualizar);
router.delete('/:id', estaAutenticado, tieneRol([1]), origenesController.eliminar);

module.exports = router;