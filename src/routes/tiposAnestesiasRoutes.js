const express = require('express');
const router = express.Router();
const tiposAnestesiasController = require('../controllers/tiposAnestesiasController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,3]), tiposAnestesiasController.listar);

module.exports = router;