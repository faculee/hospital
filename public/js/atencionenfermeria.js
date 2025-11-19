import { buscarPaciente } from './buscarPaciente.js';
import { mostrarMensaje, formatearFecha } from './utils.js';

let idInternacionRecuperada = 0;

document.addEventListener("DOMContentLoaded", async () => {

    const inputDocumento = document.getElementById("documento");
    const btnBuscarPaciente = document.getElementById("btnBuscarPaciente");
    const datosPaciente = document.getElementById("datosPaciente");
    const datosInternacion = document.getElementById("datosInternacion");

    btnBuscarPaciente.addEventListener("click", () => {

        if (btnBuscarPaciente.textContent === "Nueva búsqueda") {
            resetearBusqueda();
            contenedorAtencionEnfermeria.style.display = 'none';
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

        document.getElementById('contenedorAtencionEnfermeria').style.display = 'none';
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
        contenedorAtencionEnfermeria.style.display = 'none';
    }

    document.getElementById('btnRegistrarEvaluacion').addEventListener('click', async (e) => {

        e.preventDefault();

        const parterial = document.getElementById('parterial')?.value.trim();
        const fcardiaca = document.getElementById('fcardiaca')?.value.trim();
        const frespiratoria = document.getElementById('frespiratoria')?.value.trim();
        const tcorporal = document.getElementById('tcorporal')?.value.trim();
        const saturacion = document.getElementById('saturacion')?.value.trim();
        const observacionesee = document.getElementById('observacionesee')?.value.trim();

        if (!idInternacionRecuperada) {
            mostrarMensaje('#mensajesSeccion', 'Falta información clave en la ficha (internación)', 0);
            return;
        }
        const regexPA = /^(\d{2,3})\/(\d{2,3})$/;
        const matchPA = parterial.match(regexPA);
        if (!matchPA || matchPA[1] < 50 || matchPA[1] > 250 || matchPA[2] < 30 || matchPA[2] > 150) {
            mostrarMensaje('#mensajesSeccion', 'Ingrese una Presión Arterial válida (Ej: 120/80)', 0);
            document.getElementById('parterial').focus();
            return;
        }

        const fc = parseInt(fcardiaca);
        if (isNaN(fc) || fc < 30 || fc > 200) {
            mostrarMensaje('#mensajesSeccion', 'Ingrese una Frecuencia Cardíaca válida (30 a 200 lpm)', 0);
            document.getElementById('fcardiaca').focus();
            return;
        }

        const fr = parseInt(frespiratoria);
        if (isNaN(fr) || fr < 8 || fr > 50) {
            mostrarMensaje('#mensajesSeccion', 'Ingrese una Frecuencia Respiratoria válida (8 a 50 rpm)', 0);
            document.getElementById('frespiratoria').focus();
            return;
        }

        const temp = parseFloat(tcorporal.replace(',', '.'));
        if (isNaN(temp) || temp < 34 || temp > 42) {
            mostrarMensaje('#mensajesSeccion', 'Ingrese una Temperatura válida (34 a 42 °C)', 0);
            document.getElementById('tcorporal').focus();
            return;
        }

        const sat = parseInt(saturacion);
        if (isNaN(sat) || sat < 50 || sat > 100) {
            mostrarMensaje('#mensajesSeccion', 'Ingrese una Saturación válida (50% a 100%)', 0);
            document.getElementById('saturacion').focus();
            return;
        }

        const confirmacion = await Swal.fire({
            title: 'Confirmar Registro de Evaluación de Enfermería',
            html: `
                <div style="color: red; font-weight: bold; margin-bottom: 1rem;">
                    Va a ingresar una nueva Evaluación de Enfermería.<br>
                    Este registro no podrá ser modificado, ni eliminado.
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Presión Arterial:</strong> ${parterial} mmHg<br>
                    <strong>Frecuencia Cardíaca:</strong> ${fc} lpm<br>
                    <strong>Frecuencia Respiratoria:</strong> ${fr} rpm<br>
                    <strong>Temperatura:</strong> ${temp} °C<br>
                    <strong>Saturación:</strong> ${sat} %<br>
                    <strong>Observaciones:</strong> ${observacionesee || '-'}
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

        if (!confirmacion.isConfirmed) return;

        try {
            const res = await fetch('/api/atencionenfermeria/evaluaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    idinternacion: idInternacionRecuperada,
                    fechaevaluacion: new Date().toISOString().split('T')[0],
                    parterial,
                    fcardiaca: fc,
                    frespiratoria: fr,
                    tcorporal: temp,
                    saturacion: sat,
                    observacionesee: observacionesee ? observacionesee.toUpperCase() : ''
                })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();

            if (data.success) {
                Swal.fire('Éxito', 'Evaluación de Enfermería registrada correctamente.', 'success');
                document.getElementById('parterial').value = '';
                document.getElementById('fcardiaca').value = '';
                document.getElementById('frespiratoria').value = '';
                document.getElementById('tcorporal').value = '';
                document.getElementById('saturacion').value = '';
                document.getElementById('observacionesee').value = '';
                await cargarTablaEvaluaciones(idInternacionRecuperada);
            } else {
                Swal.fire('Error', data.message || 'No se pudo registrar la Evaluación.', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
        }
    });

    async function cargarTablaEvaluaciones(idInternacionRecuperada) {
        try {
            const res = await fetch(`/api/atencionenfermeria/evaluaciones/${idInternacionRecuperada}`);
            const data = await res.json();

            const tbody = document.getElementById('tablaEvaluaciones');
            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
                data.data.forEach(evaluacion => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td class="text-center col-fecha">${formatearFecha(evaluacion.fechaevaluacion)}</td>
                        <td>${evaluacion.enfermero}</td>
                        <td class="text-center">${evaluacion.parterial || '-'}</td>
                        <td class="text-center">${evaluacion.fcardiaca || '-'}</td>
                        <td class="text-center">${evaluacion.frespiratoria || '-'}</td>
                        <td class="text-center">${evaluacion.tcorporal || '-'}</td>
                        <td class="text-center">${evaluacion.saturacion || '-'}</td>
                        <td>${evaluacion.observacionesee || '-'}</td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center">No hay evaluaciones de enfermería registradas.</td></tr>`;
            }
        } catch (error) {
            console.error('Error al cargar evaluaciones:', error);
            mostrarMensaje('#mensajesSeccion', 'Error al cargar los registros', 0);
        }
    }

    document.getElementById('btnRegistrarNota').addEventListener('click', async (e) => {
        e.preventDefault();

        const nota = document.getElementById('notaenfermeria')?.value.trim();

        if (!idInternacionRecuperada) {
            mostrarMensaje('#mensajesSeccion', 'Falta información clave en la ficha (internación)', 0);
            return;
        }

        if (!nota || nota.length < 3) {
            mostrarMensaje('#mensajesSeccion', 'Debe escribir una nota de al menos 3 caracteres.', 0);
            document.getElementById('notaenfermeria').focus();
            return;
        }

        const confirmacion = await Swal.fire({
            title: 'Confirmar Registro de Nota de Enfermería',
            html: `
            <div style="color: red; font-weight: bold; margin-bottom: 1rem;">
                Va a ingresar una nueva Nota de Enfermería.<br>
                Este registro no podrá ser modificado, ni eliminado.
            </div>
            <strong>¿Está seguro de ingresar la nota?</strong>
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
            const res = await fetch('/api/atencionenfermeria/notas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idinternacion: idInternacionRecuperada,
                nota: nota.toUpperCase()
            })
            });

            if (!res.ok) {
            const text = await res.text();
            throw new Error(`Error ${res.status}: ${text}`);
            }

            const data = await res.json();

            if (data.success) {
            Swal.fire('Éxito', 'Nota de Enfermería registrada correctamente.', 'success');
            document.getElementById('notaenfermeria').value = '';
            await cargarTablaNotas(idInternacionRecuperada);
            } else {
            Swal.fire('Error', data.message || 'No se pudo registrar la nota.', 'error');
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Error al conectar con el servidor.', 'error');
        }
     });

     async function cargarTablaNotas(idInternacionRecuperada) {
        try {
            const res = await fetch(`/api/atencionenfermeria/notas/${idInternacionRecuperada}`);
            const data = await res.json();

            const tbody = document.getElementById('tablaNotas');
            tbody.innerHTML = '';

            if (data.success && data.data.length > 0) {
            data.data.forEach(nota => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                <td class="text-center">${formatearFecha(nota.fechanota)}</td>
                <td>${nota.enfermero}</td>
                <td>${nota.nota}</td>
                `;
                tbody.appendChild(tr);
            });
            } else {
            tbody.innerHTML = `<tr><td colspan="3" class="text-center">No hay notas de enfermería registradas.</td></tr>`;
            }
        } catch (error) {
            console.error('Error al cargar notas:', error);
            mostrarMensaje('#mensajesSeccion', 'Error al cargar las notas', 0);
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
            <div class="card shadow-sm mb-4 border-0 bg-secondary text-white">
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

        document.getElementById('contenedorAtencionEnfermeria').style.display = 'block';
        await cargarTablaEvaluaciones(idInternacionRecuperada);
        await cargarTablaNotas(idInternacionRecuperada);

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
    }

    function bloqueardocumento() {
        inputDocumento.disabled = true;
        btnBuscarPaciente.textContent = "Nueva búsqueda";
    }


});
