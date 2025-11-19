const db = require('../models');
const { Op } = require('sequelize');
const { Medicamento, ClasificacionTerapeutica } = db;


const medicamentosController = {

  listar: async (req, res) => {
    try {
      const medicamentos = await Medicamento.findAll({
        attributes: ['idmedicamento', 'nombremedicamento', 'presentacion', 'idclasificacionterapeutica'],
        include: {
          model: ClasificacionTerapeutica,
          as: 'clasificacionTerapeutica',
          attributes: ['idclasificacionterapeutica', 'denominacion']
        },
        order: [['nombremedicamento', 'ASC']]
      });
      res.json(medicamentos);
    } catch (error) {
      console.error('Error al obtener medicamentos:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  listarPaginado: async (req, res) => {
    try {
      let { start = 0, length = 10, search = '' } = req.query;
      start = parseInt(start);
      length = parseInt(length);

      const where = search
        ? {
            nombremedicamento: { [Op.like]: `%${search.toUpperCase()}%` }
          }
        : {};

      const { count, rows } = await Medicamento.findAndCountAll({
        where,
        include: {
          model: ClasificacionTerapeutica,
          as: 'clasificacionTerapeutica',
          attributes: ['denominacion']
        },
        offset: start,
        limit: length,
        order: [['nombremedicamento', 'ASC']]
      });

      res.json({
        recordsTotal: count,
        recordsFiltered: count,
        data: rows
      });
    } catch (error) {
      console.error('Error en listarPaginado:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const medicamento = await Medicamento.findByPk(id, {
        attributes: ['idmedicamento', 'nombremedicamento', 'presentacion', 'idclasificacionterapeutica'],
        include: {
          model: ClasificacionTerapeutica,
          as: 'clasificacionTerapeutica',
          attributes: ['idclasificacionterapeutica', 'denominacion']
        }
      });

      if (!medicamento) {
        return res.status(404).json({ success: false, error: 'Medicamento no encontrado' });
      }

      res.json({ success: true, medicamento });
    } catch (error) {
      console.error('Error al buscar medicamento:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  crear: async (req, res) => {
    try {
      let { nombremedicamento, presentacion, idclasificacionterapeutica } = req.body;

      nombremedicamento = nombremedicamento
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

      presentacion = presentacion
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

      if (!/^[A-Z0-9\s]+$/.test(nombremedicamento) || !/^[A-Z0-9\s]+$/.test(presentacion)) {
        return res.status(400).json({
          success: false,
          message: 'El nombre o la presentación contiene caracteres no permitidos.',
        });
      }

      const existe = await Medicamento.findOne({
        where: { nombremedicamento, presentacion }
      });

      if (existe) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un medicamento con ese nombre y presentación.',
        });
      }

      const nuevoMedicamento = await Medicamento.create({
        nombremedicamento,
        presentacion,
        idclasificacionterapeutica
      });

      res.status(201).json({ success: true, medicamento: nuevoMedicamento });

    } catch (error) {
      console.error('Error al crear medicamento:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un medicamento con ese nombre y presentación.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno al guardar el medicamento.'
      });
    }
  },


  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      let { nombremedicamento, presentacion, idclasificacionterapeutica } = req.body;

      const medicamento = await Medicamento.findByPk(id);
      if (!medicamento) {
        return res.status(404).json({
          success: false,
          message: 'Medicamento no encontrado'
        });
      }

      nombremedicamento = nombremedicamento
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

      presentacion = presentacion
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();

      if (!/^[A-Z0-9\s]+$/.test(nombremedicamento) || !/^[A-Z0-9\s]+$/.test(presentacion)) {
        return res.status(400).json({
          success: false,
          message: 'El nombre o la presentación contiene caracteres no permitidos.',
        });
      }

      const existe = await Medicamento.findOne({
        where: {
          nombremedicamento,
          presentacion,
          idmedicamento: { [Op.ne]: id }
        }
      });

      if (existe) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro medicamento con ese nombre y presentación.',
        });
      }

      medicamento.nombremedicamento = nombremedicamento;
      medicamento.presentacion = presentacion;
      medicamento.idclasificacionterapeutica = idclasificacionterapeutica;

      await medicamento.save();

      res.json({ success: true, medicamento });

    } catch (error) {
      console.error('Error al actualizar medicamento:', error);

      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un medicamento con ese nombre y presentación.'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno al actualizar el medicamento.'
      });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const medicamento = await Medicamento.findByPk(id);

      if (!medicamento) {
        return res.status(404).json({ success: false, error: 'Medicamento no encontrado' });
      }

      await medicamento.destroy();

      res.json({ success: true, message: 'Medicamento eliminado' });
    } catch (error) {
      console.error('Error al eliminar medicamento:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = medicamentosController;
