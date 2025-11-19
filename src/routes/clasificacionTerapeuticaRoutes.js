const express = require('express');
const router = express.Router();
const clasificacionTerapeuticaController = require('../controllers/clasificacionTerapeuticaController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1]), clasificacionTerapeuticaController.listar);
router.get('/:id', estaAutenticado, tieneRol([1]), clasificacionTerapeuticaController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), clasificacionTerapeuticaController.crear);
router.put('/:id', estaAutenticado, tieneRol([1]), clasificacionTerapeuticaController.actualizar);
router.delete('/:id', estaAutenticado, tieneRol([1]), clasificacionTerapeuticaController.eliminar);

module.exports = router;
