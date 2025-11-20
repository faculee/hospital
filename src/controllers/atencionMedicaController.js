const db = require('../models'); 
const { InternacionEvmedica, InternacionMedicamento, InternacionEstudio, InternacionCirugia, InternacionTerapia, Diagnostico,
    Estudio, Medicamento, Medico, TipoCirugia, TipoAnestesia, TipoTerapia, Internacion} = db;

const atencionMedicaController = {
  
  registrarEvaluacionMedica: async (req, res) => {
    const { idinternacion,  iddiagnostico, observacionesem } = req.body;
    
    try {

      const idmedico= req.session.usuario?.profesional;

      if (req.session.usuario?.rol !== 3) {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      }


      if (!idinternacion  || !iddiagnostico) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
      }

      const internacion = await Internacion.findByPk(idinternacion);
      if (!internacion) {
        return res.status(404).json({ success: false, message: 'Internación no encontrada.' });
      }

      const medico = await Medico.findByPk(idmedico);
      if (!medico) {
        return res.status(404).json({ success: false, message: 'Médico no encontrado.' });
      }

      const diagnostico = await Diagnostico.findByPk(iddiagnostico);
      if (!diagnostico) {
        return res.status(404).json({ success: false, message: 'Diagnostico no encontrado.' });
      }

      const nuevo = await InternacionEvmedica.create({
        idinternacion,
        idmedico,
        iddiagnostico,
        fechaevaluacion: new Date(),
        observacionesem: observacionesem ? observacionesem.toUpperCase() : null
      });

      return res.json({ success: true, data: nuevo });

    } catch (error) {
      console.error('Error al registrar evaluacion:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  registrarMedicamento: async (req, res) => {
    const { idinternacion,  idmedicamento,  cantidad, observacionesme } = req.body;
    try {

      const idmedico= req.session.usuario?.profesional;

      if (req.session.usuario?.rol !== 3) {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      }

      if (!idinternacion  || !idmedicamento || cantidad === undefined) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
      }

      const internacion = await Internacion.findByPk(idinternacion);
      if (!internacion) {
        return res.status(404).json({ success: false, message: 'Internación no encontrada.' });
      }

      const cantidadInt = parseInt(cantidad);
      if (isNaN(cantidadInt) || cantidadInt < 0) {
        return res.status(400).json({ success: false, message: 'La cantidad debe ser un número mayor o igual a 0.' });
      }

      const medico = await Medico.findByPk(idmedico);
      if (!medico) {
        return res.status(404).json({ success: false, message: 'Médico no encontrado.' });
      }

      const medicamento = await Medicamento.findByPk(idmedicamento);
      if (!medicamento) {
        return res.status(404).json({ success: false, message: 'Medicamento no encontrado.' });
      }

      const nuevo = await InternacionMedicamento.create({
        idinternacion,
        idmedico,
        idmedicamento,
        fechaprescripcion: new Date(),
        cantidad: cantidadInt,
        observacionesme: observacionesme ? observacionesme.toUpperCase() : null
      });

      return res.json({ success: true, data: nuevo });

    } catch (error) {
      console.error('Error al registrar medicamento:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  registrarEstudio: async (req, res) => {
    const { idinternacion, idestudio, observacioneses } = req.body;
    
    try {

      const idmedico= req.session.usuario?.profesional;

      if (req.session.usuario?.rol !== 3) {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      }

      if (!idinternacion || !idestudio) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
      }

      const internacion = await Internacion.findByPk(idinternacion);
      if (!internacion) {
        return res.status(404).json({ success: false, message: 'Internación no encontrada.' });
      }

      const medico = await Medico.findByPk(idmedico);
      if (!medico) {
        return res.status(404).json({ success: false, message: 'Médico no encontrado.' });
      }

      const estudio = await Estudio.findByPk(idestudio);
      if (!estudio) {
        return res.status(404).json({ success: false, message: 'Estudio no encontrado.' });
      }

      const nuevo = await InternacionEstudio.create({
        idinternacion,
        idmedico,
        idestudio,
        fechaestudio: new Date(),
        observacioneses: observacioneses ? observacioneses.toUpperCase() : null
      });

      return res.json({ success: true, data: nuevo });

    } catch (error) {
      console.error('Error al registrar estudio:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  registrarCirugia: async (req, res) => {
    const { idinternacion, idtipocirugia, idtipoanestesia, observaciones } = req.body;
    
    try {

      const idmedico= req.session.usuario?.profesional;

      if (req.session.usuario?.rol !== 3) {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      }

      if (!idinternacion || !idtipocirugia  || !idtipoanestesia) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
      }

      const internacion = await Internacion.findByPk(idinternacion);
      if (!internacion) {
        return res.status(404).json({ success: false, message: 'Internación no encontrada.' });
      }

      const medico = await Medico.findByPk(idmedico);
      if (!medico) {
        return res.status(404).json({ success: false, message: 'Médico no encontrado.' });
      }

      const cirugia = await TipoCirugia.findByPk(idtipocirugia);
      if (!cirugia) {
        return res.status(404).json({ success: false, message: 'Tipo de Cirugia no encontrado.' });
      }

      const nuevo = await InternacionCirugia.create({
        idinternacion,
        idmedico,
        idtipocirugia,
        idtipoanestesia,
        fechacirugia: new Date(),
        observaciones: observaciones ? observaciones.toUpperCase() : null
      });

      return res.json({ success: true, data: nuevo });

    } catch (error) {
      console.error('Error al registrar cirugia:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  registrarTerapia: async (req, res) => {
    const { idinternacion, fechaterapia, idtipoterapia, observaciones } = req.body;
    
    try {

      const idmedico= req.session.usuario?.profesional;

      if (req.session.usuario?.rol !== 3) {
        return res.status(403).json({ success: false, message: 'Acceso no autorizado.' });
      }

      if (!idinternacion || !idtipoterapia) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios.' });
      }
      
      const internacion = await Internacion.findByPk(idinternacion);
      if (!internacion) {
        return res.status(404).json({ success: false, message: 'Internación no encontrada.' });
      }

      const medico = await Medico.findByPk(idmedico);
      if (!medico) {
        return res.status(404).json({ success: false, message: 'Médico no encontrado.' });
      }

      const tipoTerapia = await TipoTerapia.findByPk(idtipoterapia);
      if (!tipoTerapia) {
        return res.status(404).json({ success: false, message: 'Tipo de terapia no encontrado.' });
      }

      const nuevo = await InternacionTerapia.create({
        idinternacion,
        idmedico,
        idtipoterapia,
        fechaterapia,
        observaciones: observaciones ? observaciones.toUpperCase() : null
      });

      return res.json({ success: true, data: nuevo });

    } catch (error) {
      console.error('Error al registrar terapia:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  listarEvaluacionesMedicasPorInternacion: async (req, res) => {

    const { idinternacion } = req.params;

    try {
      if (!idinternacion) {
        return res.status(400).json({ success: false, message: 'Falta el id de internación.' });
      }

      const evaluaciones = await InternacionEvmedica.findAll({
        where: { idinternacion },
        include: [
          { model: Diagnostico, as: 'diagnostico', attributes: ['iddiagnostico', 'descripcion'] },
          { model: Medico, as: 'medico', attributes: ['idmedico', 'apellidonombres'] }
        ],
        order: [['idinterevaluacionmedica', 'DESC']]
      });

      const resultado = evaluaciones.map(e => ({
          id: e.idinterevaluacionmedica,
          idinternacion: e.idinternacion,
          fechaevaluacion: e.fechaevaluacion,
          medico: e.medico.apellidonombres,
          diagnostico: e.diagnostico.descripcion,
          observacionesem: e.observacionesem || ''
      }));

      return res.json({ success: true, data: resultado });

    } catch (error) {
      console.error('Error al listar diagnosticos:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },


  listarMedicamentosPorInternacion: async (req, res) => {

    const { idinternacion } = req.params;

    try {
      if (!idinternacion) {
        return res.status(400).json({ success: false, message: 'Falta el id de internación.' });
      }

      const medicamentos = await InternacionMedicamento.findAll({
        where: { idinternacion },
        include: [
          { model: Medicamento, as: 'medicamento', attributes: ['idmedicamento', 'nombremedicamento', 'presentacion'] },
          { model: Medico, as: 'medico', attributes: ['idmedico', 'apellidonombres'] }
        ],
        order: [['idintermedicamentos', 'DESC']]
      });

      const resultado = medicamentos.map(m => ({
          id: m.id,
          idinternacion: m.idinternacion,
          cantidad: m.cantidad,
          observacionesme: m.observacionesme || '',
          fechaprescripcion: m.fechaprescripcion,
          medico: m.medico.apellidonombres,
          medicamento: m.medicamento,
          presentacion: m.medicamento.presentacion
      }));


      return res.json({ success: true, data: resultado });

    } catch (error) {
      console.error('Error al listar medicamentos:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  listarEstudiosPorInternacion: async (req, res) => {

    const { idinternacion } = req.params;

    try {
      if (!idinternacion) {
        return res.status(400).json({ success: false, message: 'Falta el id de internación.' });
      }

      const estudios = await InternacionEstudio.findAll({
        where: { idinternacion },
        include: [
          { model: Estudio, as: 'estudio', attributes: ['idestudio', 'denominacion'] },
          { model: Medico, as: 'medico', attributes: ['idmedico', 'apellidonombres'] }
        ],
        order: [['idinterestudios', 'DESC']]
      });

      const resultado = estudios.map(e => ({
          id: e.idinterestudios,
          idinternacion: e.idinternacion,
          observacioneses: e.observacioneses || '',
          fechaestudio: e.fechaestudio,
          medico: e.medico.apellidonombres,
          estudio: e.estudio.denominacion
      }));

      return res.json({ success: true, data: resultado });

    } catch (error) {
      console.error('Error al listar estudios:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  },

  listarCirugiasPorInternacion: async (req, res) => {
    const { idinternacion } = req.params;

    try {
      if (!idinternacion) {
        return res.status(400).json({ success: false, message: 'Falta el id de internación.' });
      }

      const cirugias = await InternacionCirugia.findAll({
        where: { idinternacion },
        include: [
          { 
            model: TipoCirugia, 
            as: 'tipocirugia', 
            attributes: ['idtipocirugia', 'denominacioncirugia'] 
          },
          { 
            model: Medico, 
            as: 'medico', 
            attributes: ['idmedico', 'apellidonombres'] 
          },
          { 
            model: TipoAnestesia, 
            as: 'tipoanestesia',
            attributes: ['idtipoanestesia', 'denominacionanestesia'] 
          }
        ],
        order: [['idintercirugias', 'DESC']]
      });

      const resultado = cirugias.map(e => ({
        id: e.idintercirugias, 
        idinternacion: e.idinternacion,
        fechacirugia: e.fechacirugia,
        medico: e.medico.apellidonombres,
        cirugia: e.tipocirugia.denominacioncirugia, 
        anestesia: e.tipoanestesia.denominacionanestesia,
        observaciones: e.observaciones || ''
      }));

      return res.json({ success: true, data: resultado });

    } catch (error) {
      console.error('Error al listar cirugias:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error interno: ' + error.message 
      });
    }
  },

  listarTerapiasPorInternacion: async (req, res) => {

    const { idinternacion } = req.params;

    try {
      if (!idinternacion) {
        return res.status(400).json({ success: false, message: 'Falta el id de internación.' });
      }

      const terapias = await InternacionTerapia.findAll({
        where: { idinternacion },
        include: [
          { model: TipoTerapia, as: 'tipoterapia', attributes: ['idtipoterapia', 'denominacionterapia'] },
          { model: Medico, as: 'medico', attributes: ['idmedico', 'apellidonombres'] }
        ],
        order: [['idinterterapias', 'DESC']]
      });

      const resultado = terapias.map(e => ({
          id: e.idinterestudios,
          idinternacion: e.idinternacion,
          fechaterapia: e.fechaterapia,
          medico: e.medico.apellidonombres,
          terapia: e.tipoterapia.denominacionterapia,
          observaciones: e.observaciones || ''
        }));

      return res.json({ success: true, data: resultado });

    } catch (error) {
      console.error('Error al listar terapias:', error);
      return res.status(500).json({ success: false, message: 'Error interno: ' + error.message });
    }
  }
  };

module.exports = atencionMedicaController;