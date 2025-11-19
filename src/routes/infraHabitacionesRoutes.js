const express = require('express');
const router = express.Router();

const infraHabitacionesController = require('../controllers/infraHabitacionesController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/',estaAutenticado, tieneRol([1, 2, 3, 4]), infraHabitacionesController.listar);
router.get('/buscar',estaAutenticado,tieneRol([1]), infraHabitacionesController.buscarPorUnidadAla);
router.get('/:id',estaAutenticado,tieneRol([1, 2, 3, 4]),infraHabitacionesController.buscarPorId);
router.post('/',estaAutenticado,tieneRol([1]),infraHabitacionesController.crear);
router.put('/:id',estaAutenticado,tieneRol([1]),infraHabitacionesController.actualizar);
router.delete('/:id',estaAutenticado,tieneRol([1]), infraHabitacionesController.eliminar);

module.exports = router;
