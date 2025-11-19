const express = require('express');
const router = express.Router();
const unidadController = require('../controllers/infraUnidadesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,2,3,4]), unidadController.listar);

module.exports = router;