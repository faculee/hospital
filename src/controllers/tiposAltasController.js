const db = require('../models');
const { TipoAlta } = db;

const tiposAltasController = {
  listar: async (req, res) => {
    try {
      const altas = await TipoAlta.findAll({
        attributes: ['idtipoalta', 'denominaciontipo'],
        order: [['denominaciontipo', 'ASC']]
      });

      res.json(altas);
      
    } catch (error) {
      console.error('Error al obtener tipos de altas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener tipos de altas: ' + error.message
      });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const alta = await TipoAlta.findByPk(id, {
        attributes: ['idtipoalta', 'denominaciontipo']
      });

      if (!alta) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de alta no encontrado'
        });
      }

      res.json({
        success: true,
        data: alta
      });
    } catch (error) {
      console.error('Error al buscar tipo de alta:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = tiposAltasController;