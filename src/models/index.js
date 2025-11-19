const Ala = require('./Ala');
const Cama = require('./Cama');
const ClasificacionTerapeutica = require('./ClasificacionTerapeutica');
const Cobertura = require('./Cobertura');
const Diagnostico = require('./Diagnostico');
const Enfermero = require('./Enfermero');
const Especialidad = require('./Especialidad');
const Estudio = require('./Estudio');
const Habitacion = require('./Habitacion');
const Internacion = require('./Internacion');
const InternacionCama = require('./InternacionCama');
const InternacionCirugia = require('./InternacionCirugia');
const InternacionEstudio = require('./InternacionEstudio');
const InternacionEvenfermeria = require('./InternacionEvenfermeria');
const InternacionEvmedica = require('./InternacionEvmedica');
const InternacionMedicamento = require('./InternacionMedicamento');
const InternacionNotasenfermeria = require('./InternacionNotasenfermeria');
const InternacionTerapia = require('./InternacionTerapia');
const Medicamento = require('./Medicamento');
const Medico = require('./Medico');
const Origen = require('./Origen');
const Paciente = require('./Paciente');
const PacienteAntecedente = require ('./PacienteAntecedente');
const Rol = require ('./Rol');
const TipoAlta = require('./tipoalta');
const TipoAnestesia = require('./TipoAnestesia');
const TipoAntecedente = require('./TipoAntecedente');
const TipoCirugia = require('./TipoCirugia');
const TipoTerapia = require('./TipoTerapia');
const Unidad = require('./Unidad');
const Usuario = require('./Usuario');

Ala.associate({ Habitacion });
Cama.associate({ Habitacion, InternacionCama });
ClasificacionTerapeutica.associate({ Medicamento });
Cobertura.associate({ Paciente });
Diagnostico.associate({ Internacion, InternacionEvmedica });
Enfermero.associate({ InternacionEvenfermeria, InternacionNotasenfermeria });
Especialidad.associate({ Medico });
Estudio.associate({ InternacionEstudio });
Habitacion.associate({ Ala, Unidad, Cama });
Internacion.associate({ Paciente, Origen, Medico, Diagnostico, InternacionCama,InternacionCirugia, 
  InternacionEvmedica, InternacionEvenfermeria,  InternacionEstudio, InternacionMedicamento, 
  InternacionTerapia, InternacionNotasenfermeria, TipoAlta });
InternacionCama.associate({Internacion, Cama});
InternacionCirugia.associate({ Internacion, Medico, TipoCirugia, TipoAnestesia});
InternacionEstudio.associate({ Internacion, Medico, Estudio });
InternacionEvenfermeria.associate({ Internacion, Enfermero });
InternacionEvmedica.associate({ Internacion, Medico, Diagnostico });
InternacionMedicamento.associate({ Internacion, Medico, Medicamento });
InternacionNotasenfermeria.associate({ Internacion, Enfermero });
InternacionTerapia.associate({ Internacion, Medico, TipoTerapia });
Medicamento.associate({ InternacionMedicamento, ClasificacionTerapeutica });
Medico.associate({ Internacion, InternacionEvmedica, InternacionTerapia, Especialidad });
Origen.associate({ Internacion });
Paciente.associate({ Cobertura, Internacion, PacienteAntecedente });
PacienteAntecedente.associate({ Paciente, Medico, TipoAntecedente });
Rol.associate({ Usuario });
TipoAlta.associate({ Internacion });
TipoAnestesia.associate({InternacionCirugia});
TipoAntecedente.associate({ PacienteAntecedente });
TipoCirugia.associate({ InternacionCirugia });
TipoTerapia.associate({ InternacionTerapia });
Unidad.associate({ Habitacion });
Usuario.associate({ Rol });


// Exportar los modelos
module.exports = {
  Ala,
  Cama,
  ClasificacionTerapeutica,
  Cobertura,
  Diagnostico,
  Enfermero,
  Especialidad,
  Estudio,
  Habitacion,
  Internacion,
  InternacionCama,
  InternacionCirugia,
  InternacionEstudio,
  InternacionEvenfermeria,
  InternacionEvmedica,
  InternacionMedicamento,
  InternacionNotasenfermeria,
  InternacionTerapia,
  Medicamento,
  Medico,
  Origen,
  Paciente,
  PacienteAntecedente,
  Rol,
  TipoAlta,
  TipoAnestesia,
  TipoAntecedente,
  TipoCirugia,
  TipoTerapia,
  Unidad,
  Usuario
};
