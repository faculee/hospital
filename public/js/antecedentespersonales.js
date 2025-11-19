import { buscarPaciente } from './buscarPaciente.js';
import { mostrarMensaje, formatearFecha, escapeHTML } from './utils.js';

const API_URL_TIPOSANTECEDENTES = '/api/tiposantecedentes';
const API_URL_ANTECEDENTESPERSONALES = '/api/pacientesantecedentes';

const btnBuscarPaciente = document.getElementById("btnBuscarPaciente");
const inputDocumento = document.getElementById("documento");
const datosPaciente = document.getElementById("datosPaciente");
const contenedorSeccion = document.getElementById("seccionAntecedentes");
const selectTipo = document.getElementById("selectTipoAntecedente");

let datosAntecedentes = [];  
let pacienteActual = null;

document.addEventListener("DOMContentLoaded", () => {
 
  cargarTiposAntecedentes();

  btnBuscarPaciente.addEventListener("click", async () => {
    if (btnBuscarPaciente.textContent === "Nueva búsqueda") {
      resetearBusqueda();
      contenedorSeccion.style.display = "none";
    } else {
      const dni = inputDocumento.value.trim();
      if (!dni || isNaN(dni)) return mostrarMensaje("#mensajes", "Ingrese un DNI válido", 0);

      const paciente = await buscarPaciente(
          dni,
          mostrarDatosPaciente,
          () => {},
          limpiarDatosPaciente,
          bloquearDocumento,
          btnBuscarPaciente,
          inputDocumento,
          null,
          () => {},
          false 
      );
      if (paciente) {
          if (paciente.estaFallecido) {
              contenedorSeccion.style.display = "none"; 
              return; 
          }
          pacienteActual = paciente;
          contenedorSeccion.style.display = "block";
          listarAntecedentes(paciente.idpaciente);
      }
    }
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
            <h3 class="fw-bold mb-1">${escapeHTML(paciente.apellidonombres)}</h3>
          </div>
          <div class="mb-1">
            <small class="text-muted" style="font-size: 0.75rem;">${escapeHTML(sexoTexto)}</small>
          </div>
          <div>
            <span style="font-size: 1rem;" class="text-secondary">${escapeHTML(edadTexto)}</span>
          </div>
          <div>
            <span style="font-size: 1rem;" class="text-secondary">${escapeHTML(paciente.cobertura.denominacion)}</span>
          </div>
        </div>
      </div>`;
  }

  document.getElementById("formAntecedente").addEventListener("submit", async e => {
    e.preventDefault();

    const idtipo = selectTipo.value;
    const notas = document.getElementById("notasdeltipo").value.trim().toUpperCase();

    if (!idtipo) return mostrarMensaje("#mensajes", "Seleccione el tipo de antecedente", 0);

    const tipoTexto = selectTipo.options[selectTipo.selectedIndex]?.textContent || '';
    const notasTexto = notas || '-';

    const confirmacion = await Swal.fire({
      title: 'Confirmar Registro de Antecedente',
      html: `
        <div style="color: red; font-weight: bold; margin-bottom: 1rem;">
          Va a ingresar un nuevo antecedente personal.<br>
          Este registro no podrá ser modificado ni eliminado.
        </div>
        <div style="margin-bottom: 1rem;">
          <strong>Tipo de Antecedente:</strong> ${escapeHTML(tipoTexto)}<br>
          <strong>Notas/Detalle:</strong> ${escapeHTML(notasTexto)}
        </div>
        <strong>¿Está seguro de registrar este antecedente?</strong>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, registrar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const res = await fetch("/api/pacientesantecedentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idpaciente: pacienteActual.idpaciente,
          idtipoantecedente: idtipo,
          notasdeltipo: notas
        })
      });

      const data = await res.json();

      if (data.success) {
        await Swal.fire('Éxito', 'Antecedente registrado correctamente.', 'success');
        listarAntecedentes(pacienteActual.idpaciente);
        e.target.reset();
      } else {
        Swal.fire('Error', data.error || 'Error al registrar el antecedente.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
    }
  });

});

async function cargarTiposAntecedentes() {
   try {
        const response = await fetch(API_URL_TIPOSANTECEDENTES);
        if (!response.ok) throw new Error("Error al cargar los tipos de antecedentes");
        datosAntecedentes = await response.json();
        datosAntecedentes.forEach(item => {
            const option = document.createElement('option');
            option.value = item.idtipoantecedente;
            option.textContent = item.denominacionantecedente;
            selectTipo.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar tipos de antecedentes:", error);
    }
}

async function listarAntecedentes(idpaciente) {
  try {
    const res = await fetch(`${API_URL_ANTECEDENTESPERSONALES}/${idpaciente}`);
    const { success, antecedentes } = await res.json();
    const tbody = document.getElementById('tablaAntecedentes');
    
    tbody.innerHTML = '';
    
    if (success && antecedentes.length) {
      tbody.innerHTML += antecedentes.map(a => `
        <tr data-idpaciente="${idpaciente}">
          <td class="text-center">${escapeHTML(formatearFecha(a.createdAt))}</td>
          <td>${escapeHTML(a.medico?.apellidonombres || '')}</td>
          <td>${escapeHTML(a.tipoantecedente?.denominacionantecedente || '')}</td>
          <td>${escapeHTML(a.notasdeltipo || '')}</td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Error al listar antecedentes personales:', err);
  }
}


function resetearBusqueda() {
  inputDocumento.value = "";
  inputDocumento.disabled = false;
  btnBuscarPaciente.textContent = "Buscar";
  limpiarDatosPaciente();
  contenedorSeccion.style.display = "none";
}

function limpiarDatosPaciente() {
  datosPaciente.innerHTML = '';
}

function bloquearDocumento() {
  inputDocumento.disabled = true;
  btnBuscarPaciente.textContent = "Nueva búsqueda";
}
