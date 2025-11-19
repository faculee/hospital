document.addEventListener('DOMContentLoaded', () => {
  const tabla = document.getElementById("tablaCoberturas");
  const inputBusqueda = document.getElementById("busquedaCobertura");
  const paginacion = document.getElementById("paginacionCoberturas");

  let paginaActual = 1;
  const cantidadPorPagina = 10;


  inputBusqueda.addEventListener("input", () => {
    paginaActual = 1;
    cargarCoberturas();
  });
 
document.getElementById("btnNuevo").addEventListener("click", async () => {
  const { value: denominacion } = await Swal.fire({
    title: 'Nueva Cobertura',
    input: 'text',
    inputLabel: 'Denominación',
    inputPlaceholder: 'Ej: OSDE',
    inputAttributes: {
      autocomplete: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    inputValidator: (value) => {
      if (!value) {
        return 'Debe ingresar una denominación';
      }
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(value)) {
        return 'Solo se permiten letras y espacios';
      }
      if (value.length > 100) {
        return 'La denominación no debe superar los 100 caracteres';
      }
    }
  });

  if (denominacion) {
    try {
      const res = await fetch("/api/coberturas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ denominacion: denominacion.toUpperCase() })
      });

      const data = await res.json();
      if (data.success) {
        Swal.fire('Éxito', 'Cobertura registrada', 'success');
        cargarCoberturas();
      } else {
        Swal.fire('Error', data.error || 'Error al guardar', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error de conexión', 'error');
    }
  }
});

  async function cargarCoberturas() {
    try {
      const search = inputBusqueda.value.trim();
      const start = (paginaActual - 1) * cantidadPorPagina;

      const res = await fetch(`/api/coberturas/paginado?start=${start}&length=${cantidadPorPagina}&search=${encodeURIComponent(search)}`);
      const data = await res.json();

      if (!data.data || data.data.length === 0) {
        tabla.innerHTML = `<tr><td colspan="3">No se encontraron resultados.</td></tr>`;
        paginacion.innerHTML = '';
        return;
      }

      tabla.innerHTML = "";
      data.data.forEach(c => {
        const tr = document.createElement("tr");
        tr.dataset.id = c.idcobertura;
        tr.innerHTML = `
          <td>${c.denominacion}</td>
          <td>
            <button class="btn btn-sm btn-warning me-1" data-id="${c.idcobertura}" data-denominacion="${c.denominacion}" onclick="editarCobertura(this)">✏️</button>
            <button class="btn btn-sm btn-danger" data-id="${c.idcobertura}" onclick="eliminarCobertura(this)">🗑️</button>
          </td>`;
        tabla.appendChild(tr);
      });

      renderPaginacion(data.recordsTotal);
    } catch (err) {
      console.error("Error al cargar coberturas", err);
      Swal.fire('Error', 'Error al cargar los datos', 'error');
    }
  }


  function renderPaginacion(totalRegistros) {
    paginacion.innerHTML = '';
    const totalPaginas = Math.ceil(totalRegistros / cantidadPorPagina);

    for (let i = 1; i <= totalPaginas; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === paginaActual ? "active" : ""}`;
      const a = document.createElement("a");
      a.className = "page-link";
      a.href = "#";
      a.textContent = i;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        paginaActual = i;
        cargarCoberturas(); 
      });

      li.appendChild(a);
      paginacion.appendChild(li);
    }
  }

  window.editarCobertura = async function (btn) {
    const id = btn.dataset.id;
    const actual = btn.dataset.denominacion;

    const { value: nuevaDenominacion } = await Swal.fire({
      title: 'Editar Cobertura',
      input: 'text',
      inputLabel: 'Denominación',
      inputValue: actual,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      inputAttributes: {
        autocomplete: 'off'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Debe ingresar una denominación';
        }
        if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/.test(value)) {
          return 'Solo se permiten letras y espacios';
        }
        if (value.length > 100) {
          return 'La denominación no debe superar los 100 caracteres';
        }
      }

    });

    if (nuevaDenominacion) {
      try {
        const res = await fetch(`/api/coberturas/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ denominacion: nuevaDenominacion.toUpperCase() })
        });
        const data = await res.json();

      if (data.success) {
        Swal.fire('Actualizado', 'Cobertura actualizada correctamente', 'success');
        cargarCoberturas();
      } else {
        Swal.fire('Error', data.error || 'No se pudo actualizar', 'error');
      }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Error de conexión', 'error');
      }
    }
  };

  window.eliminarCobertura = function (btn) {
    const id = btn.dataset.id;

    Swal.fire({
      title: "¿Eliminar cobertura?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`/api/coberturas/${id}`, { method: "DELETE" });
          const data = await res.json();

          if (data.success) {
            Swal.fire('Eliminado', 'Cobertura eliminada', 'success');
            cargarCoberturas();
          } else {
            Swal.fire('Error', data.message || 'No se pudo eliminar', 'error');
          }
        } catch (err) {
          console.error("Error al eliminar", err);
          Swal.fire('Error', 'Error de conexión', 'error');
        }
      }
    });
  };

  cargarCoberturas();
});
