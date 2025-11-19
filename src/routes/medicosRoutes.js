const express = require('express');
const router = express.Router();
const medicosController = require('../controllers/medicosController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/activos', tieneRol([1]), medicosController.listarMedicosActivos);
router.get('/:matricula', estaAutenticado, tieneRol([1,2,3]), medicosController.buscarPorMatricula);
router.get('/:id', estaAutenticado, tieneRol([1,2,3]), medicosController.buscarPorId);
router.get('/', estaAutenticado, tieneRol([1,2]), medicosController.listar);
router.post('/', estaAutenticado, tieneRol([1]), medicosController.crearMedico);
router.put('/:matricula', estaAutenticado, tieneRol([1]), medicosController.actualizarMedico);
router.put('/:matricula/reactivar', estaAutenticado, tieneRol([1]), medicosController.reactivarMedico); 
router.delete('/:matricula', estaAutenticado, tieneRol([1]), medicosController.eliminarMedico);


module.exports = router;