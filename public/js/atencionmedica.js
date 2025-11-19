
import { buscarPaciente } from './buscarPaciente.js';
import { mostrarMensaje, formatearFecha } from './utils.js';

const API_URL_ESTUDIOS = '/api/estudios';
const API_URL_DIAGNOSTICOS = '/api/diagnosticos';
const API_URL_MEDICAMENTOS = '/api/medicamentos';
const API_URL_TIPOSCIRUGIAS = '/api/tiposcirugias';
const API_URL_TIPOSANESTESIAS = '/api/tiposanestesias';
const API_URL_TIPOSTERAPIAS = '/api/tiposterapias';
const API_URL_TIPOSALTAS = '/api/tiposaltas';

const API_URL_EVALUACIONMEDICA = '/api/atencionmedica/evaluacionesm';

let datosEstudios = [];
let datosDiagnosticos = [];
let datosMedicamentos = [];
let datosCirugias = [];
let datosAnestesias = [];
let datosTerapias = [];
let datosAltas =[];

let idInternacionRecuperada = 0;

document.addEventListener("DOMContentLoaded", async () => {


    const inputDocumento = document.getElementById("documento");
    const btnBuscarPaciente = document.getElementById("btnBuscarPaciente");
    const datosPaciente = document.getElementById("datosPaciente");
    const datosInternacion = document.getElementById("datosInternacion");
       
    const selectTipoAlta = document.getElementById('tipoAltaPaciente');
    const contenedorActa = document.getElementById('contenedorActaDefuncion');
    const formAlta = document.getElementById('formAltaPaciente');
    const inputActa = document.getElementById('actaDefuncion');
    const inputIndicaciones = document.getElementById('indicacionesAlta');

    await cargarDiagnosticos();
    await cargarMedicamentos();
    await cargarEstudios();
    await cargarCirugias();
    await cargarTiposAnestesias();
    await cargarTiposTerapias();
    await cargarTiposAltas();


    btnBuscarPaciente.addEventListener("click", () => {
                
        if (btnBuscarPaciente.textContent === "Nueva búsqueda") {
            resetearBusqueda();
            contenedorAtencionMedica.style.display = 'none';
        } else {

            const dni = inputDocumento.value.trim();
            if (!dni || isNaN(dni)) {
                mostrarMensaje('#mensajes', 'Ingrese un número de documento válido', 0);
                return;
            }
            buscarPaciente(
                dni,
                mostrarDatosPaciente,
                mostrarAdmision,
                limpiarDatosPaciente,
                bloqueardocumento,
                btnBuscarPaciente,
                inputDocumento,
                datosInternacion,
                manejarSinInternacionActiva 
            );
        }
    });
    function manejarSinInternacionActiva() {

        document.getElementById('contenedorAtencionMedica').style.display = 'none';
        Swal.fire({
            title: 'Sin internación activa',
            html: `<p>El paciente no tiene una internación activa en curso.</p>
                <p>No puede registrar intervenciones.</p>`,
            icon: 'info',
            confirmButtonText: 'Entendido'
        });

        datosInternacion.style.display = 'none'; 
        inputDocumento.disabled = false;
        btnBuscarPaciente.textContent = "Nueva búsqueda";
        contenedorAtencionMedica.style.display = 'none'; 

    }
 
    document.getElementById('btnRegistrarEvaluacion').addEventListener('click', async (e) => {

        e.preventDefault();



        const iddiagnostico = document.getElementById('diagnosticoEvaluacion')?.value;
        const observaciones = document.getElementById('observacionesEvaluacion')?.value;

        if (!iddiagnostico) {
            mostrarMensaje('#mensajesSeccion', 'Debe seleccionar un diagnostico de la lista', 0);
            diagnosticoEvaluacion.focus();
            return;
        }

        if (!idInternacionRecuperada) {
            mostrarMensaje('#mensajesSeccion', 'Falta información clave en la ficha (internación)', 0);
            return;
        }

        const confirmacion = await Swal.fire({
            title: 'Confirmar Registro de Evaluación Médica',
            html: `
            <div style="color: red; font-weight: bold; margin-bottom: 1rem;">
                Va a ingresar una nueva Evaluación Médica.<br>
                Este registro no podrá ser modificado, ni eliminado.
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Diagnóstico:</strong> ${diagnosticoEvaluacion.options[diagnosticoEvaluacion.selectedIndex].text}<br>
                <strong>Observación:</strong> ${observaciones || '-'}
            </div>
            <strong>¿Está seguro de ingresar el registro?</strong>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true, 
            focusCancel: true     
        });

        if (!confirmacion.isConfirmed) {
            return;
        }

        try {
            const res = await fetch(API_URL_EVALUACIONMEDICA, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idinternacion: idInternacionRecuperada, 
                fechaevaluacion: new Date().toISOString().split('T')[0],
                iddiagnostico,
                observacionesem: observaciones ? observaciones.toUpperCase() : ''
            })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();
            
            if (data.success) {
                Swal.fire('Éxito', 'Evaluación médica registrada correctamente.', 'success');
                document.getElementById('diagnosticoEvaluacion').value = '';
                document.getElementById('observacionesEvaluacion').value = '';
                await cargarTablaEvaluaciones(idInternacionRecuperada);
            } else {
                Swal.fire('Error', data.message || 'No se pudo registrar la Evaluación Médica.', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
        }
    });


    document.getElementById('btnRegistrarPrescripcion').addEventListener('click', async (e) => {

        e.preventDefault();

        const idmedicamento = document.getElementById('medicamentoPrescripcion')?.value;
        const cantidad = document.getElementById('cantidadPrescripcion')?.value;
        const observaciones = document.getElementById('observacionesPrescripcion')?.value;

        if (!idmedicamento) {
            mostrarMensaje('#mensajesSeccion', 'Debe seleccionar un medicamento de la lista', 0);
            medicamentoPrescripcion.focus();
            return;
        }

        const cantidadNum = parseInt(cantidad);
        if (isNaN(cantidadNum) || cantidadNum <= 0) {
            mostrarMensaje('#mensajesSeccion', 'La cantidad debe ser un número mayor a 0', 0);
            cantidadPrescripcion.focus();
            return;
        }

        if (!idInternacionRecuperada) {
            mostrarMensaje('#mensajesSeccion', 'Falta información clave en la ficha (internación)', 0);
            return;
        }

        const confirmacion = await Swal.fire({
            title: 'Confirmar Medicamento',
            html: `
            <div style="color: red; font-weight: bold; margin-bottom: 1rem;">
                Va a ingresar registro de medicación.<br>
                Este registro no podrá ser modificado, ni eliminado.
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Medicamento:</strong> ${medicamentoPrescripcion.options[medicamentoPrescripcion.selectedIndex].text}<br>
                <strong>Cantidad:</strong> ${cantidadNum}<br>
                <strong>Observación:</strong> ${observaciones || '-'}
            </div>
            <strong>¿Está seguro de ingresar el registro?</strong>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true, 
            focusCancel: true     
        });

        if (!confirmacion.isConfirmed) {
            return;
        }

        try {
            const res = await fetch('/api/atencionmedica/medicamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idinternacion: idInternacionRecuperada, 
                fechaprescripcion: new Date().toISOString().split('T')[0],
                idmedicamento,
                cantidad: cantidadNum,
                observacionesme: observaciones ? observaciones.toUpperCase() : ''
            })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();

            if (data.success) {
                Swal.fire('Éxito', 'Prescripción registrada correctamente.', 'success');
                document.getElementById('medicamentoPrescripcion').value = '';
                document.getElementById('cantidadPrescripcion').value = '';
                document.getElementById('observacionesPrescripcion').value = '';
                await cargarTablaMedicamentos(idInternacionRecuperada);
            } else {
                Swal.fire('Error', data.message || 'No se pudo registrar la prescripción.', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
        }
    });

    document.getElementById('btnRegistrarEstudio').addEventListener('click', async (e) => {

        e.preventDefault();

        const idestudio = document.getElementById('tipoEstudio')?.value;
        const observaciones = document.getElementById('observacionesEstudios')?.value;

        if (!idestudio) {
            mostrarMensaje('#mensajesSeccion', 'Debe seleccionar un estudio de la lista', 0);
            tipoEstudio.focus();
            return;
        }

        if (!idInternacionRecuperada) {
            mostrarMensaje('#mensajesSeccion', 'Falta información clave en la ficha (internación)', 0);
            return;
        }

        const confirmacion = await Swal.fire({
            title: 'Confirmar Registro de Estudio',
            html: `
            <div style="color: red; font-weight: bold; margin-bottom: 1rem;">
                Va a ingresar un registro de estudio / análisis.<br>
                Este registro no podrá ser modificado, ni eliminado.
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Estudio:</strong> ${tipoEstudio.options[tipoEstudio.selectedIndex].text}<br>
                <strong>Observación:</strong> ${observaciones || '-'}
            </div>
            <strong>¿Está seguro de ingresar el registro?</strong>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true, 
            focusCancel: true     
        });

        if (!confirmacion.isConfirmed) {
            return;
        }

        try {
            const res = await fetch('/api/atencionmedica/estudios', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idinternacion: idInternacionRecuperada, 
                fechaestudio: new Date().toISOString().split('T')[0],
                idestudio,
                observacioneses: observaciones ? observaciones.toUpperCase() : ''
            })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();
            
            if (data.success) {
                Swal.fire('Éxito', 'Estudio/Análisis registrado correctamente.', 'success');
                document.getElementById('tipoEstudio').value = '';
                document.getElementById('observacionesEstudios').value = '';
                await cargarTablaEstudios(idInternacionRecuperada);
            } else {
                Swal.fire('Error', data.message || 'No se pudo registrar el estudio.', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
        }
    });
 
    document.getElementById('btnRegistrarCirugia').addEventListener('click', async (e) => {

        e.preventDefault();

        const idtipocirugia = document.getElementById('tipoCirugia')?.value;
        const idtipoanestesia = document.getElementById('tipoAnestesia')?.value;
        const observaciones = document.getElementById('observacionesCirugia')?.value;

        if (!idtipocirugia) {
            mostrarMensaje('#mensajesSeccion', 'Debe seleccionar un tipo de cirugia de la lista', 0);
            tipoCirugia.focus();
            return;
        }

        if (!idtipoanestesia) {
            mostrarMensaje('#mensajesSeccion', 'Debe seleccionar un tipo de anestesia de la lista', 0);
            tipoAnestesia.focus();
            return;
        }
        if (!idInternacionRecuperada) {
            mostrarMensaje('#mensajesSeccion', 'Falta información clave en la ficha (internación)', 0);
            return;
        }

        const confirmacion = await Swal.fire({
            title: 'Confirmar Cirugia',
            html: `
            <div style="color: red; font-weight: bold; margin-bottom: 1rem;">
                Va a ingresar una práctica quirúrgica.<br>
                Este registro no podrá ser modificado, ni eliminado.
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Cirugía:</strong> ${tipoCirugia.options[tipoCirugia.selectedIndex].text}<br>
                <strong>Observación:</strong> ${observaciones || '-'}
            </div>
            <strong>¿Está seguro de ingresar el registro?</strong>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true, 
            focusCancel: true     
        });

        if (!confirmacion.isConfirmed) {
            return;
        }

        try {
            const res = await fetch('/api/atencionmedica/cirugias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idinternacion: idInternacionRecuperada, 
                fechacirugia: new Date().toISOString().split('T')[0],
                idtipocirugia,
                idtipoanestesia,
                observaciones: observaciones ? observaciones.toUpperCase() : ''
            })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();
            
            if (data.success) {
                Swal.fire('Éxito', 'Cirugia registrada correctamente.', 'success');
                document.getElementById('tipoCirugia').value = '';
                document.getElementById('tipoAnestesia').value = '';
                document.getElementById('observacionesCirugia').value = '';
                await cargarTablaCirugias(idInternacionRecuperada);
            } else {
                Swal.fire('Error', data.message || 'No se pudo registrar el estudio.', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
        }
    });

    document.getElementById('btnRegistrarTerapia').addEventListener('click', async (e) => {

        e.preventDefault();

        const idtipoterapia = document.getElementById('tipoTerapia')?.value;
        const observaciones = document.getElementById('observacionesTerapia')?.value;

        if (!idtipoterapia) {
            mostrarMensaje('#mensajesSeccion', 'Debe seleccionar una terapia de la lista', 0);
            tipoEstudio.focus();
            return;
        }

        if (!idInternacionRecuperada) {
            mostrarMensaje('#mensajesSeccion', 'Falta información clave en la ficha (internación)', 0);
            return;
        }

        const confirmacion = await Swal.fire({
            title: 'Confirmar Registro de Terapia',
            html: `
            <div style="color: red; font-weight: bold; margin-bottom: 1rem;">
                Va a ingresar un registro de terapia.<br>
                Este registro no podrá ser modificado, ni eliminado.
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Terapia:</strong> ${tipoTerapia.options[tipoTerapia.selectedIndex].text}<br>
                <strong>Observación:</strong> ${observaciones || '-'}
            </div>
            <strong>¿Está seguro de ingresar el registro?</strong>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, registrar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true, 
            focusCancel: true     
        });

        if (!confirmacion.isConfirmed) {
            return;
        }

        try {
            const res = await fetch('/api/atencionmedica/terapias', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idinternacion: idInternacionRecuperada, 
                fechaterapia: new Date().toISOString().split('T')[0],
                idtipoterapia,
                observaciones: observaciones ? observaciones.toUpperCase() : ''
            })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();
            
            if (data.success) {
                Swal.fire('Éxito', 'Terapia registrada correctamente.', 'success');
                document.getElementById('tipoTerapia').value = '';
                document.getElementById('observacionesTerapia').value = '';
                await cargarTablaTerapias(idInternacionRecuperada);
            } else {
                Swal.fire('Error', data.message || 'No se pudo registrar la terapia.', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
        }
    });

    selectTipoAlta.addEventListener('change', () => {
        const textoSeleccionado = selectTipoAlta.options[selectTipoAlta.selectedIndex].text.toLowerCase();
        if (textoSeleccionado.includes('fallecimiento')) {
        contenedorActa.classList.remove('d-none');
        } else {
        contenedorActa.classList.add('d-none');
        document.getElementById('actaDefuncion').value = '';
        }
    });

        formAlta.addEventListener('submit', async (e) => {
        
        e.preventDefault();

        const idtipoalta = selectTipoAlta.value;
        const indicaciones = inputIndicaciones.value;
        const actadefuncion = inputActa.value;

        if (!idtipoalta) {
            Swal.fire('Atención', 'Debe seleccionar el motivo de alta.', 'warning');
            return;
        }

        // Detectamos si es fallecimiento
        const textoSeleccionado = selectTipoAlta.options[selectTipoAlta.selectedIndex].text.toLowerCase();
        const esFallecimiento = textoSeleccionado.includes('fallecimiento');

        if (esFallecimiento && !actadefuncion.trim()) {
            Swal.fire('Atención', 'Debe ingresar el N° de acta de defunción.', 'warning');
            return;
        }

        let mensaje = `Esta acción cerrará el proceso de internación. No podrá registrar nuevas intervenciones sobre esta internación.`;

        if (esFallecimiento) {
            mensaje += `<br><br><strong>Advertencia:</strong> También se registrará al paciente como fallecido, y no podrá recibir ningún tipo de atención futura.`;
        }

        Swal.fire({
            title: '¿Confirmar alta?',
            html: mensaje,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, confirmar alta',
            cancelButtonText: 'No, cancelar',
            confirmButtonColor: '#198754',
            cancelButtonColor: '#d33',
            reverseButtons: true
        }).then(async (result) => {
            if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/internaciones/${idInternacionRecuperada}/alta`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idtipoalta,
                    indicaciones,
                    actadefuncion
                })
                });

                const data = await response.json();

                if (data.success) {
                Swal.fire('Éxito', 'El alta fue registrada correctamente.', 'success').then(() => {
                    location.reload();
                });
                } else {
                throw new Error(data.message || 'No se pudo registrar el alta.');
                }
            } catch (error) {
                console.error('Error registrando alta:', error);
                Swal.fire('Error', error.message, 'error');
            }
            }
        });
    });

    async function cargarTablaEvaluaciones(idInternacionRecuperada) {
       
        try {
            const res = await fetch(`/api/atencionmedica/evaluacionesm/${idInternacionRecuperada}`);
            const data = await res.json();
        
            const tbody = document.getElementById('tablaEvaluaciones');
            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
                data.data.forEach(p => {
                    const tr = document.createElement('tr');
                        tr.innerHTML = `
                        <td class="text-center col-fecha">${formatearFecha(p.fechaevaluacion)}</td>
                        <td>${p.medico}</td>
                        <td class="col-tipoestudio">${p.diagnostico}</td>
                        <td class="col-observaciones">${p.observacionesem || ''}</td>
                        `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay evaluaciones médicas registradas.</td></tr>`;
            }
        } catch (error) {
            console.error('Error al cargar evaluaciones:', error);
        }
    }

    async function cargarTablaMedicamentos(idInternacionRecuperada) {
        try {
            const res = await fetch(`/api/atencionmedica/medicamentos/${idInternacionRecuperada}`);
            const data = await res.json();

            const tbody = document.getElementById('tablaMedicamentos');
            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
                data.data.forEach(p => {
                    const tr = document.createElement('tr');
                        tr.innerHTML = `
                        <td class="text-center col-fecha">${formatearFecha(p.fechaprescripcion)}</td>
                        <td>${p.medico}</td>
                        <td class="col-medicamento">${p.medicamento.nombremedicamento} ${p.medicamento.presentacion}</td>
                        <td class="text-center col-cantidad">${p.cantidad}</td>
                        <td class="col-observaciones">${p.observacionesme || ''}</td>
                        `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center">No hay medicamentos registrados.</td></tr>`;
            }
        } catch (error) {
            console.error('Error al cargar prescripciones:', error);
        }
    }

    async function cargarTablaEstudios(idInternacionRecuperada) {
       
        try {
            const res = await fetch(`/api/atencionmedica/estudios/${idInternacionRecuperada}`);
            const data = await res.json();
        
            const tbody = document.getElementById('tablaEstudios');
            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
                data.data.forEach(p => {
                    const tr = document.createElement('tr');
                        tr.innerHTML = `
                        <td class="text-center col-fecha">${formatearFecha(p.fechaestudio)}</td>
                        <td>${p.medico}</td>
                        <td class="col-tipoestudio">${p.estudio}</td>
                        <td class="col-observaciones">${p.observacioneses || ''}</td>
                        `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay estudios registrados.</td></tr>`;
            }
        } catch (error) {
            console.error('Error al cargar estudios:', error);
        }
    }

    async function cargarTablaCirugias(idInternacionRecuperada) {
       
        try {
            const res = await fetch(`/api/atencionmedica/cirugias/${idInternacionRecuperada}`);
            const data = await res.json();
        
            const tbody = document.getElementById('tablaCirugias');
            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
                data.data.forEach(p => {
                    const tr = document.createElement('tr');
                        tr.innerHTML = `
                        <td class="text-center col-fecha">${formatearFecha(p.fechacirugia)}</td>
                        <td>${p.medico}</td>
                        <td class="col-tipoestudio">${p.cirugia}</td>
                        <td class="col-tipoestudio">${p.anestesia}</td>
                        <td class="col-observaciones">${p.observaciones || ''}</td>
                        `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="5" class="text-center">No hay cirugias registradas.</td></tr>`;
            }
        } catch (error) {
            console.error('Error al cargar cirugias:', error);
        }
    }

    async function cargarTablaTerapias(idInternacionRecuperada) {
       
        try {
            const res = await fetch(`/api/atencionmedica/terapias/${idInternacionRecuperada}`);
            const data = await res.json();
        
            const tbody = document.getElementById('tablaTerapias');
            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
                data.data.forEach(p => {
                    const tr = document.createElement('tr');
                        tr.innerHTML = `
                        <td class="text-center col-fecha">${formatearFecha(p.fechaterapia)}</td>
                        <td>${p.medico}</td>
                        <td class="col-tipoestudio">${p.terapia}</td>
                        <td class="col-observaciones">${p.observaciones || ''}</td>
                        `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="4" class="text-center">No hay terapias registradas.</td></tr>`;
            }
        } catch (error) {
            console.error('Error al cargar terapias:', error);
        }
    }

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

        const sexoTexto = {
            'M': 'Masculino',
            'F': 'Femenino',
            'X': 'No binario'
        }[paciente.sexo] || 'Sin datos';

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
                </div>
            </div>
        `;
    }

    async function mostrarAdmision(internacion, datosInternacion, camaAsignada) {
        idInternacionRecuperada = internacion.idinternacion;

        datosInternacion.innerHTML = `
            <div class="card shadow-sm mb-4 border-0 bg-dark text-white">
            <div class="card-body">
                <h5 class="text-center fw-bold mb-3">Internación N° ${internacion.idinternacion}</h5>
                
                <div class="row mb-2">
                <div class="col-md-12 text-center">
                    <p class="mb-1">
                    <strong>Origen:</strong> ${internacion.origen.denominacion} |
                    <strong>Médico:</strong> ${internacion.medico.apellidonombres} |
                    <strong>Diagnóstico:</strong> ${internacion.diagnostico.descripcion}
                    </p>
                </div>
                </div>
                
                <div class="row">
                <div class="col-md-12 text-center">
                    <p class="mb-0">
                    <strong>Fecha Ingreso:</strong> ${internacion.fechaingreso} -
                    <strong>Hora:</strong> ${internacion.horaingreso} |
                    <strong>Unidad:</strong> ${camaAsignada.unidad} -
                    <strong>Ala:</strong> ${camaAsignada.ala} -
                    <strong>Habitación:</strong> ${camaAsignada.habitacion} -
                    <strong>Cama:</strong> ${camaAsignada.cama}
                    </p>
                </div>
                </div>
            </div>
            </div>
        `;

        document.getElementById('contenedorAtencionMedica').style.display = 'block';
        await cargarTablaEvaluaciones(idInternacionRecuperada);
        await cargarTablaMedicamentos(idInternacionRecuperada);
        await cargarTablaEstudios(idInternacionRecuperada);
        await cargarTablaCirugias(idInternacionRecuperada);
        await cargarTablaTerapias(idInternacionRecuperada);
        
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
        datosPaciente.innerHTML = "";
        pacienteSeleccionado = null;
    }

    function bloqueardocumento() {
        inputDocumento.disabled = true;
        btnBuscarPaciente.textContent = "Nueva búsqueda";
    }

    async function cargarDiagnosticos() {
        try {
            const response = await fetch(API_URL_DIAGNOSTICOS);
            if (!response.ok) throw new Error("Error al cargar diagnósticos");
            datosDiagnosticos = await response.json();
            datosDiagnosticos.forEach(item => {
                const option = document.createElement('option');
                option.value = item.iddiagnostico;
                option.textContent = item.descripcion;
                diagnosticoEvaluacion.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar diagnósticos:", error);
        }
    }

    async function cargarMedicamentos() {
        try {
            const response = await fetch(API_URL_MEDICAMENTOS);
            if (!response.ok) throw new Error("Error al cargar medicamentos");
            datosMedicamentos = await response.json();
            datosMedicamentos.forEach(item => {
                const option = document.createElement('option');
                option.value = item.idmedicamento;
                option.textContent = item.nombremedicamento + " - " + item.presentacion;
                medicamentoPrescripcion.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar medicamentos:", error);
        }
    }
    async function cargarEstudios() {
        try {
            const response = await fetch(API_URL_ESTUDIOS);
            if (!response.ok) throw new Error("Error al cargar los tipos de estudios");
            datosEstudios = await response.json();
            datosEstudios.forEach(item => {
                const option = document.createElement('option');
                option.value = item.idestudio;
                option.textContent = item.denominacion;
                tipoEstudio.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar tipos de estudos:", error);
        }
    }

    async function cargarCirugias() {
        try {
            const response = await fetch(API_URL_TIPOSCIRUGIAS);
            if (!response.ok) throw new Error("Error al cargar los tipos de cirugias");
            datosCirugias = await response.json();
            datosCirugias.forEach(item => {
                const option = document.createElement('option');
                option.value = item.idtipocirugia;
                option.textContent = item.denominacioncirugia;
                tipoCirugia.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar tipos de cirugias:", error);
        }
    }

    async function cargarTiposAnestesias() {
        try {
            const response = await fetch(API_URL_TIPOSANESTESIAS);
            if (!response.ok) throw new Error("Error al cargar los tipos de anestesia");
            datosAnestesias = await response.json();
            datosAnestesias.forEach(item => {
                const option = document.createElement('option');
                option.value = item.idtipoanestesia;
                option.textContent = item.denominacionanestesia;
                tipoAnestesia.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar tipos de anestesia:", error);
        }
    }

    async function cargarTiposTerapias() {
        try {
            const response = await fetch(API_URL_TIPOSTERAPIAS);
            if (!response.ok) throw new Error("Error al cargar los tipos de terapias");
            datosTerapias = await response.json();
            datosTerapias.forEach(item => {
                const option = document.createElement('option');
                option.value = item.idtipoterapia;
                option.textContent = item.denominacionterapia;
                tipoTerapia.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar tipos de terapias:", error);
        }
    }
    async function cargarTiposAltas() {
        try {
            const response = await fetch(API_URL_TIPOSALTAS);
            if (!response.ok) throw new Error("Error al cargar los tipos de altas");
            datosAltas = await response.json();
            datosAltas.forEach(item => {
                const option = document.createElement('option');
                option.value = item.idtipoalta;
                option.textContent = item.denominaciontipo;
                selectTipoAlta.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar tipos de altas:", error);
        }
    }

});