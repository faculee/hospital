const express = require('express');
const router = express.Router();
const coberturasController = require('../controllers/coberturasController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/', estaAutenticado, tieneRol([1,2,3,4]), coberturasController.listar);
router.get('/paginado', estaAutenticado, tieneRol([1]), coberturasController.listarPaginado); 
router.get('/:id', estaAutenticado, tieneRol([1]), coberturasController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), coberturasController.crear);
router.put('/:id', estaAutenticado, tieneRol([1]), coberturasController.actualizar);
router.delete('/:id', estaAutenticado, tieneRol([1]), coberturasController.eliminar);

module.exports = router;
