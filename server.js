// server.js (CommonJS)
const express = require("express");
const path = require("path");
const cors = require("cors");

// ⚠️ NO hacer nada “pesado” aquí (como conectar a DB) que pueda tumbar el server al arrancar
const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());

// Servir estáticos del frontend
const publicDir = path.join(__dirname, "frontend");
app.use(express.static(publicDir));

// Healthchecks (Railway hace ping a estas rutas)
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/ping", (_req, res) => res.status(200).json({ pong: true }));

// Ruta raíz → index.html
app.get("/", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Favicon (evita 502 por /favicon.ico)
app.get("/favicon.ico", (_req, res) => {
  res.sendFile(path.join(publicDir, "favicon.ico"));
});

// Arranque
app.listen(PORT, () => {
  console.log(`🚀 Servidor NEÓN-R escuchando en: ${PORT}`);
});
