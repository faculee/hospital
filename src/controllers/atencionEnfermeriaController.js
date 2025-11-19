const db = require('../models');
const { Internacion, Enfermero, InternacionEvenfermeria, InternacionNotasenfermeria  } = db;

const atencionEnfermeriaController = {
  registrarEvaluacionEnfermeria: async (req, res) => {
    const { idinternacion, parterial, fcardiaca, frespiratoria, tcorporal, saturacion, observacionesee } = req.body;

    try {
      
      const idenfermero = req.session.usuario?.profesional;

      if (req.session.usuario?.rol !== 4) {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      }

      if (!idinternacion || !idenfermero) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
      }

      if (parterial) {
        const regexPA = /^(\d{2,3})\/(\d{2,3})$/;
        const matchPA = parterial.match(regexPA);
        if (!matchPA || matchPA[1] < 50 || matchPA[1] > 250 || matchPA[2] < 30 || matchPA[2] > 150) {
          return res.status(400).json({ success: false, message: 'Presión arterial inválida. Ejemplo válido: 120/80' });
        }
      }

      if (fcardiaca) {
        const fc = parseInt(fcardiaca);
        if (isNaN(fc) || fc < 30 || fc > 200) {
          return res.status(400).json({ success: false, message: 'Frecuencia cardíaca inválida. Valor permitido: 30 a 200 lpm' });
        }
      }

      if (frespiratoria) {
        const fr = parseInt(frespiratoria);
        if (isNaN(fr) || fr < 8 || fr > 50) {
          return res.status(400).json({ success: false, message: 'Frecuencia respiratoria inválida. Valor permitido: 8 a 50 rpm' });
        }
      }

      if (tcorporal) {
        const temp = parseFloat((tcorporal + '').replace(',', '.'));
        if (isNaN(temp) || temp < 34 || temp > 42) {
          return res.status(400).json({ success: false, message: 'Temperatura corporal inválida. Valor permitido: 34 a 42 °C' });
        }
      }

      if (saturacion) {
        const sat = parseInt(saturacion);
        if (isNaN(sat) || sat < 50 || sat > 100) {
          return res.status(400).json({ success: false, message: 'Saturación inválida. Valor permitido: 50% a 100%' });
        }
      }

      const internacion = await Internacion.findByPk(idinternacion);
      if (!internacion) {
        return res.status(404).json({ success: false, message: 'Internación no encontrada.' });
      }

      const enfermero = await Enfermero.findByPk(idenfermero);
      if (!enfermero) {
        return res.status(404).json({ success: false, message: 'Enfermero no encontrado.' });
      }

      const nuevaEvaluacion = await InternacionEvenfermeria.create({
        idinternacion,
        idenfermero,
        fechaevaluacion: new Date(),
        parterial: parterial || null,
        fcardiaca: fcardiaca || null,
        frespiratoria: frespiratoria || null,
        tcorporal: tcorporal || null,
        saturacion: saturacion || null,
        observacionesee: observacionesee ? observacionesee.toUpperCase() : null
      });

      return res.json({ success: true, data: nuevaEvaluacion });

    } catch (error) {
      console.error('Error al registrar evaluación de enfermería:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  listarEvaluaciones: async (req, res) => {
    const { idinternacion } = req.params;

    try {
      const evaluaciones = await InternacionEvenfermeria.findAll({
        where: { idinternacion },
        include: [{
          model: Enfermero,
          as: 'enfermero',
          attributes: ['apellidonombres']
        }],
        order: [['fechaevaluacion', 'DESC']]
      });

      const resultado = evaluaciones.map(e => ({
        id: e.idinterevaluacioenfermeria,
        fechaevaluacion: e.fechaevaluacion,
        enfermero: e.enfermero ? e.enfermero.apellidonombres : 'SIN DATOS',
        parterial: e.parterial,
        fcardiaca: e.fcardiaca,
        frespiratoria: e.frespiratoria,
        tcorporal: e.tcorporal,
        saturacion: e.saturacion,
        observacionesee: e.observacionesee
      }));

      return res.json({ success: true, data: resultado });

    } catch (error) {
      console.error('Error al listar evaluaciones de enfermería:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  registrarNotaEnfermeria: async (req, res) => {
    
    const { idinternacion, nota } = req.body;

    try {
      const idenfermero = req.session.usuario?.profesional;

      if (req.session.usuario?.rol !== 4) {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      }

      if (!idinternacion || !idenfermero || !nota || nota.trim() === '') {
        return res.status(400).json({ success: false, message: 'La nota es obligatoria.' });
      }

      const internacion = await Internacion.findByPk(idinternacion);
      if (!internacion) {
        return res.status(404).json({ success: false, message: 'Internación no encontrada.' });
      }

      const enfermero = await Enfermero.findByPk(idenfermero);
      if (!enfermero) {
        return res.status(404).json({ success: false, message: 'Enfermero no encontrado.' });
      }

      const nuevaNota = await InternacionNotasenfermeria.create({
        idinternacion,
        idenfermero,
        fechanota: new Date(),
        nota: nota.trim().toUpperCase()
      });

      return res.json({ success: true, data: nuevaNota });

    } catch (error) {
      console.error('Error al registrar nota de enfermería:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  listarNotasEnfermeria: async (req, res) => {
    const { idinternacion } = req.params;

    try {
      const notas = await InternacionNotasenfermeria.findAll({
        where: { idinternacion },
        include: [{
          model: Enfermero,
          as: 'enfermero',
          attributes: ['apellidonombres']
        }],
        order: [['fechanota', 'DESC']]
      });

      const resultado = notas.map(n => ({
        id: n.idinternotas,
        fechanota: n.fechanota,
        enfermero: n.enfermero ? n.enfermero.apellidonombres : 'SIN DATOS',
        nota: n.nota
      }));

      return res.json({ success: true, data: resultado });

    } catch (error) {
      console.error('Error al listar notas de enfermería:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  }
};

module.exports = atencionEnfermeriaController;
