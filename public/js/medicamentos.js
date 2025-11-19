import { mostrarMensaje } from './utils.js';

const form = document.getElementById("formMedicamento");
const btnGuardar = document.getElementById("btnGuardar");
const tablaMedicamentos = document.getElementById("tablaMedicamentos");
const selectClasificacion = document.getElementById("idclasificacionterapeutica");
//const mensajes = document.getElementById("mensajes");

const inputBusqueda = document.getElementById("busquedaMedicamento");
const paginacion = document.getElementById("paginacionMedicamentos");

let modoEdicion = false;
let idEditar = null;
let datosClasificaciones = [];

let paginaActual = 1;
const cantidadPorPagina = 5;

document.addEventListener("DOMContentLoaded", () => {
  cargarClasificaciones();
  listarMedicamentosPaginado();
});

inputBusqueda.addEventListener("input", () => {
  paginaActual = 1;
  listarMedicamentosPaginado();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombremedicamento = document.getElementById("nombremedicamento").value.trim().toUpperCase();
  const presentacion = document.getElementById("presentacion").value.trim();
  const idclasificacionterapeutica = selectClasificacion.value;

  if (!nombremedicamento || !idclasificacionterapeutica || !presentacion) {
    mostrarMensaje('#mensajes', 'Complete los campos obligatorios.', 0);
    return;
  }

  const url = modoEdicion
    ? `/api/medicamentos/${idEditar}`
    : "/api/medicamentos";

  const metodo = modoEdicion ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombremedicamento,
        presentacion,
        idclasificacionterapeutica
      }),
    });

    const data = await res.json();

    if (data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: data.message || "Guardado correctamente",
        timer: 2000,
        showConfirmButton: false
      });
      form.reset();
      modoEdicion = false;
      idEditar = null;
      listarMedicamentosPaginado();
    } else {
      mostrarMensaje('#mensajes', data.message || "Ocurrió un error al guardar.", 0);
    }
  } catch (err) {
    console.error(err);
    mostrarMensaje('#mensajes', "Error de conexión al guardar.", 0);
  }
});


async function cargarClasificaciones() {
  try {
    const response = await fetch("/api/clasificaciones");
    if (!response.ok) throw new Error("Error al cargar las clasificaciones terapéuticas");

    datosClasificaciones = await response.json();

    selectClasificacion.innerHTML = '<option value="">Seleccione una clasificación</option>';

    datosClasificaciones.forEach(item => {
      const option = document.createElement('option');
      option.value = item.idclasificacionterapeutica;
      option.textContent = item.denominacion;
      selectClasificacion.appendChild(option);
    });

  } catch (error) {
    console.error("Error al cargar clasificaciones:", error);
    mostrarMensaje('#mensajes', 'Error al cargar clasificaciones.', 0);
  }
}

async function listarMedicamentosPaginado() {
  try {
    const search = inputBusqueda.value.trim();
    const start = (paginaActual - 1) * cantidadPorPagina;

    const res = await fetch(`/api/medicamentos/paginado?start=${start}&length=${cantidadPorPagina}&search=${encodeURIComponent(search)}`);
    const data = await res.json();

    tablaMedicamentos.innerHTML = "";

    if (!data.data || data.data.length === 0) {
      tablaMedicamentos.innerHTML = `<tr><td colspan="5">No se encontraron resultados.</td></tr>`;
      paginacion.innerHTML = "";
      return;
    }

    data.data.forEach(med => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${med.idmedicamento}</td>
        <td>${med.nombremedicamento}</td>
        <td>${med.presentacion || "-"}</td>
        <td>${med.clasificacionTerapeutica?.denominacion || "-"}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editarMedicamento(${med.idmedicamento})">✏️</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarMedicamento(${med.idmedicamento})">🗑️</button>
        </td>
      `;
      tablaMedicamentos.appendChild(tr);
    });

    generarPaginacion(data.recordsTotal);
  } catch (err) {
    console.error("Error al listar medicamentos:", err);
    mostrarMensaje('#mensajes', 'Error al listar medicamentos.', 0);
  }
}

function generarPaginacion(totalRegistros) {
  const totalPaginas = Math.ceil(totalRegistros / cantidadPorPagina);
  paginacion.innerHTML = "";

  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement("li");
    li.className = `page-item ${i === paginaActual ? "active" : ""}`;
    li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    li.addEventListener("click", (e) => {
      e.preventDefault();
      paginaActual = i;
      listarMedicamentosPaginado();
    });
    paginacion.appendChild(li);
  }
}

document.getElementById("btnNuevo").addEventListener("click", () => {
  form.reset();
  idEditar = null;
  modoEdicion = false;
  btnGuardar.textContent = "Guardar medicamento";
  document.getElementById("nombremedicamento").focus();
});

window.editarMedicamento = async function (id) {
  try {
    const res = await fetch(`/api/medicamentos/${id}`);
    const data = await res.json();

    if (data.success && data.medicamento) {
      document.getElementById("nombremedicamento").value = data.medicamento.nombremedicamento;
      document.getElementById("presentacion").value = data.medicamento.presentacion || "";
      selectClasificacion.value = data.medicamento.idclasificacionterapeutica;

      modoEdicion = true;
      idEditar = id;
      btnGuardar.textContent = "Actualizar medicamento";
    } else {
      mostrarMensaje('#mensajes', 'No se encontró el medicamento.', 0);
    }
  } catch (err) {
    console.error("Error al obtener medicamento", err);
    mostrarMensaje('#mensajes', 'Error al cargar medicamento.', 0);
  }
};

window.eliminarMedicamento = function (id) {
  Swal.fire({
    title: "¿Está seguro?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar"
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/medicamentos/${id}`, { method: "DELETE" });
        const data = await res.json();

        if (data.success) {
          mostrarMensaje('#mensajes', "Eliminado correctamente", 1);
          listarMedicamentosPaginado();
        } else {
          mostrarMensaje('#mensajes', data.message || "No se pudo eliminar.", 0);
        }
      } catch (err) {
        console.error("Error al eliminar", err);
        mostrarMensaje('#mensajes', "Error de conexión.", 0);
      }
    }
  });
};
