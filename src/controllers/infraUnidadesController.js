const db = require('../models');
const { Unidad } = db;

const infraUnidadesController = {
  listar: async (req, res) => {
    try {
      const unidades = await Unidad.findAll({
        attributes: ['idunidad', 'denominacion'],
        order: [['denominacion', 'ASC']]
      });

      res.json({
        success: true,
        unidades
      });
    } catch (error) {
      console.error('Error al obtener unidades:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener unidades: ' + error.message
      });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;

      const unidad = await Unidad.findByPk(id, {
        attributes: ['idunidad', 'denominacion']
      });

      if (!unidad) {
        return res.status(404).json({
          success: false,
          error: 'Unidad no encontrada'
        });
      }

      res.json({
        success: true,
        unidad
      });
    } catch (error) {
      console.error('Error al buscar unidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error al buscar unidad: ' + error.message
      });
    }
  },

  crear: async (req, res) => {
      try {
          const { denominacion } = req.body;
          
          if (!denominacion) {
              return res.status(400).json({
                  success: false,
                  error: 'La denominación es obligatoria'
              });
          }

          const unidadExistente = await Unidad.findOne({ where: { denominacion } });
          if (unidadExistente) {
              return res.status(409).json({
                  success: false,
                  error: `Ya existe una unidad con la denominación '${denominacion}'`
              });
          }

          const nuevaUnidad = await Unidad.create({ denominacion });

          res.json({
              success: true,
              message: 'Unidad creada correctamente',
              unidad: nuevaUnidad
          });
      } catch (error) {
          console.error('Error al crear unidad:', error);
          
          if (error.name === 'SequelizeUniqueConstraintError') {
              return res.status(409).json({
                  success: false,
                  error: `Ya existe una unidad con la misma denominación`
              });
          }

          res.status(500).json({
              success: false,
              error: 'Error al crear unidad: ' + error.message
          });
      }
  },

  actualizar: async (req, res) => {
      try {
          const { id } = req.params;
          const { denominacion } = req.body;

          const unidad = await Unidad.findByPk(id);
          if (!unidad) {
              return res.status(404).json({
                  success: false,
                  error: 'Unidad no encontrada'
              });
          }

          if (!denominacion) {
              return res.status(400).json({
                  success: false,
                  error: 'La denominación es obligatoria'
              });
          }

          if (denominacion !== unidad.denominacion) {
              const unidadExistente = await Unidad.findOne({ where: { denominacion } });
              if (unidadExistente) {
                  return res.status(409).json({
                      success: false,
                      error: `Ya existe otra unidad con la denominación '${denominacion}'`
                  });
              }
          }

          unidad.denominacion = denominacion;
          await unidad.save();

          res.json({
              success: true,
              message: 'Unidad actualizada correctamente',
              unidad
          });
      } catch (error) {
          console.error('Error al actualizar unidad:', error);
          
          if (error.name === 'SequelizeUniqueConstraintError') {
              return res.status(409).json({
                  success: false,
                  error: `Ya existe una unidad con la misma denominación`
              });
          }

          res.status(500).json({
              success: false,
              error: 'Error al actualizar unidad: ' + error.message
          });
      }
  },

  eliminar: async (req, res) => {
    try {
      const { id } = req.params;

      const unidad = await Unidad.findByPk(id);
      if (!unidad) {
        return res.status(404).json({
          success: false,
          error: 'Unidad no encontrada'
        });
      }

      await unidad.destroy();

      res.json({
        success: true,
        message: 'Unidad eliminada correctamente'
      });
    } catch (error) {
      console.error('Error al eliminar unidad:', error);
      res.status(500).json({
        success: false,
        error: 'Error al eliminar unidad: ' + error.message
      });
    }
  }
};

module.exports = infraUnidadesController;
