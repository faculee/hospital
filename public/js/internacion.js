import { escapeHTML, mostrarMensaje } from './utils.js';

const API_URL_PACIENTES = '/api/pacientes';
const API_URL_INTERNACIONES = '/api/internaciones';
const API_URL_MEDICOS = '/api/medicos';
const API_URL_ORIGENES = '/api/origenes';
const API_URL_DIAGNOSTICOS = '/api/diagnosticos';
const API_URL_UNIDADES = '/api/infraunidades';

let datosOrigenes=[];
let datosDiagnosticos=[];   
let idinternacionRecuperada=0;


document.addEventListener("DOMContentLoaded", async () => {

    const inputDocumento = document.getElementById("documento");
    const btnBuscarPaciente = document.getElementById("btnBuscarPaciente");
    const datosPaciente = document.getElementById("datosPaciente");
    const seccionInternacion = document.getElementById("seccionInternacion");
    const formInternacion = document.getElementById("formInternacion");
    const datosInternacion = document.getElementById("datosInternacion");
    const selectMedico = document.getElementById("idmedico");
    const selectOrigen = document.getElementById("idorigen");
    const selectDiagnostico = document.getElementById("iddiagnostico");
    const btnRegistrarInternacion = document.getElementById("btnRegistrarInternacion");
    const seccionCancelarAdmision = document.getElementById("seccionCancelarAdmision");
    const btnCancelarAdmision = document.getElementById("btnCancelarAdmision");
    const btnAsignarCama = document.getElementById("btnAsignarCama");
    const btnCancelarUltimaAsignacion = document.getElementById("btnCancelarUltimaAsignacion");
    const seccionCamasAsignadas = document.getElementById("seccionCamasAsignadas");

    btnRegistrarInternacion.addEventListener("click", registrarInternacion);

    
    let pacienteSeleccionado = null;

    await cargarMedicos();
    await cargarOrigenes();
    await cargarDiagnosticos();


    const hoy = new Date();

    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0'); 
    const dd = String(hoy.getDate()).padStart(2, '0');

    document.getElementById("fechaingreso").value = `${yyyy}-${mm}-${dd}`;
    document.getElementById("horaingreso").value = hoy.toTimeString().substring(0, 5);

    btnBuscarPaciente.addEventListener("click", buscarPaciente);

        async function buscarPaciente() {
      
            if (btnBuscarPaciente.textContent === "Nueva búsqueda") {
                resetearBusqueda();
                return;
            }

            const documento = inputDocumento.value.trim();

            if (!documento || isNaN(documento)) {
                mostrarMensaje('#mensajes', 'Ingrese un número de documento válido', 0);
                return;
            }

            try {
                
                const resultado = await buscarPacienteAPI(documento);
                
                if (!resultado || !resultado.paciente) {
                    Swal.fire({
                        title: 'Paciente No Registrado',
                        html: "El n° de documento ingresado no se encuentra registrado",
                        icon: 'info',
                        confirmButtonText: 'Entendido'
                    }).then(() => {
                        setTimeout(() => {
                            inputDocumento.focus();
                        }, 300);
                    });
                    limpiarDatosPaciente();
                    return;
                }

                pacienteSeleccionado = resultado.paciente;
                
                if (pacienteSeleccionado.fechafallecimiento) {
                    Swal.fire({
                        title: 'Paciente fallecido',
                        html: `<p>El paciente fue registrado como</p>
                            <p><strong>fallecido</strong> en el día <strong>${pacienteSeleccionado.fechafallecimiento}</strong>.</p>
                            <p>No podrá registrar antecedentes en su historia clínica.</p>`,
                        icon: 'info',
                        confirmButtonText: 'Entendido'
                    });
                    btnRegistrarInternacion.disabled = true;
                    mostrarDatosPaciente(pacienteSeleccionado);
                    bloqueardocumento();
                    return;
                }

                mostrarDatosPaciente(pacienteSeleccionado);
                bloqueardocumento();
                verificarInternaciones(pacienteSeleccionado);
                
            } catch (error) {
                console.error('Error en búsqueda:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Hubo un problema al realizar la búsqueda.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
                });
            }
        }

    btnCancelarAdmision.addEventListener("click", async () => {
            
        Swal.fire({
            title: '¿Cancelar admisión?',
            html: `Esta acción <strong>eliminará permanentemente</strong> el registro de internación.<br>
                <small>ID: ${idinternacionRecuperada}</small>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, volver',
            reverseButtons: true,
            focusCancel: true
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/internaciones/${idinternacionRecuperada}/cancelarInternacion`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();

                    if (data.success) {
                        Swal.fire({
                            title: '¡Cancelada!',
                            text: 'La internación fue cancelada exitosamente.',
                            icon: 'success',
                            confirmButtonText: 'Cerrar'
                        }).then(() => {
                            location.reload(); 
                        });
                    } else {
                        throw new Error(data.message || 'No se pudo cancelar la internación.');
                    }
                } catch (error) {
                    Swal.fire({
                        title: 'Imposible Cancelar',
                        text: error.message,
                        icon: 'warning',  
                        confirmButtonText: 'Cerrar'
                    });
                    console.error('Error cancelando internación:', error);
                }
            }
        });


    });

    btnAsignarCama.addEventListener("click", async () => {
        try {
            const camaSeleccionada = await seleccionarUnidadYCama(pacienteSeleccionado.sexo);
            if (camaSeleccionada) {

                btnAsignarCama.disabled = true;
                btnAsignarCama.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Asignando...';
                
                await asignarCama(idinternacionRecuperada, camaSeleccionada.idcama);
                await cargarCamasAsignadas(idinternacionRecuperada); 
                
                btnAsignarCama.disabled = false;
                btnAsignarCama.innerHTML = 'Asignar Cama';
            }
        } catch (error) {
            console.error("Error al asignar cama:", error);
            btnAsignarCama.disabled = false;
            btnAsignarCama.innerHTML = 'Asignar Cama';
            Swal.fire('Error', 'Ocurrió un error al asignar la cama', 'error');
        }
    });

    btnCancelarUltimaAsignacion.addEventListener("click", async () => {
        try {
            const result = await Swal.fire({
                title: '¿Está seguro?',
                text: "Esta acción cancelará la última asignación de cama",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'No, volver',
                reverseButtons: true,
                focusCancel: true
            });

            if (!result.isConfirmed) return;

            btnCancelarUltimaAsignacion.disabled = true;
            btnCancelarUltimaAsignacion.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';

            const response = await fetch(`/api/internaciones/${idinternacionRecuperada}/ultima-cama`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al cancelar la asignación');
            }

            await Swal.fire({
                title: '¡Éxito!',
                text: data.message || 'La última asignación fue anulada correctamente.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            await cargarCamasAsignadas(idinternacionRecuperada);

        } catch (error) {
            console.error('Error al cancelar asignación:', error);
            await Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo cancelar la asignación',
                icon: 'error'
            });
        } finally {
            btnCancelarUltimaAsignacion.disabled = false;
            btnCancelarUltimaAsignacion.innerHTML = '<i class="fas fa-undo me-2"></i>Cancelar Última Asignación';
        }
    });

    async function buscarPacienteAPI(documento) {
        try {
            const response = await fetch(`${API_URL_PACIENTES}/${documento}`);
            if (!response.ok) {
                if (response.status === 404) {
                    return null; 
                }
                throw new Error('Error en la respuesta del servidor');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al buscar paciente:', error);
            throw error;
        }
    }

    
    async function mostrarDatosPaciente(paciente) {
        let edadTexto = "Sin datos";
        let fechaNacTexto = "Sin datos";

        if (paciente.fechanacimiento) {
            const fechaNac = new Date(paciente.fechanacimiento);
            const hoy = new Date();
            let edad = hoy.getFullYear() - fechaNac.getFullYear();
            const mes = hoy.getMonth() - fechaNac.getMonth();
            if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
                edad--;
            }
            fechaNacTexto = escapeHTML(paciente.fechanacimiento);
            edadTexto = `${edad} años`;
        }

        const sexoTexto = {
            'M': 'Masculino',
            'F': 'Femenino',
            'X': 'No binario'
        }[paciente.sexo] || 'Sin datos';

        const coberturaNombre = (paciente.cobertura && paciente.cobertura.denominacion)
            ? escapeHTML(paciente.cobertura.denominacion)
            : "Sin cobertura";

        datosPaciente.innerHTML = `
            <div class="card border shadow-sm mb-3">
                <div class="card-body">
                    <h4 class="card-title mb-4 text-center fs-5">Datos del Paciente</h4> 
                    <div class="row mb-2">
                        <div class="col-md-6">
                            <p><strong>Apellido y Nombres:</strong> ${escapeHTML(paciente.apellidonombres)}</p>
                        </div>
                        <div class="col-md-3">
                            <p><strong>Sexo:</strong> ${escapeHTML(sexoTexto)}</p>
                        </div>
                        <div class="col-md-3">
                            <p><strong>Teléfono:</strong> ${escapeHTML(paciente.telefono || 'No registrado')}</p>
                        </div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-md-6">
                            <p><strong>Fecha Nacimiento:</strong> ${fechaNacTexto}</p>
                        </div>
                        <div class="col-md-6">
                            <p><strong>Edad:</strong> ${edadTexto}</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-md-12">
                            <p><strong>Cobertura:</strong> ${coberturaNombre}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    } 
    
    async function verificarInternaciones(paciente) {
        idinternacionRecuperada = 0;
        try {

            const response = await fetch(`${API_URL_INTERNACIONES}/paciente/${paciente.idpaciente}/activas`);
            if (!response.ok) {
                throw new Error('Error al verificar internaciones');
            }

            const resultado = await response.json();

            if (resultado.activa) {

                idinternacionRecuperada = resultado.internacion.idinternacion;
                mostrarAdmision(resultado.internacion);
                inputDocumento.disabled = true;
                btnBuscarPaciente.textContent = "Nueva búsqueda";
                btnRegistrarInternacion.disabled = true;
                seccionInternacion.style.display = "none";
                seccionCancelarAdmision.style.display = "block";
                btnCancelarAdmision.disabled = false;
                seccionCamasAsignadas.style.display = "block";
                await cargarCamasAsignadas(idinternacionRecuperada);


            } else {
                seccionInternacion.style.display = "block";
                btnRegistrarInternacion.disabled = false;
            }

        } catch (error) {
            console.error('Error al verificar internaciones:', error);
            mostrarMensaje('#mensajes', 'Error al verificar internaciones del paciente', 0);
        }
    }

    async function mostrarAdmision(internacion) {
        datosInternacion.innerHTML = `
            <div class="card shadow-sm mb-4 border-0 bg-secondary text-white">
            <div class="card-body">
                <h5 class="text-center fw-bold mb-3">Internación N° ${escapeHTML(internacion.idinternacion.toString())}</h5>
                <div class="row mb-2">
                <div class="col-md-12 text-center">
                    <p class="mb-1">
                    <strong>Origen:</strong> ${escapeHTML(internacion.origen.denominacion)} |
                    <strong>Médico:</strong> ${escapeHTML(internacion.medico.apellidonombres)} |
                    <strong>Diagnóstico:</strong> ${escapeHTML(internacion.diagnostico.descripcion)}
                    </p>
                </div>
                </div>
                <div class="row">
                <div class="col-md-12 text-center">
                    <p class="mb-0">
                    <strong>Fecha Ingreso:</strong> ${escapeHTML(internacion.fechaingreso)} -
                    <strong>Hora:</strong> ${escapeHTML(internacion.horaingreso)} |
                    </p>
                </div>
                </div>
            </div>
            </div>
        `;
    }
    
    async function registrarInternacion(e) {    
        e.preventDefault(); 

        if (!validarDatos(formInternacion)) return;

        const nuevaInternacion = {
            idpaciente: pacienteSeleccionado.idpaciente,
            idorigen: Number(formInternacion.idorigen.value),
            idmedico: Number(formInternacion.idmedico.value),
            iddiagnostico: Number(formInternacion.iddiagnostico.value),
            observaciones: formInternacion.observaciones.value
        };

        const resultadoConfirmacion = await Swal.fire({
            title: '¿Desea continuar?',
            html: `<p>Va a registrar los datos de admisión para la internación.</p>
                <p class="fw-bold text-danger">Estos datos no podrán ser modificados luego de registrar movimientos en la historia clínica del paciente.</p>
                <p>¿Está seguro que desea continuar?</p>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });

        if (!resultadoConfirmacion.isConfirmed) {
            return; 
        }

        try {
            const response = await fetch(API_URL_INTERNACIONES, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaInternacion)
            });

            if (!response.ok) {
                throw new Error('Error al registrar internación');
            }

            await Swal.fire({
                title: 'Éxito',
                text: 'Internación registrada correctamente.',
                icon: 'success',
                confirmButtonText: 'Cerrar'
            });

            formInternacion.reset();
            seccionInternacion.style.display = "none";

            await verificarInternaciones(pacienteSeleccionado);
 
            btnAsignarCama.click();


        } catch (error) {
            console.error('Error al registrar internación:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al registrar la internación',
                icon: 'error',
                confirmButtonText: 'Cerrar'
            });
        }
    }

    async function asignarCama(idInternacion, idCama) {

        if (!idInternacion || !idCama) {
            throw new Error('Se requieren ID de internación y ID de cama');
        }
        const url = `/api/internaciones/${idInternacion}/camas`; 
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idcama: idCama })
        };

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    errorData.message || 
                    `Error ${response.status}: ${response.statusText}`
                );
            }

            const result = await response.json();
            
            await Swal.fire({
                title: '¡Éxito!',
                text: result.message || 'Cama asignada correctamente',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });

            return result.data;



        } catch (error) {
            console.error('Error al asignar cama:', error);
            
            await Swal.fire({
                    title: 'Error',
                    text: 'Hubo un problema al realizar la búsqueda.',
                    icon: 'error',
                    confirmButtonText: 'Cerrar'
            });

            throw error;
        }
    }
    async function seleccionarUnidadYCama(sexoPaciente, nombrePaciente) {

        const unidadesResponse = await fetch(API_URL_UNIDADES);
        const unidadesData = await unidadesResponse.json();
        
        if (!unidadesData.success) {
            await Swal.fire('Error', 'No se pudieron cargar las unidades', 'error');
            return;
        }

        const generarSelectUnidades = (unidades) => `
            <div style="text-align: center;">
                <select id="swal-select-unidad" style="
                width: 90%;
                font-size: 14px;
                padding: 6px 8px;
                border-radius: 4px;
                margin-top: 10px;
                max-width: 300px;
                ">
                <option value="">Seleccione una unidad...</option>
                ${unidades.map(u => `<option value="${u.idunidad}">${u.denominacion}</option>`).join('')}
                </select>
            </div>
        `;
        const generarSelectCamas = (camas) => `
            <div style="text-align: center;">
                <select id="swal-select-cama" style="
                width: 90%;
                font-size: 14px;
                padding: 6px 8px;
                border-radius: 4px;
                margin-top: 10px;
                max-width: 300px;
                ">
                <option value="">Seleccione una cama...</option>
                ${camas.map(c => `
                    <option value="${c.idcama}" 
                        data-numero="${c.numerocama}" 
                        data-habitacion="${c.nombrehabitacion}" 
                        data-ala="${c.denominacion}">
                        Cama ${c.numerocama} - ${c.nombrehabitacion} - ${c.denominacion}
                    </option>
                `).join('')}
                </select>
            </div>
        `;

        const { value: idunidad } = await Swal.fire({
            title: 'Unidad de Internación',
            html: generarSelectUnidades(unidadesData.unidades),
            focusConfirm: false,
            preConfirm: () => {
                const select = document.getElementById('swal-select-unidad');
                if (!select.value) {
                    Swal.showValidationMessage('Debe seleccionar una unidad');
                    return false;
                }
                return select.value;
            },
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Buscar camas disponibles',
            reverseButtons: true
        });

        if (!idunidad) return;

        let camasData;
        try {
            const response = await fetch(`/api/infraestructura/habitaciones-compatibles?idunidad=${idunidad}&sexo=${sexoPaciente}`);
            camasData = await response.json();
            
            if (!camasData.success || !camasData.habitaciones?.length) {
                throw new Error(camasData.message || 'No hay camas disponibles para esa Unidad');
            }
        } catch (error) {
            await Swal.fire('Error', error.message, 'error');
            return seleccionarUnidadYCama(sexoPaciente, nombrePaciente);
        }

        const { value: idcama, isConfirmed } = await Swal.fire({
            title: 'Seleccione cama disponible',
            html: generarSelectCamas(camasData.habitaciones),
            focusConfirm: false,
            preConfirm: () => {
                const select = document.getElementById('swal-select-cama');
                if (!select.value) {
                    Swal.showValidationMessage('Debe seleccionar una cama');
                    return false;
                }
                
                const selectedOption = select.options[select.selectedIndex];
                return {
                    idcama: select.value,
                    numerocama: selectedOption.dataset.numero,
                    nombrehabitacion: selectedOption.dataset.habitacion,
                    denominacion: selectedOption.dataset.ala
                };
            },
            showCancelButton: true,
            cancelButtonText: 'Cambiar unidad',
            confirmButtonText: 'Siguiente',
            reverseButtons: true,
            allowOutsideClick: false
        });

        if (!isConfirmed) {
            return seleccionarUnidadYCama(sexoPaciente, nombrePaciente);
        }

        const unidadSeleccionada = unidadesData.unidades.find(u => u.idunidad == idunidad).denominacion;
        const { value: confirmacion } = await Swal.fire({
            title: 'Confirmar asignación de cama',
            html: `
                <div style="text-align: center; margin: 10px 0;">
                    <p>El paciente se internará en:</p>
                    <p><strong>Unidad:</strong> ${unidadSeleccionada}</p>
                    <p><strong>Ala:</strong> ${idcama.denominacion}</p>
                    <p><strong>Habitación:</strong> ${idcama.nombrehabitacion}</p>
                    <p><strong>Cama:</strong> ${idcama.numerocama}</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmar internación',
            cancelButtonText: 'Revisar',
            reverseButtons: true,
            footer: '<small>Verifique cuidadosamente los datos antes de confirmar</small>'
        });

        if (!confirmacion) {
            return seleccionarUnidadYCama(sexoPaciente, nombrePaciente);
        }

        return {
            idunidad,
            idcama: idcama.idcama,
            unidad: unidadSeleccionada,
            ala: idcama.denominacion,
            habitacion: idcama.nombrehabitacion,
            cama: idcama.numerocama
        };
    }
    async function cargarOrigenes() {
        try {
            const response = await fetch(API_URL_ORIGENES);
            if (!response.ok) throw new Error("Error al cargar orígenes");
            const json =  await response.json();
            datosOrigenes = json.origenes;
            datosOrigenes.forEach(item => {
                const option = document.createElement('option');
                option.value = item.idorigen;
                option.textContent = item.denominacion;
                selectOrigen.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar orígenes:", error);
        }
    }

    async function cargarMedicos() {
        try {
            const response = await fetch(API_URL_MEDICOS);
            if (!response.ok) throw new Error("Error al cargar médicos");
            const { medicos } = await response.json();

            selectMedico.innerHTML = ""; 
            medicos.forEach(item => {
                const option = document.createElement('option');
                option.value = item.idmedico;
                option.textContent = item.apellidonombres;
                selectMedico.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar médicos:", error);
        }
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
                    selectDiagnostico.appendChild(option);
            });
        } catch (error) {
            console.error("Error al cargar diagnósticos:", error);
        }
    }

    async function cargarCamasAsignadas(idinternacion) {
        try {
            if (!idinternacion || isNaN(parseInt(idinternacion))) {
                document.getElementById('mensajes').textContent = 'ID de internación inválido.';
                return;
            }

            const tbody = document.getElementById('tablaCamas');
            tbody.innerHTML = '<tr><td colspan="4" class="text-center"><i class="fas fa-spinner fa-spin"></i> Cargando...</td></tr>';

            const response = await fetch(`/api/infraestructura/camas-paciente?idinternacion=${idinternacion}`);

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();

            if (!data.success) {
                document.getElementById('mensajes').textContent = data.message || 'Error al cargar camas.';
                tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar datos</td></tr>';
                return;
            }

            document.getElementById('seccionCamasAsignadas').style.display = 'block';
            tbody.innerHTML = '';

            if (data.camas.length === 0) {
                const fila = document.createElement('tr');
                fila.innerHTML = `<td colspan="4" class="text-center text-muted">No hay camas asignadas</td>`;
                tbody.appendChild(fila);
                return;
            }

            data.camas.forEach(cama => {
                const fila = document.createElement('tr');
                fila.innerHTML = `
                    <td class="text-center">${cama.fechadesde ? escapeHTML(new Date(cama.fechadesde).toLocaleDateString()) : 'N/D'}</td>
                    <td>${escapeHTML(cama.unidad || 'N/D')}</td>
                    <td>${escapeHTML(cama.habitacion || 'N/D')}</td>
                    <td class="text-center">${escapeHTML(cama.cama || 'N/D')}</td>
                `;
                tbody.appendChild(fila);
            });

        } catch (error) {
            console.error('Error al cargar camas:', error);
            const tbody = document.getElementById('tablaCamas');
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error al cargar las camas asignadas</td></tr>';
            document.getElementById('mensajes').textContent = 'Ocurrió un error inesperado al cargar las camas.';
        }
    }

    function validarDatos(form) {
        
        let origen = form.idorigen.value;
        let medico = form.idmedico.value;
        let diagnostico = form.iddiagnostico.value;

        if (origen === "") {
            mostrarMensaje('#mensajes', 'Debe seleccionar un origen.', 0);
            return false;
        }

        if (medico === "") {
            mostrarMensaje('#mensajes', 'Debe seleccionar un médico.', 0);
            return false;   
        }

        if (diagnostico === "") {
            mostrarMensaje('#mensajes', 'Debe seleccionar un diagnóstico.', 0);
            return false;   
        }

        return true;
    }
    function resetearBusqueda() {
        inputDocumento.value = "";
        inputDocumento.disabled = false;
        btnBuscarPaciente.textContent = "Buscar";
        limpiarDatosPaciente();
        datosInternacion.innerHTML = "";
        seccionInternacion.style.display = "none";
        btnRegistrarInternacion.disabled = false;
        seccionCancelarAdmision.style.display = "none";
        seccionCamasAsignadas.style.display = "none";
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


});