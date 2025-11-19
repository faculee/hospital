const express = require('express');
const router = express.Router();
const infraUnidadesController = require('../controllers/infraUnidadesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1, 2, 3, 4]), infraUnidadesController.listar);
router.get('/:id', estaAutenticado, tieneRol([1, 2, 3, 4]), infraUnidadesController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), infraUnidadesController.crear);
router.put('/:id', estaAutenticado, tieneRol([1]), infraUnidadesController.actualizar);
router.delete('/:id', estaAutenticado, tieneRol([1]), infraUnidadesController.eliminar);

module.exports = router;
