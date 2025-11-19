const { Op } = require('sequelize');
const db = require('../models');
const { Ala } = db;

const infraAlasController = {
  listar: async (req, res) => {
    try {
      const alas = await Ala.findAll({
        attributes: ['idala', 'denominacion'],
        order: [['denominacion', 'ASC']]
      });

      res.json({
        success: true,
        alas
      });
    } catch (error) {
      console.error('Error al obtener alas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener alas: ' + error.message
      });
    }
  },

  crear: async (req, res) => {
    try {
      const { denominacion } = req.body;

      if (!denominacion || !denominacion.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Debe ingresar una denominación'
        });
      }

      const denominacionFormateada = denominacion.trim().toUpperCase();

      const existente = await Ala.findOne({ where: { denominacion: denominacionFormateada } });
      if (existente) {
        return res.status(400).json({
          success: false,
          error: `Ya existe un ala con la denominación "${denominacionFormateada}".`
        });
      }

      const nuevaAla = await Ala.create({ denominacion: denominacionFormateada });

      res.status(201).json({
        success: true,
        mensaje: 'Ala creada correctamente',
        ala: {
          idala: nuevaAla.idala,
          denominacion: nuevaAla.denominacion
        }
      });

    } catch (error) {
      console.error('Error al crear ala:', error);
      res.status(500).json({
        success: false,
        error: 'Error al crear ala: ' + error.message
      });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { denominacion } = req.body;

      if (!denominacion || !denominacion.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Debe ingresar una denominación'
        });
      }

      const ala = await Ala.findByPk(id);
      if (!ala) {
        return res.status(404).json({
          success: false,
          error: 'Ala no encontrada'
        });
      }

      const denominacionFormateada = denominacion.trim().toUpperCase();

      const duplicado = await Ala.findOne({
        where: {
          denominacion: denominacionFormateada,
          idala: { [Op.ne]: id }
        }
      });

      if (duplicado) {
        return res.status(400).json({
          success: false,
          error: `Ya existe otra ala con la denominación "${denominacionFormateada}".`
        });
      }

      ala.denominacion = denominacionFormateada;
      await ala.save();

      res.json({
        success: true,
        mensaje: 'Ala actualizada correctamente',
        ala: {
          idala: ala.idala,
          denominacion: ala.denominacion
        }
      });

    } catch (error) {
      console.error('Error al actualizar ala:', error);
      res.status(500).json({
        success: false,
        error: 'Error al actualizar ala: ' + error.message
      });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const ala = await Ala.findByPk(id, {
        attributes: ['idala', 'denominacion']
      });

      if (!ala) {
        return res.status(404).json({
          success: false,
          error: 'Ala no encontrada'
        });
      }

      res.json({
        success: true,
        ala
      });
    } catch (error) {
      console.error('Error al buscar ala:', error);
      res.status(500).json({
        success: false,
        error: 'Error al buscar ala: ' + error.message
      });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const ala = await Ala.findByPk(id);
      if (!ala) {
        return res.status(404).json({
          success: false,
          error: 'Ala no encontrada'
        });
      }

      await ala.destroy();

      res.json({
        success: true,
        mensaje: 'Ala eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar ala:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar ala: ' + error.message
      });
    }
  }
};

module.exports = infraAlasController;
