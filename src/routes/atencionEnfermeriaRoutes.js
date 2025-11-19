const express = require('express');
const router = express.Router();
const atencionEnfermeriaController = require('../controllers/atencionEnfermeriaController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.post('/evaluaciones', estaAutenticado, tieneRol([1,4]), atencionEnfermeriaController.registrarEvaluacionEnfermeria);
router.post('/notas', estaAutenticado, tieneRol([1,4]), atencionEnfermeriaController.registrarNotaEnfermeria);
router.get('/evaluaciones/:idinternacion', estaAutenticado, tieneRol([1,3,4]), atencionEnfermeriaController.listarEvaluaciones);
router.get('/notas/:idinternacion', estaAutenticado, tieneRol([1,3,4]), atencionEnfermeriaController.listarNotasEnfermeria);

module.exports = router;
