const db = require('../models');
const { PacienteAntecedente, TipoAntecedente, Medico } = db;

const pacientesAntecedentesController = {

  listarPorPaciente: async (req, res) => {
    try {
      const { idpaciente } = req.params;

      const antecedentes = await PacienteAntecedente.findAll({
        where: { idpaciente },
        include: [
          { model: TipoAntecedente, as: 'tipoantecedente', attributes: ['idtipoantecedente', 'denominacionantecedente'] },
          { model: Medico, as: 'medico', attributes: ['idmedico', 'apellidonombres'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        antecedentes
      });

    } catch (error) {
      console.error('Error al obtener antecedentes:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  crear: async (req, res) => {
    try {
      const { idpaciente, idtipoantecedente, notasdeltipo } = req.body;

      const idmedico= req.session.usuario?.profesional;

      if (req.session.usuario?.rol !== 3) {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      }

      if (!idpaciente || !idtipoantecedente) {
        return res.status(400).json({ success: false, error: 'Faltan campos obligatorios' });
      }

      const nuevo = await PacienteAntecedente.create({
        idpaciente,
        idmedico,
        idtipoantecedente,
        notasdeltipo
      });

      res.json({
        success: true,
        antecedente: nuevo
      });

    } catch (error) {
      console.error('Error al crear antecedente:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const eliminado = await PacienteAntecedente.destroy({
        where: { idpacienteantecedente: id }
      });

      if (!eliminado) {
        return res.status(404).json({ success: false, error: 'Antecedente no encontrado' });
      }

      res.json({
        success: true,
        mensaje: 'Antecedente eliminado correctamente'
      });

    } catch (error) {
      console.error('Error al eliminar antecedente:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

};

module.exports = pacientesAntecedentesController;
