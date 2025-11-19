import { mostrarMensaje } from './utils.js';

const form = document.getElementById("formUsuario");
const selectRol = document.getElementById("idrol");
const selectActivo = document.getElementById("activo");
const inputBusqueda = document.getElementById("inputBusquedaUsuario");
const selectProfesional = document.getElementById("profesional");
const inputNombre = document.getElementById("nombre");
const inputUsuario = document.getElementById("usuario");
const inputPassword = document.getElementById("password");
const camposUsuario = document.getElementById("camposUsuario");
const cardTablaUsuarios = document.getElementById("cardTablaUsuarios");
const paginacion = document.getElementById("paginacionUsuarios");

let modoEdicion = false;
let idEditar = null;
let datosRoles = [];
let todosLosUsuarios = [];
let paginaActual = 1;
const cantidadPorPagina = 5;

document.addEventListener("DOMContentLoaded", () => {
    cargarRoles();

    $(selectProfesional).select2({
        placeholder: "Seleccione médico/enfermero",
        allowClear: true,
        width: '100%'
    });

    selectRol.addEventListener("change", async () => {
        
        limpiarCampos();
        const idrol = selectRol.value;
        const rolSeleccionado = selectRol.options[selectRol.selectedIndex].text;
        const tituloUsuarios = document.getElementById("tituloUsuarios");

        if (idrol) {
            camposUsuario.style.display = "block";
            cardTablaUsuarios.style.display = "block";
            await cargarUsuariosPorRol(idrol);
        } else {
            camposUsuario.style.display = "none";
            cardTablaUsuarios.style.display = "none";
        }

        if (idrol === "3" || idrol === "4") {
            selectProfesional.disabled = false;
            document.getElementById("contenedorProfesional").style.display = "block";
            $(selectProfesional).next(".select2-container").show();

            await cargarProfesionales(idrol);

            inputNombre.parentElement.style.display = "none"; 
        } else if (idrol === "1" || idrol === "2") {
            selectProfesional.disabled = true;
            document.getElementById("contenedorProfesional").style.display = "none";
            $(selectProfesional).next(".select2-container").hide();
            inputNombre.parentElement.style.display = ""; 
        } else {
            selectProfesional.disabled = true;
            selectProfesional.innerHTML = `<option value="">No aplica</option>`;
            inputNombre.parentElement.style.display = "";
        }

        if (selectRol.value) {
            tituloUsuarios.textContent = `Lista de Usuarios ${rolSeleccionado} Registrados`;
        } else {
            tituloUsuarios.textContent = `Lista de Usuarios Registrados`;
        }
    });

    selectProfesional.addEventListener("change", () => {
        const selectedOption = selectProfesional.options[selectProfesional.selectedIndex];
        if (selectedOption && selectedOption.dataset.nombre) {
            inputNombre.value = selectedOption.dataset.nombre; 
        } else {
            inputNombre.value = "";
        }
    });



    inputBusqueda.addEventListener("input", () => {
        paginaActual = 1;
        listarUsuariosPaginado();
    });

    document.getElementById("btnNuevo").addEventListener("click", () => {
        selectRol.value = "";
        camposUsuario.style.display = "none";
        cardTablaUsuarios.style.display = "none";
        limpiarCampos();
        paginaActual = 1;
    });

    form.addEventListener("submit", submitForm);
});

async function cargarRoles() {
    try {
        const res = await fetch("/api/roles");
        datosRoles = await res.json();
        selectRol.innerHTML = `<option value="">Seleccione un rol</option>`;
        datosRoles.forEach(rol => {
            const option = document.createElement("option");
            option.value = rol.idrol;
            option.textContent = rol.nombre;
            selectRol.appendChild(option);
        });
    } catch (err) {
        console.error("Error al cargar roles:", err);
    }
}

async function cargarProfesionales(idrol, matricula = "") {

    let url = idrol === "3" ? "/api/medicos/activos" : "/api/enfermeros/activos";

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
            selectProfesional.innerHTML = `<option value=""></option>`;
            const lista = idrol === "3" ? data.medicos : data.enfermeros;
            lista.forEach(p => {
                const option = document.createElement("option");
                option.value = idrol === "3" ? p.idmedico : p.idenfermero;
                option.textContent = `${p.apellidonombres} (${p.matricula})`;
                option.dataset.matricula = p.matricula;
                option.dataset.nombre = p.apellidonombres;
                selectProfesional.appendChild(option);
            });
        }
    } catch (err) {
        console.error("Error al cargar profesionales:", err);
    }
}
async function submitForm(e) {
    e.preventDefault();

    const usuario = inputUsuario.value.trim();
    const password = inputPassword.value;
    const idrol = selectRol.value;
    const activo = selectActivo.value === "true" ? 1 : 0;
    const esProfesionalSalud = idrol === "3" || idrol === "4";

    let matricula = null; 

    let nombre;

    if (esProfesionalSalud) {
        const selectedOption = selectProfesional.options[selectProfesional.selectedIndex];
        if (selectedOption && selectedOption.dataset.matricula && selectedOption.dataset.nombre) {
            matricula = selectedOption.dataset.matricula;
            nombre = selectedOption.dataset.nombre.toUpperCase(); 
        } else {
            mostrarMensaje('#mensajes', 'Debe seleccionar un profesional para asociar la matrícula.', 0);
            selectProfesional.focus();
            return;
        }
    } else {
        nombre = inputNombre.value.trim().toUpperCase(); 
    }

    if (!nombre && !esProfesionalSalud) {
        mostrarMensaje('#mensajes', 'Debe especificar el apellido y nombre del usuario.', 0);
        inputNombre.focus();
        return;
    }

    if (!usuario) {
        mostrarMensaje('#mensajes', 'Debe especificar un alias para el usuario.', 0);
        inputUsuario.focus();
        return;
    }
    if (!idrol) {
        mostrarMensaje('#mensajes', 'Debe especificar un rol para el usuario.', 0);
        selectRol.focus();
        return;
    }
    if (!password) {
        mostrarMensaje('#mensajes', 'Debe ingresar una contraseña para el usuario.', 0);
        inputPassword.focus();
        return;
    }


    const queryString = `/api/usuarios/verificar-alias?alias=${encodeURIComponent(usuario)}${modoEdicion ? `&idusuario=${idEditar}` : ''}`;
    const aliasResponse = await fetch(queryString);
    const aliasData = await aliasResponse.json();

    if (aliasData.existe) {
        mostrarMensaje("#mensajes", 'El alias ya existe. Elegí otro.', 0);
        inputUsuario.focus();
        return;
    }

    const accion = modoEdicion ? "modificar" : "registrar";
    const confirmButton = modoEdicion ? "Sí, modificar" : "Sí, registrar";

    const { isConfirmed } = await Swal.fire({
        title: `Confirmar ${accion}`,
        text: `¿Desea ${accion} al usuario "${nombre}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: confirmButton,
        cancelButtonText: "Cancelar"
    });
    if (!isConfirmed) return;

    const url = modoEdicion ? `/api/usuarios/${idEditar}` : "/api/usuarios";
    const metodo = modoEdicion ? "PUT" : "POST";
    console.log(nombre, usuario, password, idrol, matricula, activo);
    try {
        const res = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, usuario, password, idrol, matricula, activo })
        });
        const data = await res.json();
        if (data.success) {
            Swal.fire('Éxito', 'Usuario registrado correctamente.', 'success');
            const rolActual = selectRol.value;
            form.reset();
            selectRol.value = rolActual;
            selectRol.dispatchEvent(new Event('change'));
            modoEdicion = false;
            idEditar = null;
            listarUsuariosPaginado();
        } else {
            mostrarMensaje("#mensajes", data.error || "Ocurrió un error.", 0);
        }
    } catch (err) {
        console.error(err);
        mostrarMensaje("#mensajes", "Error de conexión.", 0);
    }
}

function limpiarCampos() {
    selectProfesional.value = "";
    $(selectProfesional).trigger('change');
    //inputMatricula.value = "";
    inputNombre.value = "";
    inputUsuario.value = "";
    inputPassword.value = "";
}
function actualizarColumnaMatricula() {
    const valorRol = parseInt(selectRol.value);
    const mostrar = (valorRol === 3 || valorRol === 4); // médico o enfermero

    const columnas = document.querySelectorAll(".col-matricula");
    columnas.forEach(col => {
        col.style.display = mostrar ? "" : "none";
    });
}


async function cargarUsuariosPorRol(idrol) {
  try {
    const response = await fetch(`/api/usuarios/por-rol/${idrol}`);
    if (!response.ok) throw new Error("Error al obtener usuarios");
    todosLosUsuarios = await response.json();
    paginaActual = 1;
    listarUsuariosPaginado(); 
  } catch (error) {
    console.error("Error:", error);
  }
}

function listarUsuariosPaginado() {
  if (!selectRol.value) {
    paginacion.innerHTML = "";
    return;
  }

  const search = inputBusqueda.value.trim().toLowerCase();
  const filtrados = todosLosUsuarios.filter(u =>
    u.nombre.toLowerCase().includes(search) ||
    u.usuario.toLowerCase().includes(search)
  );

  const total = filtrados.length;
  const inicio = (paginaActual - 1) * cantidadPorPagina;
  const paginados = filtrados.slice(inicio, inicio + cantidadPorPagina);

  tablaUsuarios.innerHTML = "";
  if (paginados.length === 0) {
    tablaUsuarios.innerHTML = `<tr><td colspan="6">No se encontraron resultados.</td></tr>`;
    paginacion.innerHTML = "";
    return;
  }

  paginados.forEach(u => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${u.idusuario}</td>
      <td>${u.nombre}</td>
      <td>${u.usuario}</td>
      <td>${u.rol?.nombre || "-"}</td>
      <td class="col-matricula">${u.matricula || "-"}</td>
      <td>${u.activo ? "Activo" : "Inactivo"}</td>
      <td>
        <button class="btn btn-sm btn-info me-1" onclick="editarUsuario(${u.idusuario})" title="Editar usuario">✏️</button>
        <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${u.idusuario})" title="Eliminar usuario">🗑️</button>
      </td>
    `;
    tablaUsuarios.appendChild(fila);
  });

  actualizarColumnaMatricula();
  generarPaginacion(total);
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
      listarUsuariosPaginado();
    });
    paginacion.appendChild(li);
  }
}
window.editarUsuario = async function (id) {
    try {
        const res = await fetch(`/api/usuarios/${id}`);
        
        const data = await res.json();

        if (data.success && data.usuario) {
            const usuario = data.usuario;

            document.getElementById("nombre").value = usuario.nombre;
            document.getElementById("usuario").value = usuario.usuario;
            document.getElementById("password").value = usuario.password;
            selectRol.value = usuario.idrol;
            selectActivo.value = String(usuario.activo);

            const idrol = usuario.idrol?.toString();
            if (idrol === "3" || idrol === "4") {
                selectProfesional.disabled = false;
                document.getElementById("contenedorProfesional").style.display = "block";
                $(selectProfesional).next(".select2-container").show();
                await cargarProfesionales(idrol);
                inputNombre.parentElement.style.display = "none";
            } else if (idrol === "1" || idrol === "2") {
                selectProfesional.disabled = true;
                document.getElementById("contenedorProfesional").style.display = "none";
                $(selectProfesional).next(".select2-container").hide();
                inputNombre.parentElement.style.display = "";
            } else {
                selectProfesional.disabled = true;
                selectProfesional.innerHTML = `<option value="">No aplica</option>`;
                inputNombre.parentElement.style.display = "";
            }

            if (idrol === "3" || idrol === "4") {
                const opciones = Array.from(selectProfesional.options);
                const opcionEncontrada = opciones.find(opt => opt.dataset.matricula === usuario.matricula);

                if (opcionEncontrada) {
                    $(selectProfesional).val(opcionEncontrada.value).trigger('change');
                } else {
                    $(selectProfesional).val("").trigger('change');
                    mostrarMensaje('#mensajes', `No se encontró al profesional con matrícula ${usuario.matricula} al cargar la edición.`, 0);
                    document.getElementById("nombre").value = usuario.nombre || "";
                }
            }

            modoEdicion = true;
            idEditar = id;

        } else {
            mostrarMensaje('#mensajes', 'No se encontró el usuario a editar.', 0);
        }
    } catch (err) {
        console.error("Error al editar usuario", err);
        mostrarMensaje('#mensajes', 'Error al obtener datos del usuario.', 0);
    }
};
window.eliminarUsuario = function (id) {
    const usuario = todosLosUsuarios.find(u => u.idusuario === id);
    const nombre = usuario?.nombre || "Usuario desconocido";

    Swal.fire({
        title: "¿Está seguro de Eliminar el Usuario?",
        html: `
            <div style="color: red; font-weight: bold; margin-bottom: 1rem;">
                No podrá deshacer esta operación.
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Usuario:</strong> ${nombre}<br>
            </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const rolActual = selectRol.value;
                const res = await fetch(`/api/usuarios/${id}`, { method: "DELETE" });
                const data = await res.json();

                if (data.success) {
                    Swal.fire('Éxito', 'Usuario eliminado correctamente.', 'success');
                    selectRol.value = rolActual;
                    selectRol.dispatchEvent(new Event('change'));
                } else {
                    mostrarMensaje("#mensajes", data.error || "No se pudo eliminar.", 0);
                }
            } catch (err) {
                console.error("Error al eliminar usuario", err);
                mostrarMensaje("#mensajes", "Error de conexión.", 0);
            }
        }
    });
};




