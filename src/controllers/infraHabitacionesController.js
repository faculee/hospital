const db = require('../models');
const { Habitacion, Unidad, Ala } = db;

const habitacionController = {
  listar: async (req, res) => {
    try {
      const habitaciones = await Habitacion.findAll({
        attributes: ['idhabitacion', 'idala', 'idunidad', 'nombrehabitacion'],
        order: [['nombrehabitacion', 'ASC']],
        include: [
          { 
            association: 'ala',
            attributes: ['denominacion']
          },
          { 
            association: 'unidad',
            attributes: ['denominacion']
          }
        ]
      });
      
      res.json(habitaciones);
    } catch (error) {
      console.error('Error al obtener habitaciones:', error);
      res.status(500).json({ 
        success: false,
        error: 'Error al obtener habitaciones: ' + error.message 
      });
    }
  },
  buscarPorUnidadAla: async (req, res) => {
    try {
      const { unidad, ala } = req.query;

      const where = {};
      if (unidad && unidad !== 'todas') where.idunidad = unidad;
      if (ala && ala !== 'todas') where.idala = ala;

      const habitaciones = await Habitacion.findAll({
        where,
        attributes: ['idhabitacion', 'nombrehabitacion'],
        include: [
          {
            model: Unidad,
            as: 'unidad',
            attributes: ['denominacion'],
          },
          {
            model: Ala,
            as: 'ala',
            attributes: ['denominacion'],
          }
        ],
        order: [['nombrehabitacion', 'ASC']]
      });

      const habitacionesFormateadas = habitaciones.map(h => ({
        idhabitacion: h.idhabitacion,
        nombrehabitacion: h.nombrehabitacion,
        nombreunidad: h.unidad?.denominacion || '—',
        nombreala: h.ala?.denominacion || '—'
      }));

      res.json(habitacionesFormateadas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al buscar habitaciones' });
    }
  },

  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      
      const habitacion = await Habitacion.findByPk(id, {
        attributes: ['idhabitacion', 'idala', 'idunidad', 'nombrehabitacion'],
        include: [
          { 
            association: 'ala',
            attributes: ['denominacion']
          },
          { 
            association: 'unidad',
            attributes: ['denominacion']
          }
        ]
      });
      
      if (!habitacion) {
        return res.status(404).json({ 
          success: false,
          error: 'Habitación no encontrada' 
        });
      }
      
      res.json({
        success: true,
        habitacion
      });
    } catch (error) {
      console.error('Error al buscar habitación:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  crear: async (req, res) => {
      try {
          const { idala, idunidad, nombrehabitacion } = req.body;

          if (!idala || !idunidad || !nombrehabitacion || !nombrehabitacion.trim()) {
              return res.status(400).json({
                  success: false,
                  error: 'Debe especificar unidad, ala y nombre de la habitación'
              });
          }

          const nombreTrim = nombrehabitacion.trim();

          const existente = await Habitacion.findOne({
              where: { idala, idunidad, nombrehabitacion: nombreTrim }
          });

          if (existente) {
              return res.status(409).json({
                  success: false,
                  error: `Ya existe una habitación con el nombre '${nombreTrim}'.`
              });
          }

          if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/.test(nombreTrim)) {
              return res.status(400).json({
                  success: false,
                  error: 'El nombre solo puede contener letras, números y espacios.'
              });
          }

          if (nombreTrim.length > 100) {
              return res.status(400).json({
                  success: false,
                  error: 'El nombre no debe superar los 100 caracteres.'
              });
          }

          const nuevaHabitacion = await Habitacion.create({
              idala,
              idunidad,
              nombrehabitacion: nombreTrim
          });

          res.json({
              success: true,
              message: 'Habitación creada correctamente',
              habitacion: nuevaHabitacion
          });

      } catch (error) {
          console.error('Error al crear habitación:', error);
          
          if (error.name === 'SequelizeUniqueConstraintError') {
              return res.status(409).json({
                  success: false,
                  error: 'Ya existe una habitación con ese nombre..'
              });
          }

          res.status(500).json({
              success: false,
              error: 'Error al crear habitación: ' + error.message
          });
      }
  },

  actualizar: async (req, res) => {
      try {
          const { id } = req.params;
          const { idala, idunidad, nombrehabitacion } = req.body;

          const habitacion = await Habitacion.findByPk(id);
          if (!habitacion) {
              return res.status(404).json({
                  success: false,
                  error: 'Habitación no encontrada'
              });
          }

          if (!idala || !idunidad || !nombrehabitacion || !nombrehabitacion.trim()) {
              return res.status(400).json({
                  success: false,
                  error: 'Los campos idala, idunidad y nombrehabitacion son obligatorios'
              });
          }

          const nombreTrim = nombrehabitacion.trim();

          if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/.test(nombreTrim)) {
              return res.status(400).json({
                  success: false,
                  error: 'El nombre solo puede contener letras, números y espacios.'
              });
          }

          if (nombreTrim.length > 100) {
              return res.status(400).json({
                  success: false,
                  error: 'El nombre no debe superar los 100 caracteres.'
              });
          }

          if (
              habitacion.idala !== parseInt(idala) ||
              habitacion.idunidad !== parseInt(idunidad) ||
              habitacion.nombrehabitacion !== nombreTrim
          ) {
              const existente = await Habitacion.findOne({
                  where: { idala, idunidad, nombrehabitacion: nombreTrim }
              });

              if (existente) {
                  return res.status(409).json({
                      success: false,
                      error: `Ya existe otra habitación con el nombre '${nombreTrim}' en esta ala y unidad`
                  });
              }
          }

          habitacion.idala = idala;
          habitacion.idunidad = idunidad;
          habitacion.nombrehabitacion = nombreTrim;
          await habitacion.save();

          res.json({
              success: true,
              message: 'Habitación actualizada correctamente',
              habitacion
          });
      } catch (error) {
          console.error('Error al actualizar habitación:', error);
          res.status(500).json({
              success: false,
              error: 'Error al actualizar habitación: ' + error.message
          });
      }
  },
  eliminar: async (req, res) => {
      try {
          const { id } = req.params;

          const habitacion = await Habitacion.findByPk(id);
          if (!habitacion) {
              return res.status(404).json({
                  success: false,
                  error: 'Habitación no encontrada'
              });
          }

          await habitacion.destroy();

          res.json({
              success: true,
              message: 'Habitación eliminada correctamente'
          });
      } catch (error) {
          console.error('Error al eliminar habitación:', error);

          if (error.name === 'SequelizeForeignKeyConstraintError') {
              return res.status(409).json({
                  success: false,
                  error: 'No se puede eliminar la habitación porque tiene registros relacionados (Posiblemente tenga camas asociadas).'
              });
          }

          res.status(500).json({
              success: false,
              error: 'Error al eliminar habitación: ' + error.message
          });
      }
  }
};

module.exports = habitacionController;
