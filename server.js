
const http = require("http");
const fs = require("fs");
const path = require("path");

const usuarios = new Map();

const servidor = http.createServer((req, res) => {
  function json(estado, mensaje) {
    res.writeHead(estado, {
      "Content-Type": "application/json; charset=utf-8"
    });
    res.end(JSON.stringify({ mensaje }));
  }

  if (req.method === "GET" &&
      (req.url === "/" || req.url === "/script.js")) {
    const archivo = req.url === "/"
      ? "index.html"
      : "script.js";

    res.writeHead(200, {
      "Content-Type": archivo.endsWith(".js")
        ? "text/javascript"
        : "text/html"
    });

    fs.createReadStream(path.join(__dirname, archivo))
      .pipe(res);
    return;
  }

  if (req.method === "POST" &&
      (req.url === "/register" || req.url === "/login")) {
    let cuerpo = "";

    req.on("data", fragmento => {
      cuerpo += fragmento;
      if (cuerpo.length > 10000) req.destroy();
    });

    req.on("end", () => {
      let datos;
      try {
        datos = JSON.parse(cuerpo);
      } catch {
        return json(400, "Solicitud JSON inválida");
      }

      const { usuario, passwordHash } = datos;

      if (typeof usuario !== "string" ||
          usuario.length < 1 || usuario.length > 50 ||
          typeof passwordHash !== "string" ||
          !/^[a-f0-9]{64}$/.test(passwordHash)) {
        return json(400, "Datos de autenticación inválidos");
      }

      if (req.url === "/register") {
        if (usuarios.has(usuario)) {
          return json(409, "El usuario ya existe");
        }

        usuarios.set(usuario, passwordHash);
        return json(201, "Usuario registrado correctamente");
      }

      if (usuarios.get(usuario) === passwordHash) {
        return json(200, "LOGIN EXITOSO");
      }

      return json(401, "Usuario o contraseña incorrectos");
    });
    return;
  }

  json(404, "Ruta no encontrada");
});

servidor.listen(3000, "127.0.0.1", () => {
  console.log("Servidor disponible en http://127.0.0.1:3000");
});
