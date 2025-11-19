const express = require('express');
const router = express.Router();
const enfermerosViewController = require('../controllers/enfermerosViewController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/enfermeroslistado', estaAutenticado, tieneRol([1]), enfermerosViewController.mostrarListado);

module.exports = router;
