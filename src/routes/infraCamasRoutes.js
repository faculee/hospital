const express = require('express');
const router = express.Router();

const infraCamasController = require('../controllers/infraCamasController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1, 2, 3, 4]), infraCamasController.listar);
router.get('/habitacion/:idhabitacion', estaAutenticado, tieneRol([1, 2, 3, 4]), infraCamasController.listarPorHabitacion);
router.get('/:id', estaAutenticado, tieneRol([1, 2, 3, 4]), infraCamasController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), infraCamasController.crear);
router.put('/:id', estaAutenticado, tieneRol([1]), infraCamasController.actualizar);
router.delete('/:id', estaAutenticado, tieneRol([1]), infraCamasController.eliminar);

module.exports = router;
