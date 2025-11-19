const express = require('express');
const router = express.Router();
const medicamentosController = require('../controllers/medicamentosController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,2,3,4]), medicamentosController.listar);              
router.get('/paginado', estaAutenticado, tieneRol([1,2,3,4]), medicamentosController.listarPaginado);
router.get('/:id', estaAutenticado, tieneRol([1,2,3,4]), medicamentosController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), medicamentosController.crear);           
router.put('/:id', estaAutenticado, tieneRol([1]), medicamentosController.actualizar);    
router.delete('/:id', estaAutenticado, tieneRol([1]), medicamentosController.eliminar);   

module.exports = router;