const express = require('express');
const router = express.Router();
const enfermerosController = require('../controllers/enfermerosController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/activos', tieneRol([1]), enfermerosController.listarEnfermerosActivos);
router.get('/:matricula', estaAutenticado, tieneRol([1,2,4]), enfermerosController.buscarPorMatricula);
router.get('/', estaAutenticado, tieneRol([1]), enfermerosController.listar);
router.post('/', estaAutenticado, tieneRol([1]), enfermerosController.crearEnfermero);
router.put('/:matricula/reactivar', estaAutenticado, tieneRol([1]), enfermerosController.reactivarEnfermero);
router.put('/:matricula', estaAutenticado, tieneRol([1]), enfermerosController.actualizarEnfermero);
router.delete('/:matricula', estaAutenticado, tieneRol([1]), enfermerosController.eliminarEnfermero);


module.exports = router;
