const db = require('../models');
const { TipoAntecedente } = db;

const tiposAntecedentesController = {

  listar: async (req, res) => {
    try {
      const tipos = await TipoAntecedente.findAll({
        attributes: ['idtipoantecedente', 'denominacionantecedente'],
        order: [['denominacionantecedente', 'ASC']]
      });

      res.json(tipos);

    } catch (error) {
      console.error('Error al obtener tipos de antecedentes:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener tipos de antecedentes: ' + error.message
      });
    }
  },
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const tipo = await TipoAntecedente.findByPk(id, {
        attributes: ['idtipoantecedente', 'denominacionantecedente']
      });

      if (!tipo) {
        return res.status(404).json({
          success: false,
          error: 'Tipo de antecedente no encontrado'
        });
      }

      res.json({
        success: true,
        tipo
      });

    } catch (error) {
      console.error('Error al buscar tipo de antecedente:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  crear: async (req, res) => {
    try {
      const { denominacionantecedente } = req.body;

      if (!denominacionantecedente || denominacionantecedente.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'La denominación es obligatoria'
        });
      }

      const existente = await TipoAntecedente.findOne({
        where: { denominacionantecedente }
      });

      if (existente) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe un tipo de antecedente con esa denominación'
        });
      }

      const nuevo = await TipoAntecedente.create({ denominacionantecedente });

      res.json({
        success: true,
        tipo: nuevo
      });

    } catch (error) {
      console.error('Error al crear tipo de antecedente:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

};

module.exports = tiposAntecedentesController;
