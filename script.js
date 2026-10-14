
async function sha256(texto) {
  const datos = new TextEncoder().encode(texto);
  const buffer = await crypto.subtle.digest("SHA-256", datos);

  return Array.from(new Uint8Array(buffer))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function enviar(ruta, usuario, password) {
  const passwordHash = await sha256(password);

  const respuesta = await fetch(ruta, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      usuario,
      passwordHash
    })
  });

  const datos = await respuesta.json();
  document.getElementById("resultado").textContent =
    datos.mensaje;
}

document.getElementById("registro").addEventListener(
  "submit", async (evento) => {
    evento.preventDefault();

    try {
      await enviar(
        "/register",
        document.getElementById("regUsuario").value,
        document.getElementById("regPassword").value
      );
    } catch (error) {
      document.getElementById("resultado").textContent =
        "Error: " + error.message;
    }
  }
);

document.getElementById("login").addEventListener(
  "submit", async (evento) => {
    evento.preventDefault();

    try {
      await enviar(
        "/login",
        document.getElementById("loginUsuario").value,
        document.getElementById("loginPassword").value
      );
    } catch (error) {
      document.getElementById("resultado").textContent =
        "Error: " + error.message;
    }
  }
);
