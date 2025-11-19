const express = require('express');
const router = express.Router();
const { estaAutenticado, tieneRol } = require('../middlewares/auth');
const pacientesViewController = require('../controllers/pacientesViewController');

router.get('/pacienteslistado', estaAutenticado, tieneRol([1, 2, 3, 4]), pacientesViewController.mostrarListado);

module.exports = router;
