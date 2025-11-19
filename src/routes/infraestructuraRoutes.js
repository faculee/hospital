const express = require('express');
const router = express.Router();
const infraestructuraController = require('../controllers/infraestructuraController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');


router.get('/habitaciones-compatibles', estaAutenticado, tieneRol([1,2]), infraestructuraController.obtenerHabitacionesCompatibles);
router.get('/camas-paciente', estaAutenticado, tieneRol([1,2,3,4]), infraestructuraController.listarCamasPorPacienteInternacion);
router.get('/camas-ocupadas', estaAutenticado, tieneRol([1,2,3,4]), infraestructuraController.listarCamasOcupadasView);
router.get('/camas-ocupacion-porcentaje', estaAutenticado, tieneRol([1,2,3,4]), infraestructuraController.listarPorcentajeOcupacionView);

module.exports = router;
