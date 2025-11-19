const { Op } = require('sequelize');
const db = require('../models'); 
const { Usuario, Rol, Medico, Enfermero } = db;
const bcrypt = require('bcrypt');

const usuariosController = {
  listar: async (req, res) => {
    try {
      const usuarios = await Usuario.findAll({
        include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }],
        attributes: ['idusuario', 'nombre', 'usuario', 'idrol',  'matricula', 'activo'],
        order: [['nombre', 'ASC']]
      });

      res.json(usuarios);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener usuarios: ' + error.message 
      });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id, {
        include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }],
        attributes: ['idusuario', 'nombre', 'usuario', 'idrol',  'matricula', 'activo']
      });

      if (!usuario) {
        return res.status(404).json({ 
          success: false,
          error: 'Usuario no encontrado' 
        });
      }

      res.json({ success: true, usuario });
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  crear: async (req, res) => {
    try {
      const { nombre, usuario, password, idrol, matricula, activo } = req.body;


      if (!nombre || !usuario || !password || !idrol) {
        return res.status(400).json({
          success: false,
          error: 'Faltan campos requeridos'
        });
      }

      const idRolNum = Number(idrol);
      const matriculaLimpia = matricula?.trim() || '';

      const usuarioExistente = await Usuario.findOne({
        where: { usuario: usuario.trim() }
      });

      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          error: 'El alias ingresado ya existe. Elegí otro.'
        });
      }

      if (idRolNum === 3 || idRolNum === 4) {
        if (!matriculaLimpia) {
          return res.status(400).json({
            success: false,
            error: 'Debe ingresar matrícula para este rol'
          });
        }

        const modelo = idRolNum === 3 ? Medico : Enfermero;
        const profesional = await modelo.findOne({ where: { matricula: matriculaLimpia } });
        
        console.log(matriculaLimpia);
        console.log(profesional);

        if (!profesional) {
          return res.status(400).json({
            success: false,
            error: `La matrícula no existe en ${idRolNum === 3 ? 'Médicos' : 'Enfermeros'}. Debe registrar primero al profesional.`
          });
        }

        if (profesional.apellidonombres.toUpperCase().trim() !== nombre.toUpperCase().trim()) {
          return res.status(400).json({
            success: false,
            error: 'El nombre ingresado no coincide con el del profesional registrado.'
          });
        }

        const repetido = await Usuario.findOne({
          where: {
            idrol: idRolNum,
            matricula: matriculaLimpia
          }
        });

        if (repetido) {
          return res.status(400).json({
            success: false,
            error: 'Ya existe un usuario registrado con esa matrícula y rol.'
          });
        }
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const nuevoUsuario = await Usuario.create({
        nombre,
        usuario,
        password: hashedPassword,
        idrol: idRolNum,
        matricula: matriculaLimpia,
        activo
      });

      res.status(201).json({ success: true, usuario: nuevoUsuario });

    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, usuario, password, idrol, matricula, activo } = req.body;

      const user = await Usuario.findByPk(id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      const idRolNum = Number(idrol);
      const matriculaLimpia = matricula?.trim() || '';

      const usuarioExistente = await Usuario.findOne({
        where: {
          usuario: usuario.trim(),
          idusuario: { [Op.ne]: parseInt(id) }
        }
      });

      if (usuarioExistente) {
        return res.status(400).json({
          success: false,
          error: 'El alias ingresado ya existe. Elegí otro.'
        });
      }

      if (idRolNum === 3 || idRolNum === 4) {
        if (!matriculaLimpia) {
          return res.status(400).json({
            success: false,
            error: 'Debe ingresar matrícula para este rol'
          });
        }

        const modelo = idRolNum === 3 ? Medico : Enfermero;
        const profesional = await modelo.findOne({ where: { matricula: matriculaLimpia } });

        if (!profesional) {
          return res.status(400).json({
            success: false,
            error: `La matrícula no existe en ${idRolNum === 3 ? 'Médicos' : 'Enfermeros'}`
          });
        }

        if (profesional.apellidonombres.toUpperCase().trim() !== nombre.toUpperCase().trim()) {
          return res.status(400).json({
            success: false,
            error: 'El nombre ingresado no coincide con el del profesional registrado.'
          });
        }

        const repetido = await Usuario.findOne({
          where: {
            idrol: idRolNum,
            matricula: matriculaLimpia,
            idusuario: { [Op.ne]: parseInt(id) }
          }
        });

        if (repetido) {
          return res.status(400).json({
            success: false,
            error: 'Ya existe otro usuario registrado con esa matrícula y rol.'
          });
        }
      }

      user.nombre = nombre;
      user.usuario = usuario;
      user.idrol = idRolNum;
      user.matricula = matriculaLimpia;
      user.activo = activo;


      if (password && password.trim() !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }

      await user.save();

      res.json({ success: true, usuario: user });

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);

      if (!usuario) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      }

      await usuario.destroy();

      res.json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  verificarAlias: async (req, res) => {
    const { alias, idusuario } = req.query;

    if (!alias || alias.trim() === "") {
      return res.status(400).json({ existe: false, error: "Alias requerido" });
    }

    try {
      const condiciones = {
        usuario: alias.trim()
      };

      if (idusuario) {
        condiciones.idusuario = { [Op.ne]: parseInt(idusuario) };
      }

      const usuarioExistente = await Usuario.findOne({
        where: condiciones
      });

      if (usuarioExistente) {
        return res.json({ existe: true, alias: usuarioExistente.usuario });
      } else {
        return res.json({ existe: false });
      }
    } catch (error) {
      console.error("Error al verificar alias:", error);
      return res.status(500).json({ existe: false, error: "Error interno del servidor" });
    }
  },

  listarPorRol: async (req, res) => {
    try {
      const idrol = req.params.idrol;
      const usuarios = await Usuario.findAll({
        where: { idrol },
        include: [{ model: Rol, as: 'rol', attributes: ['nombre'] }]
      });
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ success: false, message: "Error interno" });
    }
  },

  cambiarPassword: async (req, res) => {
    const { actual, nueva, repetir } = req.body;
    const idusuario = req.session.usuario.id;

    if (!actual || !nueva || !repetir) {
      return res.json({ exito: false, mensaje: 'Todos los campos son obligatorios' });
    }

    if (nueva !== repetir) {
      return res.json({ exito: false, mensaje: 'Las contraseñas no coinciden' });
    }

    try {
      const usuario = await Usuario.findByPk(idusuario);
      if (!usuario) {
        return res.json({ exito: false, mensaje: 'Usuario no encontrado' });
      }

      const coincide = await bcrypt.compare(actual, usuario.password);
      if (!coincide) {
        return res.json({ exito: false, mensaje: 'La contraseña actual es incorrecta' });
      }

      const nuevaHash = await bcrypt.hash(nueva, 10);
      usuario.password = nuevaHash;
      await usuario.save();

      return res.json({ exito: true, mensaje: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error(error);
      return res.json({ exito: false, mensaje: 'Ocurrió un error al cambiar la contraseña' });
    }
  },
  mostrarFormularioLogin: (req, res) => {
    res.render('index', { error: null });
  },

  procesarLogin: async (req, res) => {
    const { usuario, password } = req.body;

    try {
      const usuarioEncontrado = await Usuario.findOne({ where: { usuario } });

      if (!usuarioEncontrado) {
        return res.render('index', { error: 'Usuario o contraseña incorrectos' });
      }

      const passwordValido = await bcrypt.compare(password, usuarioEncontrado.password);
      if (!passwordValido) {
        return res.render('index', { error: 'Usuario o contraseña incorrectos' });
      }

      let profesional = null;

      if (usuarioEncontrado.idrol === 3) {
        const medico = await db.Medico.findOne({ where: { matricula: usuarioEncontrado.matricula } });
        if (!medico) {
          return res.render('index', { error: 'No se encontró un médico registrado con esa matrícula.' });
        }
        profesional = medico.idmedico;
      }

      if (usuarioEncontrado.idrol === 4) {
        const enfermero = await db.Enfermero.findOne({ where: { matricula: usuarioEncontrado.matricula } });
        if (!enfermero) {
          return res.render('index', { error: 'No se encontró un enfermero registrado con esa matrícula.' });
        }
        profesional = enfermero.idenfermero;
      }

      req.session.usuario = {
        id: usuarioEncontrado.idusuario,
        nombre: usuarioEncontrado.nombre,
        alias: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.idrol,
        matricula: usuarioEncontrado.matricula,
        profesional
      };

      res.redirect('/layout');
    } catch (error) {
      console.error('Error en login:', error);
      res.render('index', { error: 'Error del servidor' });
    }
  },

  logout: (req, res) => {
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
};

module.exports = usuariosController;
