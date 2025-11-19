
import { buscarPaciente } from './buscarPaciente.js';
import { mostrarMensaje, formatearFecha } from './utils.js';

const API_URL_ANTECEDENTESPERSONALES = '/api/pacientesantecedentes';

const btnBuscarPaciente    = document.getElementById("btnBuscarPaciente");
const inputDocumento       = document.getElementById("documento");
const datosPaciente        = document.getElementById("datosPaciente");
const contenedorSecciones  = document.querySelector(".secciones-container");
const contenedorAntecedentes = document.getElementById("cardAntecedentes");

document.addEventListener("DOMContentLoaded", () => {
  
  btnBuscarPaciente.addEventListener("click", async () => {

    if (btnBuscarPaciente.textContent === "Nueva búsqueda") {
      resetearBusqueda();
      contenedorAntecedentes.style.display = 'none';
      contenedorSecciones.style.display = 'none';
     } else {
     
      const dni = inputDocumento.value.trim();
      if (!dni || isNaN(dni)) {
        mostrarMensaje('#mensajes', 'Ingrese un número de documento válido', 0);
        return; 
      }

      const paciente = await buscarPaciente(
        dni,
        mostrarDatosPaciente,
        () => {},      // omitir admisión
        limpiarDatosPaciente,
        bloquearDocumento,
        btnBuscarPaciente,
        inputDocumento,
        null,
        () => {},
        false
      );

      if (!paciente) return;

      const internaciones = await obtenerHistorialInternaciones(paciente.idpaciente);

      if (internaciones.length === 0) {
        mostrarMensaje('#mensajes', 'No se encontró historial médico.', 0);
        return;
      }

      borrarTablas();


      for (const int of internaciones) {
        await cargarTablaEvaluaciones(int.idinternacion);
        await cargarTablaMedicamentos(int.idinternacion);
        await cargarTablaEstudios(int.idinternacion);
        await cargarTablaCirugias(int.idinternacion);
        await cargarTablaTerapias(int.idinternacion);
        await cargarTablaEvaluacionesEnfermeria(int.idinternacion);
        await cargarTablaNotas(int.idinternacion);
      }

      mostrarSelectorInternaciones(internaciones);
      await listarAntecedentes(paciente.idpaciente);
      contenedorSecciones.style.display = 'block';
    }
  });
});

function mostrarDatosPaciente(paciente) {
  let edadTexto = "Sin datos";

  if (paciente.fechanacimiento) {
    const fechaNac = new Date(paciente.fechanacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) edad--;
    edadTexto = `${edad} años`;
  }

  const sexoTexto = { 'M': 'Masculino', 'F': 'Femenino', 'X': 'No binario' }[paciente.sexo] || 'Sin datos';

  datosPaciente.innerHTML = `
    <div class="card border shadow-sm mb-3 bg-white">
      <div class="card-body text-center">
        <div class="mb-2">
          <h3 class="fw-bold mb-1">${paciente.apellidonombres}</h3>
        </div>
        <div class="mb-1">
          <small class="text-muted" style="font-size: 0.75rem;">${sexoTexto}</small>
        </div>
        <div>
          <span style="font-size: 1rem;" class="text-secondary">${edadTexto}</span>
        </div>
        <div>
          <span style="font-size: 1rem;" class="text-secondary">${paciente.cobertura.denominacion}</span>
        </div>

      </div>
    </div>`;
}
async function listarAntecedentes(idpaciente) {
  try {
    const res = await fetch(`${API_URL_ANTECEDENTESPERSONALES}/${idpaciente}`);
    const { success, antecedentes } = await res.json();
    const tbody = document.getElementById('tablaAntecedentes');
    
    tbody.innerHTML = '';
    
    if (success && antecedentes.length) {
      
      contenedorAntecedentes.style.display = 'block';

      tbody.innerHTML += antecedentes.map(a => `
        <tr data-idpaciente="${idpaciente}">
          <td class="text-center">${formatearFecha(a.createdAt)}</td>
          <td>${a.medico?.apellidonombres || ''}</td>
          <td>${a.tipoantecedente?.denominacionantecedente || ''}</td>
          <td>${a.notasdeltipo || ''}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al listar antecedentes personales:', err);
  }
}
async function obtenerHistorialInternaciones(idpaciente) {
  try {
    const res = await fetch(`/api/internaciones/paciente/${idpaciente}`);
    const json = await res.json();
    console.log(json);
    return (json.success && Array.isArray(json.internaciones)) ? json.internaciones : [];
  } catch (err) {
    console.error('Error al obtener internaciones históricas:', err);
    return [];
  }
}

async function mostrarSelectorInternaciones(internaciones) {
  const contenedor = document.getElementById('selectorInternaciones');

  if (!internaciones.length) {
    contenedor.style.display = 'none';
    contenedor.innerHTML = '';
    return;
  }

  contenedor.innerHTML = `
    <div class="mb-3">
      <label class="form-label d-block text-center">Seleccione la internación para visualizar su detalle:</label>
      <select class="form-select" id="selectInternacion">
        ${internaciones.map(int => `
          <option value="${int.idinternacion}">
            ${formatearFecha(int.fechaingreso)} - ${int.origen.denominacion} - ${int.medico.apellidonombres}
          </option>
        `).join('')}
      </select>
    </div>
    
  `;
  
  contenedor.style.display = 'block';
  const select = document.getElementById('selectInternacion');

  select.addEventListener('change', (e) => {
    const idinternacion = e.target.value;
    const int = internaciones.find(i => i.idinternacion == idinternacion);
    resaltarRegistrosPorInternacion(idinternacion);
    mostrarDetalleInternacion(int);
  });

  if (select && select.value) {
    const int = internaciones.find(i => i.idinternacion == select.value);
    resaltarRegistrosPorInternacion(select.value);
    mostrarDetalleInternacion(int);
  }
}

function mostrarDetalleInternacion(int) {
  const detalle = document.getElementById('detalleInternacion');
  if (!int) return detalle.innerHTML = '';

  detalle.innerHTML = `
    <div class="card shadow-sm mb-4 border-0 bg-secondary text-white">
      <div class="card-body">
          <h5 class="text-center fw-bold mb-3">Internación N° ${int.idinternacion}</h5>
          <div class="row mb-2">
            <div class="col-md-12 text-center">
                <p class="mb-1">
                <strong>Fecha Ingreso: </strong>${formatearFecha(int.fechaingreso)} - <strong>Hora:</strong> ${int.horaingreso} |                      
                <strong>Origen:</strong> ${int.origen.denominacion} |
                <strong>Médico:</strong> ${int.medico.apellidonombres} 
                </p>
            </div>
            <div class="col-md-12 text-center">
                <p class="mb-1">
                <strong>Diagnóstico:</strong> ${int.diagnostico.descripcion}
                </p>
            </div>
            <div class="col-md-12 text-center">
                <p class="mb-1">
                <strong>Datos del Alta del Paciente:</strong>
                </p>
            </div>
            <div class="col-md-12 text-center">
                <p class="mb-1">
                <strong>Fecha: </strong> ${int.fechaalta ? formatearFecha(int.fechaalta) : 'Sin Alta'} |
                <strong>Medico:</strong> ${int.medicoalta ? int.medicoAlta.apellidonombres : 'Sin Alta'} | 
                <strong>Motivo:</strong> ${int.diagnosticoalta ? int.diagnosticoAlta.descripcion : 'Sin Alta'}  
                </p>
            </div>
          </div>
      </div>
    </div>
  `;
}

function resaltarRegistrosPorInternacion(idinternacion) {
 
  document.querySelectorAll('tbody tr').forEach(fila => {
    if (!fila.dataset.idinternacion) return; 

    if (fila.dataset.idinternacion === idinternacion) {
      fila.style.display = '';
    } else {
      fila.style.display = 'none';
    }
  });
}



function borrarTablas() {
  [
    'tablaEvaluaciones',
    'tablaMedicamentos',
    'tablaEstudios',
    'tablaCirugias',
    'tablaTerapias',
    'tablaEvaluacionesEnfermeria',
    'tablaNotas'
  ].forEach(id => {
    const tbody = document.getElementById(id);
    if (tbody) tbody.innerHTML = '';
  });
}


async function cargarTablaEvaluaciones(idinternacion) {
  try {
    const res = await fetch(`/api/atencionmedica/evaluacionesm/${idinternacion}`);
    const { success, data } = await res.json();
    const tbody = document.getElementById('tablaEvaluaciones');

    if (data.length) {
      tbody.innerHTML += data.map(r => `
        <tr data-idinternacion="${idinternacion}">
          <td class="text-center col-fecha">${formatearFecha(r.fechaevaluacion)}</td>
          <td>${r.medico}</td>
          <td>${r.diagnostico}</td>
          <td>${r.observacionesem || ''}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar evaluaciones médicas:', err);
  }
}


async function cargarTablaMedicamentos(idinternacion) {
  try {
    const res = await fetch(`/api/atencionmedica/medicamentos/${idinternacion}`);
    const { success, data } = await res.json();
    const tbody = document.getElementById('tablaMedicamentos');

    if (data.length) {
      tbody.innerHTML += data.map(r => `
        <tr data-idinternacion="${idinternacion}">
          <td class="text-center col-fecha">${formatearFecha(r.fechaprescripcion)}</td>
          <td>${r.medico}</td>
          <td class="col-medicamento">${r.medicamento.nombremedicamento} ${r.medicamento.presentacion}</td>
          <td class="text-center col-cantidad">${r.cantidad}</td>
          <td class="col-observaciones">${r.observacionesme || ''}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar medicamentos:', err);
  }
}


async function cargarTablaEstudios(idinternacion) {
  try {
    const res = await fetch(`/api/atencionmedica/estudios/${idinternacion}`);
    const { success, data } = await res.json();
    const tbody = document.getElementById('tablaEstudios');

    if (data.length) {
      tbody.innerHTML += data.map(r => `
        <tr data-idinternacion="${idinternacion}">
          <td class="text-center col-fecha">${formatearFecha(r.fechaestudio)}</td>
          <td>${r.medico}</td>
          <td>${r.estudio}</td>
          <td class="col-observaciones">${r.observacioneses || ''}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar estudios:', err);
  }
}


async function cargarTablaCirugias(idinternacion) {
  try {
    const res = await fetch(`/api/atencionmedica/cirugias/${idinternacion}`);
    const { success, data } = await res.json();
    const tbody = document.getElementById('tablaCirugias');

    if (data.length) {
      tbody.innerHTML += data.map(r => `
        <tr data-idinternacion="${idinternacion}">
          <td class="text-center col-fecha">${formatearFecha(r.fechacirugia)}</td>
          <td>${r.medico}</td>
          <td>${r.cirugia}</td>
          <td>${r.anestesia}</td>
          <td class="col-observaciones">${r.observaciones || ''}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar cirugías:', err);
  }
}

async function cargarTablaTerapias(idinternacion) {
  try {
    const res = await fetch(`/api/atencionmedica/terapias/${idinternacion}`);
    const { success, data } = await res.json();
    const tbody = document.getElementById('tablaTerapias');

    if (data.length) {
      tbody.innerHTML += data.map(r => `
        <tr data-idinternacion="${idinternacion}">
          <td class="text-center col-fecha">${formatearFecha(r.fechaterapia)}</td>
          <td>${r.medico}</td>
          <td>${r.terapia}</td>
          <td class="col-observaciones">${r.observaciones || ''}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar terapias:', err);
  }
}

async function cargarTablaEvaluacionesEnfermeria(idinternacion) {
  try {
    const res = await fetch(`/api/atencionenfermeria/evaluaciones/${idinternacion}`);
    const { success, data } = await res.json();
    const tbody = document.getElementById('tablaEvaluacionesEnfermeria');

    if (data.length) {
      tbody.innerHTML += data.map(r => `
        <tr data-idinternacion="${idinternacion}">
          <td class="text-center col-fecha">${formatearFecha(r.fechaevaluacion)}</td>
          <td>${r.enfermero}</td>
          <td class="text-center">${r.parterial || '-'}</td>
          <td class="text-center">${r.fcardiaca || '-'}</td>
          <td class="text-center">${r.frespiratoria || '-'}</td>
          <td class="text-center">${r.tcorporal || '-'}</td>
          <td class="text-center">${r.saturacion || '-'}</td>
          <td>${r.observacionesee || '-'}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar evaluaciones de enfermería:', err);
  }
}
async function cargarTablaNotas(idinternacion) {
  try {
    const res = await fetch(`/api/atencionenfermeria/notas/${idinternacion}`);
    const { success, data } = await res.json();
    const tbody = document.getElementById('tablaNotas');

    if (data.length) {
      tbody.innerHTML += data.map(r => `
        <tr data-idinternacion="${idinternacion}">
          <td class="text-center col-fecha">${formatearFecha(r.fechanota)}</td>
          <td>${r.enfermero}</td>
          <td>${r.nota}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al cargar notas de enfermería:', err);
  }
}


function resetearBusqueda() {
      inputDocumento.value = "";
      inputDocumento.disabled = false;
      btnBuscarPaciente.textContent = "Buscar";
      limpiarDatosPaciente();
      datosInternacion.innerHTML = "";
      inputDocumento.focus();
  }
function limpiarDatosPaciente() {
  datosPaciente.innerHTML = '';
}

function bloquearDocumento() {
  inputDocumento.disabled   = true;
  btnBuscarPaciente.textContent = "Nueva búsqueda";
}

