const express = require('express');
const router = express.Router();
const tiposCirugiasController = require('../controllers/tiposCirugiasController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,3]), tiposCirugiasController.listar);

module.exports = router;
