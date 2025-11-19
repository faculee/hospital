const express = require('express');
const router = express.Router();
const tiposAntecedentesController = require('../controllers/tiposAntecedentesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');


router.get('/', estaAutenticado, tieneRol([1,2,3,4]), tiposAntecedentesController.listar);
router.get('/:id', estaAutenticado, tieneRol([1,3,4]), tiposAntecedentesController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), tiposAntecedentesController.crear);


module.exports = router;


