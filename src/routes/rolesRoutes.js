const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/rolesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');


router.get('/', estaAutenticado, tieneRol([1]), rolesController.listar);
router.get('/:id', estaAutenticado, tieneRol([1]), rolesController.buscarPorId);

module.exports = router;
