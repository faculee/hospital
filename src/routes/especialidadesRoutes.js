const express = require('express');
const router = express.Router();
const especialidadesController = require('../controllers/especialidadesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1]), especialidadesController.listar);
router.get('/:id', estaAutenticado, tieneRol([1]), especialidadesController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), especialidadesController.crear);
router.put('/:id', estaAutenticado, tieneRol([1]), especialidadesController.actualizar);
router.delete('/:id', estaAutenticado, tieneRol([1]), especialidadesController.eliminar);

module.exports = router;
