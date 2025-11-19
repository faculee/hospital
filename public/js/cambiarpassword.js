import { mostrarMensaje } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCambiarPassword");

  document.querySelectorAll(".toggle-password").forEach(button => {
    const targetId = button.getAttribute("data-target");
    const input = document.getElementById(targetId);

    button.addEventListener("mousedown", () => {
      input.type = "text";
    });

    button.addEventListener("mouseup", () => {
      input.type = "password";
    });
    button.addEventListener("mouseleave", () => {
      input.type = "password";
    });
    button.addEventListener("touchstart", () => {
      input.type = "text";
    });
    button.addEventListener("touchend", () => {
      input.type = "password";
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const actual = document.getElementById("actual").value.trim();
    const nueva = document.getElementById("nueva").value.trim();
    const repetir = document.getElementById("repetir").value.trim();

    if (!actual || !nueva || !repetir) {
      mostrarMensaje('#mensajes', 'Todos los campos son obligatorios', 0);
      return;
    }

    if (nueva !== repetir) {
      mostrarMensaje('#mensajes', 'Las contraseñas no coinciden', 0);
      return;
    }

    try {
      const res = await fetch("/api/usuarios/cambiarpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actual, nueva, repetir })
      });
      
      const data = await res.json();

      if (data.exito) {
        Swal.fire("Éxito", data.mensaje, "success");
        form.reset();
      } else {
        Swal.fire("Error", data.mensaje, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
    }
  });
});
