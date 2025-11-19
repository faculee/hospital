const express = require('express');
const router = express.Router();
const { estaAutenticado, tieneRol } = require('../middlewares/auth');
const medicosViewController = require('../controllers/medicosViewController');

router.get('/medicoslistado', estaAutenticado, tieneRol([1]), medicosViewController.mostrarListado);

module.exports = router;