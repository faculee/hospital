const express = require('express');
const router = express.Router();
const infraAlasController = require('../controllers/infraAlasController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1, 2, 3, 4]), infraAlasController.listar);
router.get('/:id', estaAutenticado, tieneRol([1,2,3,4]), infraAlasController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), infraAlasController.crear);
router.put('/:id', estaAutenticado, tieneRol([1]), infraAlasController.actualizar);
router.delete('/:id', estaAutenticado, tieneRol([1]), infraAlasController.eliminar);

module.exports = router;
