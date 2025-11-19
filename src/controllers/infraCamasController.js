const db = require('../models');
const { Cama } = db;
const { Op } = require('sequelize');

const camaController = {
  listar: async (req, res) => {
    try {
      const camas = await Cama.findAll({
        attributes: ['idcama', 'idhabitacion', 'numerocama'],
        order: [['numerocama', 'ASC']],
        include: [
          {
            association: 'habitacion',
            attributes: ['nombrehabitacion'],
            include: [
              { association: 'ala', attributes: ['denominacion'] },
              { association: 'unidad', attributes: ['denominacion'] }
            ]
          }
        ]
      });
      res.json({ success: true, camas });
    } catch (error) {
      console.error('Error al obtener camas:', error);
      res.status(500).json({ success: false, error: 'Error al obtener camas: ' + error.message });
    }
  },

  listarPorHabitacion: async (req, res) => {

    try {

      const { idhabitacion } = req.params;
      const camas = await Cama.findAll({
        where: { idhabitacion },
        attributes: ['idcama', 'idhabitacion', 'numerocama'],
        order: [['numerocama', 'ASC']]
      });

      res.json({ success: true, camas });

    } catch (error) {
      console.error('Error al listar camas por habitación:', error);
      res.status(500).json({ success: false, error: 'Error al listar camas: ' + error.message });
    }

  },
  buscarPorId: async (req, res) => {
    try {
      const { id } = req.params;
      
      const cama = await Cama.findByPk(id, {
        attributes: ['idcama', 'idhabitacion', 'numerocama'],
        include: [
          { 
            association: 'habitacion',
            attributes: ['nombrehabitacion'],
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
          }
        ]
      });
      
      if (!cama) {
        return res.status(404).json({ 
          success: false,
          error: 'Cama no encontrada' 
        });
      }
      
      res.json({
        success: true,
        cama
      });
    } catch (error) {
      console.error('Error al buscar cama:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  },

  crear: async (req, res) => {

    try {

      const { idhabitacion, numerocama } = req.body;

      console.log('Crear cama ESTA TRAYENDO:', idhabitacion, numerocama);

      if (!idhabitacion || !numerocama || !numerocama.trim()) {
        return res.status(400).json({ success: false, error: 'Debe especificar habitación y nombre de la cama.' });
      }
      const nombreTrim = numerocama.trim().toUpperCase();
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/.test(nombreTrim)) {
        return res.status(400).json({ success: false, error: 'El nombre solo puede contener letras, números y espacios.' });
      }

      const existente = await Cama.findOne({ where: { idhabitacion, numerocama: nombreTrim } });

      if (existente) {
        return res.status(409).json({ success: false, error: `Ya existe una cama con el nombre '${nombreTrim}' en esta habitación.` });
      }

      const nuevaCama = await Cama.create({ idhabitacion, numerocama: nombreTrim });

      res.json({ success: true, message: 'Cama creada correctamente', cama: nuevaCama });

    } catch (error) {
      console.error('Error al crear cama:', error);
      res.status(500).json({ success: false, error: 'Error al crear cama: ' + error.message });
    }
  },

  actualizar: async (req, res) => {
    
    try {
    
      const { id } = req.params;
      const { numerocama } = req.body;
      
      const cama = await Cama.findByPk(id);
    
      if (!cama) {
        return res.status(404).json({ success: false, error: 'Cama no encontrada.' });
      }
    
      const nombreTrim = numerocama.trim().toUpperCase();

      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/.test(nombreTrim)) {
        return res.status(400).json({ success: false, error: 'El nombre solo puede contener letras, números y espacios.' });
      }
    
      const existente = await Cama.findOne(
       
        { where: { idhabitacion: cama.idhabitacion, numerocama: nombreTrim, idcama: { [Op.ne]: id } } }
      
      );

      if (existente) {
        return res.status(409).json({ success: false, error: `Ya existe una cama con el nombre '${nombreTrim}' en esta habitación.` });
      }

      cama.numerocama = nombreTrim;

      await cama.save();

      res.json({ success: true, message: 'Cama actualizada correctamente', cama });

    } catch (error) {
      console.error('Error al actualizar cama:', error);
      res.status(500).json({ success: false, error: 'Error al actualizar cama: ' + error.message });
    }

  },


  eliminar: async (req, res) => {
    try {
      const { id } = req.params;
      const cama = await Cama.findByPk(id);

      if (!cama) {
        return res.status(404).json({ success: false, error: 'Cama no encontrada.' });
      }

      await cama.destroy();
      res.json({ success: true, message: 'Cama eliminada correctamente.' });
    } catch (error) {
      console.error('Error al eliminar cama:', error);

      if (
        error.name === 'SequelizeForeignKeyConstraintError' ||
        (error.parent && error.parent.code === 'ER_ROW_IS_REFERENCED_2')
      ) {
        return res.status(409).json({
          success: false,
          error: 'No se puede eliminar la cama porque está asociada a una internación'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Error al eliminar cama: ' + error.message
      });
    }
  }

};
module.exports = camaController;