const express = require('express');
const router = express.Router();
const internacionesController = require('../controllers/internacionesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/paciente/:idpaciente/activas', estaAutenticado, tieneRol([1,2,3,4]), internacionesController.existeInternacionActiva);
router.get('/pacientecama/:idpaciente', estaAutenticado, tieneRol([1,2,3,4]), internacionesController.verificarEstadoCamaPaciente);
router.get('/paciente/:idpaciente', estaAutenticado, tieneRol([1,2,3,4]), internacionesController.obtenerPorPaciente);
router.get('/:id', estaAutenticado, tieneRol([1,2,3,4]), internacionesController.buscarPorId);
router.post('/:id/camas', estaAutenticado, tieneRol([1,2]), internacionesController.asignarCama);
router.post('/', estaAutenticado, tieneRol([1,2]), internacionesController.crear);
router.post('/cambiar-paciente',  estaAutenticado, tieneRol([1]), internacionesController.cambiarPaciente);
router.put('/:id', estaAutenticado, tieneRol([1,2,3]), internacionesController.actualizar);
router.put('/:id/alta', estaAutenticado, tieneRol([1,3]), internacionesController.registrarAlta);
router.delete('/:id/cancelarInternacion', estaAutenticado, tieneRol([1,2]), internacionesController.cancelarInternacionControlada);
router.delete('/:id/ultima-cama', estaAutenticado, tieneRol([1,2]), internacionesController.anularUltimaAsignacionCama);

module.exports = router;
 