import { mostrarMensaje, escapeHTML } from './utils.js';

let enBusqueda = false;
let unidadesOriginales = [];
let unidadesFiltradas = [];
let paginaActualUnidades = 1;

document.addEventListener('DOMContentLoaded', () => {
  
  const tablaUnidades = document.getElementById('tablaUnidades');
  const tablaAlas = document.getElementById('tablaAlas');
  const tablaHabitaciones = document.getElementById('tablaHabitaciones');

  const filtroUnidad = document.getElementById('filtroUnidad');
  const filtroAla = document.getElementById('filtroAla');
  const btnBuscar = document.getElementById('btnBuscarHabitaciones');

  const elementosPorPagina = 5;


  const inputBusquedaUnidades = document.getElementById('busquedaUnidades');
  const paginacionUnidades = document.getElementById('paginacionUnidades');

  inputBusquedaUnidades.addEventListener('input', () => {
    const filtro = inputBusquedaUnidades.value.toLowerCase();
    unidadesFiltradas = unidadesOriginales.filter(u => u.denominacion.toLowerCase().includes(filtro));
    paginaActualUnidades = 1;
    renderTablaUnidades();
  });

    document.getElementById('btnAgregarUnidad').addEventListener('click', async () => {
    const { value: denominacion } = await Swal.fire({
      title: 'Nueva Unidad',
      input: 'text',
      inputLabel: 'Denominación',
      inputPlaceholder: 'Ej: Terapia Intensiva',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
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

    if (denominacion) {
      try {
        const res = await fetch('/api/infraunidades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ denominacion })
        });
        const data = await res.json();

        if (data.success) {
          Swal.fire('Éxito', 'Unidad registrada', 'success');
          cargarUnidades();
        } else {
          Swal.fire('Error', data.error || 'Error al registrar unidad', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Error de conexión', 'error');
      }
    }
  });

  document.getElementById('btnAgregarAla').addEventListener('click', async () => {
    const { value: denominacion } = await Swal.fire({
      title: 'Nueva Ala',
      input: 'text',
      inputLabel: 'Denominación',
      inputPlaceholder: 'Ej: Ala Norte',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
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

    if (denominacion) {
      try {
        const res = await fetch('/api/infraalas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ denominacion })
        });
        const data = await res.json();

        if (data.success) {
          Swal.fire('Éxito', 'Ala registrada', 'success');
          cargarAlas();
        } else {
          Swal.fire('Error', data.error || 'Error al registrar ala', 'error');
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Error de conexión', 'error');
      }
    }
  });


  btnBuscar.addEventListener('click', async () => {
    const unidad = filtroUnidad.value;
    const ala = filtroAla.value;

    if (!unidad || !ala) {
      mostrarMensaje('#mensajes', 'Debe seleccionar una Unidad y un Ala (o "Todas") antes de buscar.', 0);
      return;
    }

    try {
      const response = await fetch(`/api/infrahabitaciones/buscar?unidad=${encodeURIComponent(unidad)}&ala=${encodeURIComponent(ala)}`);

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      const habitaciones = await response.json();

      tablaHabitaciones.innerHTML = '';

      if (habitaciones.length === 0) {
        tablaHabitaciones.innerHTML = `
          <tr>
            <td colspan="4" class="text-center">No se encontraron habitaciones para los filtros seleccionados.</td>
          </tr>`;
        return;
      }

      habitaciones.forEach(habitacion => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
          <td>${escapeHTML(habitacion.nombrehabitacion)}</td>
          <td>${escapeHTML(habitacion.nombreunidad || '—')}</td>
          <td>${escapeHTML(habitacion.nombreala || '—')}</td>
          <td class="text-center" style="width: 120px;">
            <button class="btn btn-sm btn-warning me-1 btn-editar" data-id="${habitacion.idhabitacion}" data-tipo="habitacion">✏️</button>
            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${habitacion.idhabitacion}" data-tipo="habitacion">🗑️</button>
            <button class="btn btn-sm btn-info btn-camas me-1" data-id="${habitacion.idhabitacion}" data-tipo="habitacion">🛏️</button>
          </td>
        `;
        tablaHabitaciones.appendChild(fila);
      });

      const filaTotal = document.createElement('tr');
      filaTotal.innerHTML = `
        <td colspan="4" class="text-center fw-bold" style="background-color: #000; color: #fff;">
          Total de habitaciones: ${habitaciones.length}
        </td>
      `;
      tablaHabitaciones.appendChild(filaTotal);

    } catch (error) {
      console.error(error);
      mostrarMensaje('#mensajes', 'Ocurrió un error al buscar habitaciones. Intente nuevamente.', 0);
    }
  });

  document.getElementById('btnAgregarHabitacion').addEventListener('click', async () => {
      try {
          const unidadesRes = await fetch('/api/infraunidades');
          const unidadesData = await unidadesRes.json();
          const alasRes = await fetch('/api/infraalas');
          const alasData = await alasRes.json();
          const selectUnidades = document.createElement('select');
          selectUnidades.className = 'swal2-input';
          const optionDefaultUnidad = document.createElement('option');
          optionDefaultUnidad.value = '';
          optionDefaultUnidad.textContent = 'Seleccione una unidad';

          selectUnidades.appendChild(optionDefaultUnidad);

          unidadesData.unidades.forEach(u => {
              const option = document.createElement('option');
              option.value = u.idunidad;
              option.textContent = u.denominacion;
              selectUnidades.appendChild(option);
          });

          const selectAlas = document.createElement('select');
          selectAlas.className = 'swal2-input';
          const optionDefaultAla = document.createElement('option');
          optionDefaultAla.value = '';
          optionDefaultAla.textContent = 'Seleccione un ala';
          selectAlas.appendChild(optionDefaultAla);

          alasData.alas.forEach(a => {
              const option = document.createElement('option');
              option.value = a.idala;
              option.textContent = a.denominacion;
              selectAlas.appendChild(option);
          });

          const inputNombre = document.createElement('input');
          inputNombre.className = 'swal2-input';
          inputNombre.placeholder = 'Nombre de habitación';
          inputNombre.style.textAlign = 'center';
          inputNombre.style.textTransform = 'uppercase';

          const { value: confirm } = await Swal.fire({
              title: 'Nueva Habitación',
              html: `
                  <label>Unidad</label><br/>
              `,
              didOpen: () => {
                  const container = Swal.getHtmlContainer();
                  container.appendChild(selectUnidades);
                  container.appendChild(document.createElement('br'));
                  container.appendChild(document.createElement('br'));
                  container.appendChild(document.createTextNode('Ala'));
                  container.appendChild(document.createElement('br'));
                  container.appendChild(selectAlas);
                  container.appendChild(document.createElement('br'));
                  container.appendChild(document.createElement('br'));
                  container.appendChild(document.createTextNode('Nombre de habitación'));
                  container.appendChild(document.createElement('br'));
                  container.appendChild(inputNombre);
              },
              preConfirm: () => {
                  const nombreTrim = inputNombre.value.trim();
                  const unidadSel = selectUnidades.value;
                  const alaSel = selectAlas.value;

                  if (!nombreTrim) {
                      Swal.showValidationMessage('Debe ingresar un nombre de habitación');
                      return false;
                  }
                  if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/.test(nombreTrim)) {
                      Swal.showValidationMessage('Solo se permiten letras, números y espacios');
                      return false;
                  }
                  if (nombreTrim.length > 100) {
                      Swal.showValidationMessage('El nombre no debe superar los 100 caracteres');
                      return false;
                  }
                  if (!unidadSel || !alaSel) {
                      Swal.showValidationMessage('Debe seleccionar una unidad y un ala');
                      return false;
                  }

                  return {
                      idunidad: unidadSel,
                      idala: alaSel,
                      nombrehabitacion: nombreTrim
                  };
              },
              showCancelButton: true,
              confirmButtonText: 'Guardar'
          });

          if (confirm) {
              const res = await fetch('/api/infrahabitaciones', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(confirm)
              });
              const data = await res.json();

              if (data.success) {
                  Swal.fire('Éxito', 'Habitación registrada correctamente', 'success');
                  btnBuscar.click(); 
              } else {
                  Swal.fire('Error', data.error || 'Error al registrar habitación', 'error');
              }
          }
      } catch (error) {
          console.error(error);
          Swal.fire('Error', 'Error de conexión', 'error');
      }
  });

  async function cargarUnidades() {
      try {
          const res = await fetch('/api/infraunidades');
          const data = await res.json();
          
          unidadesOriginales = data.unidades || [];
          unidadesFiltradas = [...unidadesOriginales];
          
          filtroUnidad.innerHTML = '';
          const optionTodas = document.createElement('option');
          optionTodas.value = 'todas';
          optionTodas.textContent = 'Todas';
          filtroUnidad.appendChild(optionTodas);
          
          data.unidades.forEach(u => {
              const option = document.createElement('option');
              option.value = u.idunidad; 
              option.textContent = u.denominacion;  
              filtroUnidad.appendChild(option);
          });
          
          renderTablaUnidades();
      } catch (error) {
          console.error('Error al cargar unidades:', error);
      }
  }

  async function cargarAlas() {
    try {
      const res = await fetch('/api/infraalas');
      const data = await res.json();

      tablaAlas.innerHTML = '';

      filtroAla.innerHTML = '';
      const optionTodas = document.createElement('option');
      optionTodas.value = 'todas';
      optionTodas.textContent = 'Todas';
      filtroAla.appendChild(optionTodas);
      
      data.alas.forEach(a => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${a.denominacion}</td>
          <td class="text-center" style="width: 120px;">
            <button class="btn btn-sm btn-warning me-1 btn-editar" data-id="${a.idala}" data-tipo="ala">✏️</button>
            <button class="btn btn-sm btn-danger btn-eliminar" data-id="${a.idala}" data-tipo="ala">🗑️</button>
          </td>`;
        tablaAlas.appendChild(tr);

        const option = document.createElement('option');
        option.value = a.idala; 
        option.textContent = a.denominacion;  
        filtroAla.appendChild(option);

      });
    } catch (error) {
      console.error(error);
    }
  }

document.addEventListener('click', async (e) => {

    const editBtn = e.target.closest('.btn-editar');
    const deleteBtn = e.target.closest('.btn-eliminar');
    const camasBtn = e.target.closest('.btn-camas');

    if (editBtn) {
        const id = editBtn.dataset.id;
        const tipo = editBtn.dataset.tipo;

        let endpoint;
        let titulo;
        if (tipo === 'unidad') {
            endpoint = '/api/infraunidades/';
            titulo = 'Unidad';
        } else if (tipo === 'ala') {
            endpoint = '/api/infraalas/';
            titulo = 'Ala';
        } else if (tipo === 'habitacion') {
            endpoint = '/api/infrahabitaciones/';
            titulo = 'Habitación';
        } else {
            return;
        }

        try {
            const res = await fetch(endpoint + id);
            const data = await res.json();

            if (!data.success) {
                Swal.fire('Error', `No se pudo obtener la ${titulo}`, 'error');
                return;
            }

            if (tipo === 'habitacion') {

                const habitacion = data.habitacion;
                const unidadesRes = await fetch('/api/infraunidades');
                const unidadesData = await unidadesRes.json();
                const alasRes = await fetch('/api/infraalas');
                const alasData = await alasRes.json();

                const selectUnidades = document.createElement('select');
                selectUnidades.className = 'swal2-input';
                unidadesData.unidades.forEach(u => {
                    const option = document.createElement('option');
                    option.value = u.idunidad;
                    option.textContent = u.denominacion;
                    if (u.idunidad === habitacion.idunidad) option.selected = true;
                    selectUnidades.appendChild(option);
                });

                const selectAlas = document.createElement('select');
                selectAlas.className = 'swal2-input';
                alasData.alas.forEach(a => {
                    const option = document.createElement('option');
                    option.value = a.idala;
                    option.textContent = a.denominacion;
                    if (a.idala === habitacion.idala) option.selected = true;
                    selectAlas.appendChild(option);
                });

                const inputNombre = document.createElement('input');
                inputNombre.className = 'swal2-input';
                inputNombre.placeholder = 'Nombre de habitación';
                inputNombre.value = habitacion.nombrehabitacion || '';
                inputNombre.style.textAlign = 'center';
                inputNombre.style.textTransform = 'uppercase';

                const { value: confirm } = await Swal.fire({
                    title: `Editar ${titulo}`,
                    html: `<label>Unidad</label><br/>`,
                    didOpen: () => {
                        const container = Swal.getHtmlContainer();
                        container.appendChild(selectUnidades);
                        container.appendChild(document.createElement('br'));
                        container.appendChild(document.createElement('br'));
                        container.appendChild(document.createTextNode('Ala'));
                        container.appendChild(document.createElement('br'));
                        container.appendChild(selectAlas);
                        container.appendChild(document.createElement('br'));
                        container.appendChild(document.createElement('br'));
                        container.appendChild(document.createTextNode('Nombre de habitación'));
                        container.appendChild(document.createElement('br'));
                        container.appendChild(inputNombre);
                    },
                    preConfirm: () => {
                        const nombreTrim = inputNombre.value.trim().toUpperCase();
                        const unidadSel = selectUnidades.value;
                        const alaSel = selectAlas.value;

                        if (!nombreTrim) {
                            Swal.showValidationMessage('Debe ingresar un nombre de habitación');
                            return false;
                        }
                        if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/.test(nombreTrim)) {
                            Swal.showValidationMessage('Solo se permiten letras, números y espacios');
                            return false;
                        }
                        if (nombreTrim.length > 100) {
                            Swal.showValidationMessage('El nombre no debe superar los 100 caracteres');
                            return false;
                        }
                        if (!unidadSel || !alaSel) {
                            Swal.showValidationMessage('Debe seleccionar una unidad y un ala');
                            return false;
                        }

                        return {
                            idunidad: unidadSel,
                            idala: alaSel,
                            nombrehabitacion: nombreTrim
                        };
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Actualizar'
                });

                if (confirm) {
                    try {
                        const updateRes = await fetch(endpoint + id, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(confirm)
                        });
                        const updateData = await updateRes.json();

                        if (updateData.success) {
                            Swal.fire('Actualizado', 'Habitación actualizada correctamente', 'success');
                            btnBuscar.click();
                        } else {
                            Swal.fire('Error', updateData.error || 'Error al actualizar', 'error');
                        }
                    } catch (error) {
                        console.error(error);
                        Swal.fire('Error', 'Error de conexión', 'error');
                    }
                }
                return;
            }

            let denominacionActual = '';
            if (tipo === 'unidad') denominacionActual = data.unidad?.denominacion || '';
            if (tipo === 'ala') denominacionActual = data.ala?.denominacion || '';

            const { value: nuevaDenominacion } = await Swal.fire({
                title: `Editar ${titulo}`,
                input: 'text',
                inputLabel: 'Denominación',
                inputValue: denominacionActual,
                showCancelButton: true,
                confirmButtonText: 'Actualizar',
                inputAttributes: { autocomplete: 'off' },
                inputValidator: (value) => {
                    if (!value) return 'Debe ingresar una denominación';
                    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/.test(value)) return 'Solo se permiten letras, números y espacios';
                    if (value.length > 100) return 'La denominación no debe superar los 100 caracteres';
                }
            });

            if (nuevaDenominacion) {
                const body = { denominacion: nuevaDenominacion.toUpperCase() };

                const updateRes = await fetch(endpoint + id, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                const updateData = await updateRes.json();

                if (updateData.success) {
                    Swal.fire('Actualizado', `${titulo} actualizada correctamente`, 'success');
                    if (tipo === 'unidad') cargarUnidades();
                    else if (tipo === 'ala') cargarAlas();
                } else {
                    Swal.fire('Error', updateData.error || 'Error al actualizar', 'error');
                }
            }

        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexión', 'error');
        }
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        const tipo = deleteBtn.dataset.tipo;

        let endpoint;
        let titulo;
        if (tipo === 'unidad') {
            endpoint = '/api/infraunidades/';
            titulo = 'Unidad';
        } else if (tipo === 'ala') {
            endpoint = '/api/infraalas/';
            titulo = 'Ala';
        } else if (tipo === 'habitacion') {
            endpoint = '/api/infrahabitaciones/';
            titulo = 'Habitación';
        } else {
            return;
        }

        const confirm = await Swal.fire({
            title: `¿Eliminar ${titulo}?`,
            text: 'Esta acción no se puede deshacer',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (confirm.isConfirmed) {
            try {
                const deleteRes = await fetch(endpoint + id, { method: 'DELETE' });
                const deleteData = await deleteRes.json();

                if (deleteData.success) {
                    Swal.fire('Eliminado', `${titulo} eliminada correctamente`, 'success');
                    if (tipo === 'unidad') cargarUnidades();
                    else if (tipo === 'ala') cargarAlas();
                    else if (tipo === 'habitacion') btnBuscar.click();
                } else {
                    Swal.fire('Error', deleteData.error || 'Error al eliminar', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Error de conexión', 'error');
            }
        }
    }

    if (camasBtn) {
        const idhabitacion = camasBtn.dataset.id;
        try {
            const res = await fetch(`/api/infracamas/habitacion/${idhabitacion}`);
            const data = await res.json();

            if (!data.success) {
                Swal.fire('Error', 'No se pudieron obtener las camas de esta habitación', 'error');
                return;
            }

            const camas = data.camas;
            let html = `
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            camas.forEach(cama => {
                html += `
                    <tr>
                        <td>${cama.numerocama}</td>
                        <td>
                          <button class="btn btn-sm btn-warning me-1 btn-editar-cama" data-id="${cama.idcama}" data-nombre="${cama.numerocama}">✏️</button>
                          <button class="btn btn-sm btn-danger btn-eliminar-cama" data-id="${cama.idcama}">🗑️</button>
                        </td>
                    </tr>
                `;
            });
            html += `</tbody></table>`;

            await Swal.fire({
                title: 'Camas de la habitación',
                html: html + `<button id="btnAgregarCamaModal" class="btn btn-dark w-50 mt-2">Nueva</button>`,
                showConfirmButton: false,
                showCloseButton: true,
                width: '800px',
                didOpen: () => {
                    document.getElementById('btnAgregarCamaModal').addEventListener('click', async () => {
                        const { value: nombrecama } = await Swal.fire({
                            title: 'Nueva Cama',
                            input: 'text',
                            inputLabel: 'Nombre de la cama',
                            showCancelButton: true,
                            inputAttributes: {
                              autocomplete: 'off'
                            },
                            inputValidator: (value) => {
                                if (!value) return 'Debe ingresar un nombre';
                                if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/.test(value)) return 'Solo letras, números y espacios';
                                if (value.length > 100) return 'Máximo 100 caracteres';
                            }
                        });
                        if (nombrecama) {
                            const res = await fetch('/api/infracamas', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    idhabitacion,
                                    numerocama: nombrecama.trim().toUpperCase()
                                })
                            });
                            const result = await res.json();
                            if (result.success) {
                                camasBtn.click(); 
                            } else {
                                Swal.fire('Error', result.error || 'Error al crear la cama', 'error');
                            }
                        }
                    });

                    document.querySelectorAll('.btn-editar-cama').forEach(btn => {
                        btn.addEventListener('click', async () => {
                            const idcama = btn.dataset.id;
                            const nombreActual = btn.dataset.nombre;
                            const { value: nuevoNombre } = await Swal.fire({
                                title: 'Editar Cama',
                                input: 'text',
                                inputLabel: 'Nuevo nombre de la cama',
                                inputValue: nombreActual,
                                showCancelButton: true,
                                inputAttributes: {
                                  autocomplete: 'off'
                                },
                                inputValidator: (value) => {
                                    if (!value) return 'Debe ingresar un nombre';
                                    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]+$/.test(value)) return 'Solo letras, números y espacios';
                                    if (value.length > 100) return 'Máximo 100 caracteres';
                                }
                            });
                            if (nuevoNombre && nuevoNombre.trim() !== nombreActual) {
                                const res = await fetch(`/api/infracamas/${idcama}`, {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        numerocama: nuevoNombre.trim().toUpperCase()
                                    })
                                });
                                const result = await res.json();
                                if (result.success) {
                                    Swal.fire('Éxito', 'Cama actualizada correctamente', 'success');
                                    camasBtn.click();
                                } else {
                                    Swal.fire('Error', result.error || 'Error al actualizar la cama', 'error');
                                }
                            }
                        });
                    });

                    document.querySelectorAll('.btn-eliminar-cama').forEach(btn => {
                        btn.addEventListener('click', async () => {
                            const idcama = btn.dataset.id;
                            const confirm = await Swal.fire({
                                title: '¿Eliminar Cama?',
                                text: 'Esta acción no se puede deshacer',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonText: 'Sí, eliminar'
                            });
                            if (confirm.isConfirmed) {
                                const res = await fetch(`/api/infracamas/${idcama}`, { method: 'DELETE' });
                                const result = await res.json();
                                if (result.success) {
                                    camasBtn.click();
                                } else {
                                    Swal.fire('Error', result.error || 'Error al eliminar la cama', 'error');
                                }
                            }
                        });
                    });
                }
            });
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Error de conexión', 'error');
        }
    }

});

function renderTablaUnidades() {
  tablaUnidades.innerHTML = '';

  const inicio = (paginaActualUnidades - 1) * elementosPorPagina;
  const fin = inicio + elementosPorPagina;
  const unidadesPagina = unidadesFiltradas.slice(inicio, fin);

  unidadesPagina.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${u.denominacion}</td>
      <td class="text-center" style="width: 120px;">
        <button class="btn btn-sm btn-warning me-1 btn-editar" data-id="${u.idunidad}" data-tipo="unidad">✏️</button>
        <button class="btn btn-sm btn-danger btn-eliminar" data-id="${u.idunidad}" data-tipo="unidad">🗑️</button>
      </td>`;
    tablaUnidades.appendChild(tr);
  });

  renderPaginacionUnidades();
}

function renderPaginacionUnidades() {
  paginacionUnidades.innerHTML = '';
  const totalPaginas = Math.ceil(unidadesFiltradas.length / elementosPorPagina);

  for (let i = 1; i <= totalPaginas; i++) {
    const li = document.createElement('li');
    li.classList.add('page-item');
    if (i === paginaActualUnidades) li.classList.add('active');

    const btn = document.createElement('button');
    btn.classList.add('page-link');
    btn.textContent = i;
    btn.addEventListener('click', () => {
      paginaActualUnidades = i;
      renderTablaUnidades();
    });

    li.appendChild(btn);
    paginacionUnidades.appendChild(li);
  }
}


  cargarUnidades();
  cargarAlas();

});
