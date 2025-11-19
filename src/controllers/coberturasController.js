const db = require('../models'); 
const { Cobertura } = db;
const { Op } = require('sequelize');

const coberturasController = {
  listar: async (req, res) => {
    try {
      const coberturas = await Cobertura.findAll({
        attributes: ['idcobertura', 'denominacion'],
        order: [['denominacion', 'ASC']]
      });
      
      res.json(coberturas);
    } catch (error) {
      console.error('Error al obtener coberturas:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener coberturas: ' + error.message 
      });
    }
  },
  listarPaginado: async (req, res) => {
    try {
      const { start = 0, length = 5, search = '' } = req.query;

      const where = search
        ? {
            denominacion: {
              [Op.like]: `%${search}%`
            }
          }
        : {};

      const { count, rows } = await Cobertura.findAndCountAll({
        where,
        offset: parseInt(start),
        limit: parseInt(length),
        order: [['denominacion', 'ASC']],
        attributes: ['idcobertura', 'denominacion']
      });

      res.json({
        success: true,
        data: rows,
        recordsTotal: count
      });
    } catch (error) {
      console.error('Error al listar coberturas paginadas:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const cobertura = await Cobertura.findByPk(id, {
        attributes: ['idcobertura', 'denominacion']
      });
      
      if (!cobertura) {
        return res.status(404).json({ 
          success: false,
          error: 'Cobertura no encontrada' 
        });
      }
      
      res.json({
        success: true,
        cobertura
      });
    } catch (error) {
      console.error('Error al buscar cobertura:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },
  crear: async (req, res) => {
    try {
      const { denominacion } = req.body;

      if (!denominacion || !denominacion.trim()) {
        return res.status(400).json({ success: false, error: 'La denominación es obligatoria.' });
      }

      const denominacionFormateada = denominacion.trim().toUpperCase();

      if (!/^[A-ZÁÉÍÓÚÜÑ0-9\s.,()-]+$/.test(denominacionFormateada)) {
        return res.status(400).json({ success: false, error: 'La denominación contiene caracteres no permitidos.' });
      }

      if (denominacionFormateada.length > 100) {
        return res.status(400).json({ success: false, error: 'La denominación no debe superar los 100 caracteres.' });
      }

      const duplicado = await Cobertura.findOne({
        where: { denominacion: denominacionFormateada }
      });

      if (duplicado) {
        return res.status(400).json({
          success: false,
          error: `Ya existe una cobertura con la denominación "${denominacionFormateada}".`
        });
      }

      const nuevaCobertura = await Cobertura.create({ denominacion: denominacionFormateada });

      res.status(201).json({ success: true, cobertura: nuevaCobertura });

    } catch (error) {
      console.error('Error al crear cobertura:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  actualizar: async (req, res) => {
    try {
      const { id } = req.params;
      const { denominacion } = req.body;

      if (!denominacion || !denominacion.trim()) {
        return res.status(400).json({ success: false, error: 'La denominación es obligatoria.' });
      }

      const denominacionFormateada = denominacion.trim().toUpperCase();

      if (!/^[A-ZÁÉÍÓÚÜÑ0-9\s.,()-]+$/.test(denominacionFormateada)) {
        return res.status(400).json({ success: false, error: 'La denominación contiene caracteres no permitidos.' });
      }

      if (denominacionFormateada.length > 100) {
        return res.status(400).json({ success: false, error: 'La denominación no debe superar los 100 caracteres.' });
      }

      const cobertura = await Cobertura.findByPk(id);
      if (!cobertura) {
        return res.status(404).json({ success: false, error: 'Cobertura no encontrada' });
      }

      const duplicado = await Cobertura.findOne({
        where: {
          denominacion: denominacionFormateada,
          idcobertura: { [Op.ne]: id }
        }
      });

      if (duplicado) {
        return res.status(400).json({
          success: false,
          error: `Ya existe otra cobertura con la denominación "${denominacionFormateada}".`
        });
      }

      cobertura.denominacion = denominacionFormateada;
      await cobertura.save();

      res.json({ success: true, cobertura });

    } catch (error) {
      console.error('Error al actualizar cobertura:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const cobertura = await Cobertura.findByPk(id, {
        include: [{ association: 'pacientes' }]
      });

      if (!cobertura) {
        return res.status(404).json({
          success: false,
          error: 'Cobertura no encontrada'
        });
      }

      if (cobertura.pacientes && cobertura.pacientes.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'No se puede eliminar la cobertura porque tiene pacientes asociados.'
        });
      }

      await cobertura.destroy();

      res.json({
        success: true,
        message: 'Cobertura eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar cobertura:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno al intentar eliminar la cobertura.'
      });
    }
  }

};

module.exports = coberturasController;