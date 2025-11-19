const express = require('express');
const router = express.Router();
const atencionMedicaController = require('../controllers/atencionMedicaController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.post('/evaluacionesm', estaAutenticado, tieneRol([1,3]), atencionMedicaController.registrarEvaluacionMedica);
router.get('/evaluacionesm/:idinternacion', estaAutenticado, tieneRol([1,3,4]), atencionMedicaController.listarEvaluacionesMedicasPorInternacion);
router.post('/medicamentos', estaAutenticado, tieneRol([1,3]), atencionMedicaController.registrarMedicamento);
router.get('/medicamentos/:idinternacion', estaAutenticado, tieneRol([1,3, 4]), atencionMedicaController.listarMedicamentosPorInternacion);
router.post('/estudios', estaAutenticado, tieneRol([1,3]), atencionMedicaController.registrarEstudio);
router.get('/estudios/:idinternacion', estaAutenticado, tieneRol([1,3,4]), atencionMedicaController.listarEstudiosPorInternacion);
router.post('/cirugias', estaAutenticado, tieneRol([1,3]), atencionMedicaController.registrarCirugia);
router.get('/cirugias/:idinternacion', estaAutenticado, tieneRol([1,3,4]), atencionMedicaController.listarCirugiasPorInternacion);
router.post('/terapias', estaAutenticado, tieneRol([1,3]), atencionMedicaController.registrarTerapia);
router.get('/terapias/:idinternacion', estaAutenticado, tieneRol([1,3,4]), atencionMedicaController.listarTerapiasPorInternacion);

module.exports = router;
