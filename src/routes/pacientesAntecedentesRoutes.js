const express = require('express');
const router = express.Router();
const pacientesAntecedentesController = require('../controllers/pacientesAntecedentesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');


router.get('/:idpaciente', estaAutenticado, tieneRol([1,3,4]), pacientesAntecedentesController.listarPorPaciente);
router.post('/', estaAutenticado, tieneRol([1,3]), pacientesAntecedentesController.crear);
router.delete('/:id', estaAutenticado, tieneRol([1,3]), pacientesAntecedentesController.eliminar);

module.exports = router;
