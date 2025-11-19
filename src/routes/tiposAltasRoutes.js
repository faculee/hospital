const express = require('express');
const router = express.Router();
const tiposAltasController = require('../controllers/tiposAltasController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,3]), tiposAltasController.listar);

module.exports = router;