async function cambiarPacienteDeInternacion() {
  const { value: idinternacion } = await Swal.fire({
    title: 'Cambiar paciente de internación',
    input: 'number',
    inputLabel: 'Ingrese el número de internación',
    inputPlaceholder: 'Ej: 123',
    showCancelButton: true
  });

  if (!idinternacion) return;

  const respuesta = await fetch(`/api/internaciones/${idinternacion}`);
  const data = await respuesta.json();

  if (!data.success) {
    return Swal.fire('Error', data.message || 'Internación no encontrada', 'error');
  }

  const pacienteActual = data.internacion.paciente;
  const infoActual = `Actualmente asociada a: <b>${pacienteActual?.documento}, ${pacienteActual?.apellidonombres}</b>`;

  const { value: documentoNuevo } = await Swal.fire({
    title: 'Nuevo paciente',
    html: `${infoActual}<br><br>Ingrese el <strong>DOCUMENTO</strong> del nuevo paciente:`,
    input: 'number',
    showCancelButton: true,
    inputPlaceholder: 'Ej: 30123456'
  });

  if (!documentoNuevo) return;

  const documento = documentoNuevo.toString().trim();

  if (documento === "" || documento === "0" || isNaN(documento)) {
    return Swal.fire('Error', 'El documento es obligatorio y debe contener solo números.', 'error');
  }

  if (documento.length > 9) {
    return Swal.fire('Error', 'El documento no debe exceder los 9 dígitos.', 'error');
  }
  console.log('Documento que se envía:', documento);
  
  const respPaciente = await fetch(`/api/pacientes/${documento}`);
  const pacienteData = await respPaciente.json();

  if (!pacienteData.success || !pacienteData.paciente) {
    return Swal.fire('Error', pacienteData.message || 'Paciente no encontrado.', 'error');
  }

  const pacienteNuevo = pacienteData.paciente;

  if (pacienteNuevo.fechafallecimiento) {
    await Swal.fire({
      title: 'Paciente fallecido',
      html: `
        <p>El paciente fue registrado como <strong>fallecido</strong> el día <strong>${pacienteNuevo.fechafallecimiento}</strong>.</p>
        <p>No podrá registrar antecedentes en su historia clínica.</p>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido'
    });
    return;
  }

  const confirmar = await Swal.fire({
    title: '¿Está seguro?',
    html: `
      <p><strong>Internación:</strong> #${idinternacion}</p>
      <p><strong>Paciente actual:</strong> ${pacienteActual?.documento} - ${pacienteActual?.apellidonombres}</p>
      <p><strong>Nuevo paciente:</strong> ${pacienteNuevo.documento} - ${pacienteNuevo.apellidonombres}</p>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, cambiar',
    cancelButtonText: 'Cancelar'
  });

  if (!confirmar.isConfirmed) return;

  const respCambio = await fetch('/api/internaciones/cambiar-paciente', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      idinternacion,
      idpacienteNuevo: pacienteNuevo.idpaciente
    })
  });

  const resultado = await respCambio.json();

  if (resultado.success) {
    Swal.fire('Éxito', resultado.message, 'success');
  } else {
    Swal.fire('Error', resultado.message || 'No se pudo cambiar el paciente.', 'error');
  }
}

document.getElementById('btnCambiarPaciente')?.addEventListener('click', cambiarPacienteDeInternacion);
