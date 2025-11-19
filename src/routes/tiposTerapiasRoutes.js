const express = require('express');
const router = express.Router();
const tiposTerapiasController = require('../controllers/tiposTerapiasController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,3]), tiposTerapiasController.listar);

module.exports = router;