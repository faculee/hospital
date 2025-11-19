const { obtenerPacientes } = require('./pacientesController');

const pacientesViewsController = {
  mostrarListado: async (req, res) => {
    try {
      const pacientes = await obtenerPacientes();
      res.render('pacienteslistado', { pacientes });
    } catch (error) {
      console.error('Error al renderizar pacienteslistado:', error);
      res.status(500).send('Error al cargar la vista de pacientes');
    }
  }
};

module.exports = pacientesViewsController;