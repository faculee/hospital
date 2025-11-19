const { Enfermero } = require('../models');

const enfermerosViewController = {
  mostrarListado: async (req, res) => {
    try {
      const enfermeros = await Enfermero.findAll({
        attributes: ['idenfermero', 'apellidonombres', 'matricula', 'telefono', 'email', 'deletedAt'],
        paranoid: false,
        order: [['apellidonombres', 'ASC']]
      });

      res.render('enfermeroslistado', { enfermeros });
    } catch (error) {
      console.error('Error al renderizar enfermeroslistado:', error);
      res.status(500).send('Error al cargar la vista de enfermeros');
    }
  }
};

module.exports = enfermerosViewController;
