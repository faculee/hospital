const express = require('express');
const router = express.Router();
const estudiosController = require('../controllers/estudiosController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,2,3,4]), estudiosController.listar);
router.get('/:id', estaAutenticado, tieneRol([1,2,3,4]), estudiosController.buscarPorId);

module.exports = router;
