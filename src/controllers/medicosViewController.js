const db = require('../models'); 
const { Medico, Especialidad } =  db;

const medicosViewsController = {
  mostrarListado: async (req, res) => {
    try {
      const medicos = await Medico.findAll({
        include: {
          model: Especialidad,
          as: 'especialidad',
          attributes: ['denominacion']
        },
        attributes: ['idmedico', 'apellidonombres', 'matricula', 'telefono', 'email', 'deletedAt'],
        paranoid: false,
        order: [['apellidonombres', 'ASC']]
      });

      const especialidades = await Especialidad.findAll({
        attributes: ['denominacion'],
        order: [['denominacion', 'ASC']]
      });

      res.render('medicoslistado', { medicos, especialidades });
    } catch (error) {
      console.error('Error al renderizar medicoslistado:', error);
      res.status(500).send('Error al cargar la vista de médicos');
    }
  }
};

module.exports = medicosViewsController;
