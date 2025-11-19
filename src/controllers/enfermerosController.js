const db = require('../models');
const {  Enfermero } = db;
const { Op } = require('sequelize');

const enfermeroController = {
  buscarPorMatricula: async (req, res) => {
    try {
      const { matricula } = req.params;
      const enfermero = await Enfermero.findOne({ 
      where: { matricula }, 
        paranoid: false
      });

      if (!enfermero) {
        return res.status(404).json({ success: false, error: 'Enfermero no encontrado' });
      }

      
      const enfermeroData = enfermero.toJSON();
      enfermeroData.activo = !enfermero.deletedAt;
      
      return res.status(200).json({ success: true, enfermero: enfermeroData });

    } catch (error) {
      console.error('Error al buscar enfermero:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  },

  crearEnfermero: async (req, res) => {
    try {
      const { datosEnfermero } = req.body;

      if (!datosEnfermero) {
        return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos' });
      }

      const { apellidonombres, matricula, telefono, email } = datosEnfermero;

      if (!apellidonombres || apellidonombres.trim().length < 3) {
        return res.status(400).json({ success: false, error: 'Debe ingresar un nombre válido (mínimo 3 caracteres)' });
      }

      if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(apellidonombres.trim())) {
        return res.status(400).json({ success: false, error: 'El nombre solo debe contener letras y espacios' });
      }

      if (!matricula) {
        return res.status(400).json({ success: false, error: 'La matrícula es obligatoria' });
      }

      const existente = await Enfermero.findOne({ where: { matricula } });
      if (existente) {
        return res.status(400).json({ success: false, error: 'Ya existe un enfermero con esta matrícula' });
      }

      if (telefono && !/^\d{1,20}$/.test(telefono)) {
        return res.status(400).json({ success: false, error: 'El teléfono debe contener solo números (máx. 20 dígitos)' });
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'El correo electrónico no tiene un formato válido' });
      }

      const datosLimpios = {
        apellidonombres: apellidonombres.trim(),
        matricula: matricula.trim?.() ?? matricula,
        telefono: telefono?.trim?.() ?? telefono,
        email: email?.trim?.() ?? email
      };

      const nuevo = await Enfermero.create(datosLimpios);

      return res.status(201).json({
        success: true,
        enfermero: nuevo,
        mensaje: 'Enfermero registrado correctamente'
      });

    } catch (error) {
      console.error('Error al crear enfermero:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  },


  listarEnfermeros: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { apellidonombres: { [Op.like]: `%${search}%` } },
          { matricula: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await Enfermero.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['apellidonombres', 'ASC']],
        attributes: ['idenfermero', 'apellidonombres', 'matricula', 'telefono', 'email']
      });

      return res.status(200).json({
        success: true,
        enfermeros: rows,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      });

    } catch (error) {
      console.error('Error al listar enfermeros:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  },

  listar: async (req, res) => {
    try {
      let enfermeros;
      const { rol, matricula } = req.session.usuario;

      if (rol === 4 && matricula) {  
        enfermeros = await db.Enfermero.findAll({
          where: { matricula: matricula.trim() }
        });
      } else {
        enfermeros = await db.Enfermero.findAll();
      }

      res.json({ enfermeros });
      } catch (error) {
        console.error("🔥 Error al listar enfermeros:", error); 
        res.status(500).json({ error: 'Error al obtener enfermeros', detalle: error.message });
      }
  },

  listarEnfermerosActivos: async (req, res) => {
      try {
          const enfermeros = await Enfermero.findAll({
              where: {
                  deletedAt: null
              },
              attributes: ['idenfermero', 'apellidonombres', 'matricula'],
              order: [['apellidonombres', 'ASC']]
          });

          res.json({ success: true, enfermeros });
      } catch (error) {
          console.error('Error al obtener enfermeros activos:', error);
          res.status(500).json({
              success: false,
              error: 'Error al obtener enfermeros activos'
          });
      }
  },

  actualizarEnfermero: async (req, res) => {
    try {
      const { matricula } = req.params;
      const { datosEnfermero } = req.body;

      if (!datosEnfermero) {
        return res.status(400).json({ success: false, error: 'Faltan parámetros requeridos' });
      }

      const enfermero = await Enfermero.findOne({ where: { matricula } });
      if (!enfermero) {
        return res.status(404).json({ success: false, error: 'Enfermero no encontrado' });
      }

      const { apellidonombres, telefono, email } = datosEnfermero;

      if (apellidonombres && !/^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s]+$/.test(apellidonombres.trim())) {
        return res.status(400).json({ success: false, error: 'El nombre solo debe contener letras y espacios' });
      }

      if (telefono && !/^\d{1,20}$/.test(telefono)) {
        return res.status(400).json({ success: false, error: 'El teléfono debe contener solo números (máx. 20 dígitos)' });
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ success: false, error: 'El correo electrónico no tiene un formato válido' });
      }

      ['apellidonombres', 'telefono', 'email'].forEach(campo => {
        if (datosEnfermero[campo] !== undefined) {
          enfermero[campo] = datosEnfermero[campo].trim?.() ?? datosEnfermero[campo];
        }
      });

      await enfermero.save();

      return res.status(200).json({
        success: true,
        enfermero,
        mensaje: 'Enfermero actualizado correctamente'
      });

    } catch (error) {
      console.error('Error al actualizar enfermero:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  },


  eliminarEnfermero: async (req, res) => {
    try {
      const { matricula } = req.params;

      const enfermero = await Enfermero.findOne({ where: { matricula } });
      if (!enfermero) {
        return res.status(404).json({ success: false, error: 'Enfermero no encontrado' });
      }

      await enfermero.destroy();

      return res.status(200).json({
        success: true,
        mensaje: 'Enfermero eliminado correctamente'
      });

    } catch (error) {
      console.error('Error al eliminar enfermero:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor' });
    }
  },

  reactivarEnfermero: async (req, res) => {
    try {
      const { matricula } = req.params;
      const enfermero = await Enfermero.findOne({
        where: { matricula },
        paranoid: false 
      });

      if (!enfermero) {
        return res.status(404).json({ success: false, error: 'Enfermero no encontrado' });
      }

      if (!enfermero.deletedAt) {
        return res.status(400).json({ success: false, error: 'El enfermero no está eliminado' });
      }

      await enfermero.restore();

      return res.status(200).json({
        success: true,
        mensaje: 'Enfermero reactivado correctamente'
      });

    } catch (error) {
      console.error('Error al reactivar enfermero:', error);
      return res.status(500).json({ success: false, error: 'Error interno del servidor', detalles: error.message });
    }
  }

};

module.exports = enfermeroController;
