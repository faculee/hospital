const express = require('express');
const router = express.Router();
const diagnosticosController = require('../controllers/diagnosticosController');    
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,2,3,4]), diagnosticosController.listar);

module.exports = router;    
