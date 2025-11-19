const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { estaAutenticado, tieneRol } = require('../middlewares/auth');

router.get('/verificar-alias', estaAutenticado, tieneRol([1]), usuariosController.verificarAlias);
router.get('/por-rol/:idrol', estaAutenticado, tieneRol([1]), usuariosController.listarPorRol);
router.get('/', estaAutenticado, tieneRol([1]), usuariosController.listar);
router.get('/:id', estaAutenticado, tieneRol([1]), usuariosController.buscarPorId);
router.post('/', estaAutenticado, tieneRol([1]), usuariosController.crear);
router.post('/cambiarpassword', estaAutenticado, tieneRol([1,2,3,4]),usuariosController.cambiarPassword);
router.put('/:id', estaAutenticado, tieneRol([1]), usuariosController.actualizar);
router.delete('/:id', estaAutenticado, tieneRol([1]), usuariosController.eliminar);


module.exports = router;
