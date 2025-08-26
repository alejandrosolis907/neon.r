const express = require('express');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 8080;

// Servir archivos estáticos desde "frontend"
app.use(express.static(path.join(__dirname, 'frontend')));

// Ruta raíz: enviar index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Ruta favicon (para evitar el error 502)
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'favicon.ico'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor NEÓN-R escuchando en puerto ${PORT}`);
});
