const express = require('express');
const router = express.Router();
const pacientesController = require('../controllers/pacientesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');


router.get('/pacienteslistado', estaAutenticado, tieneRol([1,2,3,4]), async (req, res) => {
  const pacientes = await obtenerPacientes();
  res.render('pacienteslistado', { pacientes });
});

router.get('/', estaAutenticado, tieneRol([1,2,3,4]), pacientesController.listarPacientes);
router.get('/:documento', estaAutenticado, tieneRol([1,2,3,4]), pacientesController.buscarPorDocumento);
router.post('/', estaAutenticado, tieneRol([1,2,3,4]), pacientesController.crearPaciente);
router.put('/:documento', estaAutenticado, tieneRol([1,2,3,4]), pacientesController.actualizarPaciente);
router.delete('/:documento', estaAutenticado, tieneRol([1]), pacientesController.eliminarPaciente);


module.exports = router;
